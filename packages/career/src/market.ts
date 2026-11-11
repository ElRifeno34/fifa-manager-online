/**
 * The club AI's mercato: once a week while a window is open, each club looks at its squad, buys
 * where it is short or where a starter is weak, within its budgets, and bids for the manager's
 * players like anyone else's.
 */
import { createRng, deriveSeed, type Rng } from "@fmo/engine";
import { addDays, ageOn, daysBetween } from "./calendar.ts";
import { weeklyWages } from "./finance.ts";
import { deriveAttributes } from "@fmo/data";
import { COUNTRIES, poolFor } from "./names.ts";
import {
  contractYears,
  estimateValue,
  initialMorale,
  personalityFor,
  rolesOf,
  seasonsAfter,
  valueOf,
  type Role,
} from "./people.ts";
import { newSeasonStats, post } from "./state.ts";
import { ABROAD } from "./types.ts";
import { refreshLevelAdjustments } from "./strength.ts";
import {
  askingPrice,
  isWindowOpen,
  marketWage,
  MIN_SQUAD_TO_SELL,
  money,
  transferPlayer,
} from "./transfers.ts";
import type { CareerClub, CareerPlayer, CareerState } from "./types.ts";

type Line = "goal" | "defence" | "midfield" | "attack";
const LINE_OF: Record<CareerPlayer["position"], Line> = {
  GB: "goal",
  DC: "defence",
  DG: "defence",
  DD: "defence",
  MDC: "midfield",
  MC: "midfield",
  MOC: "midfield",
  MG: "midfield",
  MD: "midfield",
  AG: "attack",
  AD: "attack",
  BU: "attack",
};
/** Players a club wants in each line. */
const DEPTH: Record<Line, number> = { goal: 2, defence: 7, midfield: 7, attack: 5 };
/** Signings a club makes at most per window. */
const MAX_SIGNINGS = 4;
/** Share of the club AI's signings made abroad rather than in the game's leagues. */
const IMPORT_CHANCE = 0.3;
const LINE_POSITIONS: Record<Line, CareerPlayer["position"][]> = {
  goal: ["GB"],
  defence: ["DC", "DC", "DG", "DD"],
  midfield: ["MC", "MC", "MDC", "MOC", "MG", "MD"],
  attack: ["BU", "BU", "AG", "AD"],
};
/** Chance, each market week, that a foreign club buys one of a club's players. */
const ABROAD_CHANCE = 0.06;

/** Start of the window open today, to count what each club already did in it. */
function windowStart(state: CareerState): string {
  const day = daysBetween(state.season.start, state.date);
  return day <= 17 ? addDays(state.season.start, -60) : addDays(state.season.start, 139);
}

/** Runs the weekly market days due up to today. */
export function marketWeeks(state: CareerState, squads: Map<string, CareerPlayer[]>) {
  while (daysBetween(state.marketDay, state.date) >= 7) {
    state.marketDay = addDays(state.marketDay, 7);
    if (!isWindowOpen(state)) continue;
    const rng = createRng(deriveSeed(state.seed, "market", state.marketDay));
    remindExpiring(state);
    /* Each club's roles, computed once for the day: they set asking prices. */
    const roles = new Map<string, Map<string, Role>>();
    const rolesIn = (clubId: string) => {
      let r = roles.get(clubId);
      if (!r) {
        r = rolesOf(squads.get(clubId) ?? []);
        roles.set(clubId, r);
      }
      return r;
    };
    for (const club of Object.values(state.clubs)) {
      if (club.id === state.manager.clubId) continue;
      if (club.finance.balance < -club.finance.revenue * 0.05) listForSale(club, squads, rolesIn);
      if (shop(state, club, squads, rng, rolesIn)) roles.clear();
      if (rng.chance(ABROAD_CHANCE) && sellAbroad(state, club, squads, rng, rolesIn)) roles.clear();
    }
    /* Signings change the squads, and so the clubs' collective level. */
    refreshLevelAdjustments(state, squads);
  }
}

