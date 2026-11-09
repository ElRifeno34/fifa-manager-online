/**
 * Transfers and contracts. The manager negotiates in two steps, three rounds at most each: the fee
 * with the selling club, then the wage with the player. Prices follow the player's value, his
 * importance to his club and the time left on his contract; wages follow his value, his ambition
 * and how attractive the buying club is.
 */
import { ageOn, daysBetween } from "./calendar.ts";
import { weeklyWages } from "./finance.ts";
import { rolesOf, seasonsAfter, valueOf, type Role } from "./people.ts";
import { blockedMove, makePromise } from "./player-talk.ts";
import { post, squadOf } from "./state.ts";
import type { CareerPlayer, CareerState, Negotiation, NegotiationKind } from "./types.ts";

export const MAX_ROUNDS = 3;
/** A club will not sell below this many players. */
export const MIN_SQUAD_TO_SELL = 18;
/** After talks fail, the same player cannot be approached again for this long. */
const COOLDOWN_DAYS = 30;

/**
 * Two windows a season: the summer one, open from the end of the previous season until about
 * two weeks into the new one, and a winter one of a month in the middle of the season.
 */
export function isWindowOpen(state: CareerState): boolean {
  const day = daysBetween(state.season.start, state.date);
  return day <= 17 || (day >= 139 && day <= 170);
}

const ROLE_PRICE: Record<Role, number> = { key: 1.6, regular: 1.3, rotation: 1, backup: 0.8 };

const seasonsLeft = (state: CareerState, p: CareerPlayer) =>
  p.contract ? Number(p.contract.until.slice(0, 4)) - Number(state.season.label.slice(0, 4)) : 0;

/** What the selling club wants: value, times his importance, less when his contract runs out. */
export function askingPrice(
  state: CareerState,
  playerId: string,
  roles?: Map<string, Role>,
): number {
  const p = state.players[playerId]!;
  if (!p.clubId) return 0;
  const role = (roles ?? rolesOf(squadOf(state, p.clubId))).get(p.id) ?? "rotation";
  const left = seasonsLeft(state, p);
  const contract = left <= 0 ? 0.5 : left === 1 ? 0.8 : left === 2 ? 1 : 1.1;
  const listed = p.listed ? 0.85 : 1;
  return roundMoney(valueOf(p, state.date) * ROLE_PRICE[role] * contract * listed);
}

/** Going rate for a player's wage, from his value: about 250k a week at 100 M€, 7k at 1 M€. */
export const marketWage = (value: number) => Math.round((0.173 * value ** 0.77) / 100) * 100;

const roundMoney = (x: number) =>
  x >= 1_000_000 ? Math.round(x / 100_000) * 100_000 : Math.round(x / 10_000) * 10_000;

/**
 * What a player asks to sign: the going rate, more when ambitious, when the club is smaller than
 * his own or when he would barely play; a loyal player asks less to stay.
 */
export function wageDemand(
  state: CareerState,
  p: CareerPlayer,
  clubId: string,
  promise: Negotiation["promise"],
): number {
  const ambition = 0.9 + (p.personality.ambition - 10) * 0.02;
  let demand = marketWage(valueOf(p, state.date)) * ambition;
  const staying = p.clubId === clubId;
  if (staying) demand *= 1.05 - (p.personality.loyalty - 10) * 0.01;
  else if (p.contract) demand = Math.max(demand, p.contract.wage * 1.1);
  const from = p.clubId ? state.clubs[p.clubId]!.reputation : 0;
  const to = state.clubs[clubId]!.reputation;
  if (!staying && to < from) demand *= 1 + (from - to) * 0.1;
  if (promise === "key") demand *= 0.9;
  if (p.morale < 35 && staying) demand *= 1.15;
  return Math.max(500, Math.round(demand / 100) * 100);
}

export type Answer =
  | { status: "accepted" }
  | { status: "countered"; counter: number }
  | { status: "rejected"; reason: string };

function cooledDown(state: CareerState, playerId: string) {
  return !state.negotiations.some(
    (n) =>
      n.playerId === playerId &&
      n.stage === "failed" &&
      daysBetween(n.opened, state.date) < COOLDOWN_DAYS,
  );
}

