/**
 * The club AI's mercato: once a week while a window is open, each club looks at its squad, buys
 * where it is short or where a starter is weak, within its budgets, and bids for the manager's
 * players like anyone else's.
 */
import { createRng, deriveSeed, type Rng } from "@fmo/engine";
import { addDays, ageOn, daysBetween } from "./calendar.ts";
import { weeklyWages } from "./finance.ts";
import { contractYears, rolesOf, seasonsAfter, valueOf, type Role } from "./people.ts";
import { post } from "./state.ts";
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
const MAX_SIGNINGS = 3;

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
      if (shop(state, club, squads, rng, rolesIn)) {
        roles.clear();
      }
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
  const roles = rolesIn(club.id);
  const starters = squad.filter((p) => roles.get(p.id) === "key" || roles.get(p.id) === "regular");
  if (short) {
    if (!rng.chance(0.6)) return false;
    const levels = squad.map((p) => p.overall).sort((a, b) => a - b);
    bar = (levels[Math.floor(levels.length / 2)] ?? 60) - 3;
    wanted = (p) => LINE_OF[p.position] === short;
  } else {
    if (!rng.chance(0.25) || starters.length === 0) return false;
    const weakest = [...starters].sort((a, b) => a.overall - b.overall)[0]!;
    bar = weakest.overall + 3;
    wanted = (p) => p.position === weakest.position;
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
  if (candidates.length === 0) return false;
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