/** Returns true when the club signed someone (squads changed). */
function shop(
  state: CareerState,
  club: CareerClub,
  squads: Map<string, CareerPlayer[]>,
  rng: Rng,
  rolesIn: (clubId: string) => Map<string, Role>,
): boolean {
  const since = windowStart(state);
  const signed = state.transfers.filter((t) => t.toId === club.id && t.date >= since).length;
  if (signed >= MAX_SIGNINGS) return false;
  const squad = squads.get(club.id) ?? [];
  const counts: Record<Line, number> = { goal: 0, defence: 0, midfield: 0, attack: 0 };
  for (const p of squad) counts[LINE_OF[p.position]]++;
  const short = (Object.keys(DEPTH) as Line[]).find((l) => counts[l] < DEPTH[l]);

  /* Short of players in a line, or else a chance to upgrade the weakest starter. */
  let wanted: (p: CareerPlayer) => boolean;
  let bar: number;
  let position: CareerPlayer["position"];
  const roles = rolesIn(club.id);
  const starters = squad.filter((p) => roles.get(p.id) === "key" || roles.get(p.id) === "regular");
  if (short) {
    if (!rng.chance(0.8)) return false;
    const levels = squad.map((p) => p.overall).sort((a, b) => a - b);
    bar = (levels[Math.floor(levels.length / 2)] ?? 60) - 3;
    wanted = (p) => LINE_OF[p.position] === short;
    position = rng.pick(LINE_POSITIONS[short]);
  } else {
    if (!rng.chance(0.35) || starters.length === 0) return false;
    const weakest = [...starters].sort((a, b) => a.overall - b.overall)[0]!;
    bar = weakest.overall + 3;
    wanted = (p) => p.position === weakest.position;
    position = weakest.position;
  }

  const f = club.finance;
  const wageRoom = f.wageBudget * 1.05 - weeklyWages(squad);
  const candidates: { p: CareerPlayer; price: number; wage: number }[] = [];
  for (const p of Object.values(state.players)) {
    if (p.retired || p.clubId === club.id || !wanted(p) || p.overall < bar) continue;
    if (ageOn(p.birthDate, state.date) > 32 || (p.injury && p.injury.until > state.date)) continue;
    if (p.clubId && (squads.get(p.clubId)?.length ?? 0) <= MIN_SQUAD_TO_SELL) continue;
    if (state.offers.some((o) => o.playerId === p.id && o.status === "open")) continue;
    const price = p.clubId ? askingPrice(state, p.id, rolesIn(p.clubId)) : 0;
    const wage = Math.max(p.contract?.wage ?? 0, marketWage(valueOf(p, state.date)));
    if (price > f.transferBudget || wage > wageRoom) continue;
    candidates.push({ p, price, wage });
  }
  /* Some signings come from abroad: talent in, money out of the game. */
  if (candidates.length === 0 || rng.chance(IMPORT_CHANCE)) {
    if (importPlayer(state, club, squads, position, bar, wageRoom, rng)) return true;
    if (candidates.length === 0) return false;
  }
  /* The best level for the money, with some taste: one of the five best picks. */
  const score = (c: (typeof candidates)[number]) =>
    c.p.overall - 4 * Math.log10(1 + c.price / 1e6) + (c.p.listed ? 3 : 0);
  candidates.sort((a, b) => score(b) - score(a));
  const choice = candidates[rng.int(0, Math.min(4, candidates.length - 1))]!;
  const { p } = choice;

  if (p.clubId === state.manager.clubId) {
    const fee = Math.round((choice.price * (0.8 + rng.next() * 0.2)) / 100_000) * 100_000;
    const limit = Math.min(f.transferBudget, Math.round(choice.price * (1 + rng.next() * 0.25)));
    state.offers.push({
      id: state.nextId++,
      date: state.date,
      buyerId: club.id,
      playerId: p.id,
      fee,
      limit,
      round: 0,
      status: "open",
    });
    post(state, "offer", `Offre pour ${p.name}`, `${club.name} propose ${money(fee)}.`);
    return false;
  }
  const fee = p.clubId ? Math.round(choice.price * (0.95 + rng.next() * 0.1)) : 0;
  const years = contractYears(ageOn(p.birthDate, state.date), rng);
  const index = squads.get(club.id);
  transferPlayer(state, p, club.id, fee, {
    wage: Math.round(choice.wage / 100) * 100,
    until: seasonsAfter(state.season.start, years - 1),
  });
  /* Keep the index of squads true for the other clubs shopping this week. */
  if (choice.p.clubId) {
    for (const [id, list] of squads) {
      const at = list.indexOf(p);
      if (at >= 0 && id !== club.id) list.splice(at, 1);
    }
  }
  index?.push(p);
  return true;
}

/** When the winter window opens, the assistant lists the contracts ending in the summer. */
function remindExpiring(state: CareerState) {
  const day = daysBetween(state.season.start, state.date);
  if (day < 139 || day >= 146) return;
  const ending = Object.values(state.players).filter(
    (p) => p.clubId === state.manager.clubId && p.contract?.until === state.season.label,
  );
  if (ending.length) {
    post(
      state,
      "contract",
      "Contrats en fin de saison",
      `Sans prolongation, partiront libres cet été : ${ending.map((p) => p.name).join(", ")}.`,
    );
  }
}