const open = (state: CareerState, playerId: string) =>
  state.negotiations.find(
    (n) => n.playerId === playerId && (n.stage === "fee" || n.stage === "contract"),
  );

/** Starts talks for a player of another club, or a free agent. */
export function startTransfer(state: CareerState, playerId: string): Negotiation {
  const p = state.players[playerId];
  const mine = state.manager.clubId;
  if (!p || p.retired) throw new Error("Unknown or retired player");
  if (p.clubId === mine) throw new Error("He already plays for the club");
  if (p.clubId && !isWindowOpen(state)) throw new Error("The transfer window is closed");
  if (!cooledDown(state, playerId)) throw new Error("Talks failed recently; try again later");
  const existing = open(state, playerId);
  if (existing) return existing;
  const kind: NegotiationKind = p.clubId ? "transfer" : "free";
  const negotiation: Negotiation = {
    id: state.nextId++,
    kind,
    playerId,
    sellerId: p.clubId,
    stage: p.clubId ? "fee" : "contract",
    opened: state.date,
    round: 0,
    askingFee: p.clubId ? askingPrice(state, playerId) : 0,
    demandWage: wageDemand(state, p, mine, null),
    fee: p.clubId ? null : 0,
    promise: null,
  };
  state.negotiations.push(negotiation);
  return negotiation;
}

/** Starts talks to extend a contract at the manager's club. */
export function startRenewal(state: CareerState, playerId: string): Negotiation {
  const p = state.players[playerId];
  if (!p || p.clubId !== state.manager.clubId) throw new Error("Not a player of the club");
  if (!cooledDown(state, playerId)) throw new Error("Talks failed recently; try again later");
  const existing = open(state, playerId);
  if (existing) return existing;
  const negotiation: Negotiation = {
    id: state.nextId++,
    kind: "renewal",
    playerId,
    sellerId: null,
    stage: "contract",
    opened: state.date,
    round: 0,
    askingFee: 0,
    demandWage: wageDemand(state, p, state.manager.clubId, null),
    fee: null,
    promise: null,
  };
  state.negotiations.push(negotiation);
  return negotiation;
}

const negotiationOf = (state: CareerState, id: number) => {
  const n = state.negotiations.find((x) => x.id === id);
  if (!n) throw new Error("Unknown negotiation");
  return n;
};

/** Bargaining shared by both stages: accept, meet halfway, or refuse a lowball. */
function bargain(n: Negotiation, offer: number, asked: number, floor: number): Answer {
  n.round++;
  if (offer >= asked) return { status: "accepted" };
  if (n.round >= MAX_ROUNDS) {
    n.stage = "failed";
    return { status: "rejected", reason: "Les discussions sont rompues." };
  }
  if (offer < asked * floor) return { status: "countered", counter: asked };
  return { status: "countered", counter: Math.round((asked + offer) / 2 / 100) * 100 };
}

/** The manager's fee offer to the selling club. */
export function offerFee(state: CareerState, negotiationId: number, fee: number): Answer {
  const n = negotiationOf(state, negotiationId);
  if (n.stage !== "fee") throw new Error("Not negotiating a fee");
  if (!isWindowOpen(state)) throw new Error("The transfer window is closed");
  const club = state.clubs[state.manager.clubId]!;
  if (fee > club.finance.transferBudget) {
    return { status: "rejected", reason: "La direction refuse : budget transferts dépassé." };
  }
  const seller = squadOf(state, n.sellerId!);
  if (seller.length <= MIN_SQUAD_TO_SELL) {
    n.stage = "failed";
    return { status: "rejected", reason: "Le club ne veut pas vendre : effectif trop court." };
  }
  const answer = bargain(n, fee, n.askingFee, 0.75);
  if (answer.status === "accepted") {
    n.fee = fee;
    n.stage = "contract";
    n.round = 0;
  } else if (answer.status === "countered") n.askingFee = answer.counter;
  return answer;
}

/**
 * The manager's contract offer to the player: a weekly wage, a length in seasons and, if he
 * wants, a promise of playing time. Accepted, it completes the deal.
 */
export function offerContract(
  state: CareerState,
  negotiationId: number,
  offer: { wage: number; years: number; promise?: Negotiation["promise"] },
): Answer {
  const n = negotiationOf(state, negotiationId);
  if (n.stage !== "contract") throw new Error("Not negotiating a contract");
  const p = state.players[n.playerId]!;
  const mine = state.manager.clubId;
  const club = state.clubs[mine]!;
  if (offer.years < 1 || offer.years > 5) throw new Error("A contract lasts one to five seasons");
  /* The board keeps the wage bill within budget. */
  const current = n.kind === "renewal" ? (p.contract?.wage ?? 0) : 0;
  if (weeklyWages(squadOf(state, mine)) - current + offer.wage > club.finance.wageBudget * 1.05) {
    return { status: "rejected", reason: "La direction refuse : masse salariale dépassée." };
  }
  if (n.kind !== "renewal") {
    const from = p.clubId ? state.clubs[p.clubId]!.reputation : 0;
    if (p.personality.ambition >= 15 && club.reputation < from - 1) {
      n.stage = "failed";
      return {
        status: "rejected",
        reason: `${p.name} ne veut pas rejoindre un club moins ambitieux.`,
      };
    }
  }
  if (offer.promise !== undefined && offer.promise !== n.promise) {
    n.promise = offer.promise;
    n.demandWage = wageDemand(state, p, mine, n.promise);
  }
  /* Veterans want security: a short deal costs more. */
  const age = ageOn(p.birthDate, state.date);
  const asked = age >= 31 && offer.years < 2 ? Math.round(n.demandWage * 1.1) : n.demandWage;
  const answer = bargain(n, offer.wage, asked, 0.85);
  if (answer.status === "countered") n.demandWage = answer.counter;
  if (answer.status === "accepted") complete(state, n, offer.wage, offer.years);
  return answer;
}

function complete(state: CareerState, n: Negotiation, wage: number, years: number) {
  const p = state.players[n.playerId]!;
  const mine = state.manager.clubId;
  n.stage = "done";
  const contract = { wage, until: seasonsAfter(state.season.start, years - 1) };
  if (n.promise) makePromise(state, p, n.promise);
  if (n.kind === "renewal") {
    p.contract = contract;
    p.morale = Math.min(100, p.morale + 5);
    post(state, "contract", `${p.name} prolonge`, `Nouveau contrat jusqu'en ${contract.until}.`);
    return;
  }
  transferPlayer(state, p, mine, n.fee ?? 0, contract);
}

/** Moves a player to a club, paying the fee and giving him his new contract. */
export function transferPlayer(
  state: CareerState,
  p: CareerPlayer,
  toId: string,
  fee: number,
  contract: { wage: number; until: string },
) {
  const fromId = p.clubId;
  const buyer = state.clubs[toId]!.finance;
  buyer.balance -= fee;
  buyer.transfers += fee;
  buyer.transferBudget = Math.max(0, buyer.transferBudget - fee);
  if (fromId) {
    const seller = state.clubs[fromId]!.finance;
    seller.balance += fee;
    seller.transfers -= fee;
    seller.transferBudget += Math.round(fee * 0.5);
  }
  const numbers = new Set(squadOf(state, toId).map((x) => x.number));
  let number = p.number && !numbers.has(p.number) ? p.number : 2;
  while (numbers.has(number) && number < 99) number++;
  p.clubId = toId;
  p.number = number;
  p.contract = contract;
  p.morale = Math.min(100, p.morale + 10);
  p.listed = false;
  p.fatigueDate = state.date;
  state.transfers.push({ date: state.date, playerId: p.id, fromId, toId, fee });
  for (const n of state.negotiations) {
    if (n.playerId === p.id && (n.stage === "fee" || n.stage === "contract")) n.stage = "failed";
  }
  for (const o of state.offers)
    if (o.playerId === p.id && o.status === "open") o.status = "withdrawn";
  const mine = state.manager.clubId;
  if (toId === mine) {
    post(
      state,
      "transfer",
      `${p.name} signe au club`,
      `${fee ? `Transfert de ${money(fee)}` : "Arrivée libre"}, contrat jusqu'en ${contract.until}.`,
    );
  } else if (fromId === mine) {
    post(
      state,
      "transfer",
      `${p.name} quitte le club`,
      `Vendu à ${state.clubs[toId]!.name} pour ${money(fee)}.`,
    );
  }
}