/** A club in debt puts its most valuable players who are not key men up for sale. */
function listForSale(
  club: CareerClub,
  squads: Map<string, CareerPlayer[]>,
  rolesIn: (clubId: string) => Map<string, Role>,
) {
  const roles = rolesIn(club.id);
  const forSale = (squads.get(club.id) ?? [])
    .filter((p) => roles.get(p.id) !== "key" && !p.listed)
    .sort((a, b) => (b.marketValueEur ?? 0) - (a.marketValueEur ?? 0))
    .slice(0, 2);
  for (const p of forSale) p.listed = true;
}

/**
 * Players also leave for leagues outside the game: a foreign club pays the asking price, the money
 * comes in and the player is gone. This keeps talent and cash flowing out of a closed world.
 */
function sellAbroad(
  state: CareerState,
  club: CareerClub,
  squads: Map<string, CareerPlayer[]>,
  rng: Rng,
  rolesIn: (clubId: string) => Map<string, Role>,
): boolean {
  const squad = squads.get(club.id) ?? [];
  if (squad.length <= MIN_SQUAD_TO_SELL + 2) return false;
  const keepers = squad.filter((p) => p.position === "GB").length;
  const options = squad.filter(
    (p) =>
      ageOn(p.birthDate, state.date) <= 30 &&
      valueOf(p, state.date) >= 1_000_000 &&
      (p.position !== "GB" || keepers > 2),
  );
  if (!options.length) return false;
  const weights = options.map((p) => valueOf(p, state.date) ** 0.5);
  const total = weights.reduce((s, w) => s + w, 0);
  let roll = rng.next() * total;
  let p = options[0]!;
  for (let i = 0; i < options.length; i++) {
    roll -= weights[i]!;
    if (roll <= 0) {
      p = options[i]!;
      break;
    }
  }
  const fee =
    Math.round((askingPrice(state, p.id, rolesIn(club.id)) * (0.9 + rng.next() * 0.25)) / 100_000) *
    100_000;
  club.finance.balance += fee;
  club.finance.transfers -= fee;
  club.finance.transferBudget += Math.round(fee * 0.5);
  state.transfers.push({ date: state.date, playerId: p.id, fromId: club.id, toId: ABROAD, fee });
  p.clubId = null;
  p.contract = null;
  p.number = null;
  p.listed = false;
  p.retired = true;
  p.abroad = true;
  squad.splice(squad.indexOf(p), 1);
  return true;
}

/** Signs a player from a league outside the game, at the level the club is looking for. */
function importPlayer(
  state: CareerState,
  club: CareerClub,
  squads: Map<string, CareerPlayer[]>,
  position: CareerPlayer["position"],
  bar: number,
  wageRoom: number,
  rng: Rng,
): boolean {
  const age = rng.int(21, 29);
  const overall = Math.round(Math.min(90, bar + rng.int(0, 4)));
  const value = estimateValue(overall, age);
  const fee = Math.round((value * (0.9 + rng.next() * 0.2)) / 100_000) * 100_000;
  const wage = marketWage(value);
  if (fee > club.finance.transferBudget || wage > wageRoom) return false;
  const id = `gen-${state.nextId++}`;
  const pool = poolFor(rng.pick(COUNTRIES));
  const squad = squads.get(club.id) ?? [];
  const numbers = new Set(squad.map((p) => p.number));
  let number = 2;
  while (numbers.has(number) && number < 99) number++;
  const player: CareerPlayer = {
    id,
    name: `${rng.pick(pool.first)} ${rng.pick(pool.last)}`,
    nationality: pool.nationality,
    birthDate: addDays(
      `${Number(state.date.slice(0, 4)) - age}${state.date.slice(4)}`,
      -rng.int(0, 364),
    ),
    foot: rng.chance(0.25) ? "left" : "right",
    heightCm: rng.int(170, 192),
    number,
    position,
    secondaryPositions: [],
    overall,
    potential: Math.min(94, overall + Math.max(0, 25 - age) * 2),
    attributes: deriveAttributes({ id, position, overall, age, heightCm: null, performance: null }),
    marketValueEur: value,
    clubId: club.id,
    retired: false,
    contract: { wage, until: seasonsAfter(state.season.start, contractYears(age, rng) - 1) },
    personality: personalityFor(state.seed, id),
    morale: initialMorale(state.seed, id),
    injury: null,
    suspension: 0,
    trainingFocus: null,
    listed: false,
    generated: true,
    fatigue: 0,
    fatigueDate: null,
    ratings: [],
    season: newSeasonStats(),
    history: [],
  };
  state.players[id] = player;
  club.finance.balance -= fee;
  club.finance.transfers += fee;
  club.finance.transferBudget = Math.max(0, club.finance.transferBudget - fee);
  state.transfers.push({ date: state.date, playerId: id, fromId: ABROAD, toId: club.id, fee });
  squad.push(player);
  return true;
}