/** Lets a player go: he leaves free, and the club pays half the wages left on his contract. */
export function releasePlayer(state: CareerState, playerId: string) {
  const p = state.players[playerId];
  if (!p || p.clubId !== state.manager.clubId) throw new Error("Not a player of the club");
  const weeksLeft = Math.max(1, seasonsLeft(state, p) + 1) * 40;
  const cost = Math.round(((p.contract?.wage ?? 0) * weeksLeft) / 2);
  const f = state.clubs[p.clubId]!.finance;
  f.balance -= cost;
  p.clubId = null;
  p.contract = null;
  p.number = null;
  post(state, "transfer", `${p.name} libéré`, `Indemnité de départ : ${money(cost)}.`);
  return cost;
}

/** The manager's answer to a bid: accept, refuse, or ask for more (three rounds at most). */
export function answerOffer(
  state: CareerState,
  offerId: number,
  answer: "accept" | "reject" | { counter: number },
): Answer {
  const offer = state.offers.find((o) => o.id === offerId && o.status === "open");
  if (!offer) throw new Error("No such open offer");
  const p = state.players[offer.playerId]!;
  if (answer === "reject") {
    offer.status = "rejected";
    blockedMove(state, p, offer.buyerId);
    return { status: "rejected", reason: "Offre refusée." };
  }
  const fee = answer === "accept" ? offer.fee : answer.counter;
  offer.round++;
  if (answer === "accept" || fee <= offer.limit) {
    offer.status = "accepted";
    const buyer = state.clubs[offer.buyerId]!;
    const wage = Math.max(p.contract?.wage ?? 0, marketWage(valueOf(p, state.date)));
    transferPlayer(state, p, buyer.id, fee, { wage, until: seasonsAfter(state.season.start, 3) });
    return { status: "accepted" };
  }
  if (offer.round >= MAX_ROUNDS) {
    offer.status = "withdrawn";
    return { status: "rejected", reason: `${state.clubs[offer.buyerId]!.name} retire son offre.` };
  }
  offer.fee = Math.min(offer.limit, Math.round((offer.fee + fee) / 2 / 100_000) * 100_000);
  return { status: "countered", counter: offer.fee };
}

export interface SearchFilters {
  position?: CareerPlayer["position"];
  maxAge?: number;
  minOverall?: number;
  maxValue?: number;
  freeOnly?: boolean;
}

/** Players the manager can look at, best first, with their value (not the exact asking price). */
export function searchPlayers(state: CareerState, filters: SearchFilters = {}, limit = 50) {
  return Object.values(state.players)
    .filter((p) => !p.retired && p.clubId !== state.manager.clubId)
    .filter((p) => !filters.freeOnly || !p.clubId)
    .filter((p) => !filters.position || p.position === filters.position)
    .filter((p) => !filters.maxAge || ageOn(p.birthDate, state.date) <= filters.maxAge)
    .filter((p) => !filters.minOverall || p.overall >= filters.minOverall)
    .filter((p) => !filters.maxValue || valueOf(p, state.date) <= filters.maxValue)
    .sort((a, b) => b.overall - a.overall)
    .slice(0, limit)
    .map((p) => ({
      player: p,
      value: valueOf(p, state.date),
      age: ageOn(p.birthDate, state.date),
    }));
}

/** Talks still open close with the window, except free agents and renewals. */
export function closeStaleTalks(state: CareerState) {
  if (isWindowOpen(state)) return;
  for (const n of state.negotiations) {
    if (n.kind === "transfer" && (n.stage === "fee" || n.stage === "contract")) n.stage = "failed";
  }
  for (const o of state.offers) if (o.status === "open") o.status = "withdrawn";
}

export const money = (x: number) =>
  x >= 1_000_000 ? `${(x / 1_000_000).toFixed(1)} M€` : `${Math.round(x / 1000)} k€`;
