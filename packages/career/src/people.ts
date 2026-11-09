/** Players as people: personality, market value, contracts and morale. */
import { autoTeamSheet, createRng, deriveSeed, type Rng } from "@fmo/engine";
import { toEngine } from "./state.ts";
import { ageOn, seasonLabel } from "./calendar.ts";
import type { CareerPlayer, CareerState, Personality } from "./types.ts";

/** Hidden traits drawn once, from the player's id: the same player keeps the same character. */
export function personalityFor(seed: number, playerId: string): Personality {
  const rng = createRng(deriveSeed(seed, "personality", playerId));
  /* Average of two draws: most players are ordinary, a few stand out. */
  const trait = () => Math.round((rng.int(1, 20) + rng.int(1, 20)) / 2);
  return {
    ambition: trait(),
    loyalty: trait(),
    temperament: trait(),
    professionalism: trait(),
  };
}

/**
 * Market value from level and age, the inverse of how the packs derive a level from value: worth
 * more young and with room to grow, less after 29.
 */
export function estimateValue(overall: number, age: number): number {
  let value = 10 ** ((overall - 62) / 13 + 6);
  if (age < 24) value *= 1 + (24 - age) * 0.08;
  if (age > 29) value *= Math.max(0.2, 1 - (age - 29) * 0.12);
  return Math.round(value / 50_000) * 50_000;
}

export const valueOf = (p: CareerPlayer, date: string) =>
  p.marketValueEur ?? estimateValue(p.overall, ageOn(p.birthDate, date));

/** Season label `years` after the one starting on `start`. */
export const seasonsAfter = (start: string, years: number) =>
  seasonLabel(`${Number(start.slice(0, 4)) + years}${start.slice(4)}`);

/** Contract length a club offers by age: long for the young, short for veterans. */
export function contractYears(age: number, rng: Rng): number {
  if (age < 23) return rng.int(2, 5);
  if (age < 30) return rng.int(1, 4);
  if (age < 33) return rng.int(1, 2);
  return 1;
}

/**
 * Wages of a squad, sharing the club's wage bill by value: stars earn far more, but not in
 * proportion (value to the power 0.7).
 */
export function shareWages(
  players: CareerPlayer[],
  weeklyBill: number,
  date: string,
  floor: number,
) {
  const weights = players.map((p) => valueOf(p, date) ** 0.7);
  const total = weights.reduce((s, w) => s + w, 0) || 1;
  return players.map((p, i) =>
    Math.max(floor, Math.round((weeklyBill * weights[i]!) / total / 100) * 100),
  );
}

export type Role = "key" | "regular" | "rotation" | "backup";

/**
 * Status in the squad: the club's best eleven expect to play (its five best are key players), the
 * first substitutes some of the time, the rest little.
 */
export function rolesOf(squad: CareerPlayer[]): Map<string, Role> {
  if (squad.length < 11) return new Map(squad.map((p) => [p.id, "regular"]));
  const roles = new Map<string, Role>(squad.map((p) => [p.id, "backup"]));
  /* The best eleven by position: a second keeper is a substitute, whatever his level. */
  const sheet = autoTeamSheet({ clubId: "", squad: squad.map(toEngine), reputation: 3 });
  const starters = sheet.starters.map((s) => s.player).sort((a, b) => b.overall - a.overall);
  starters.forEach((p, i) => roles.set(p.id, i < 5 ? "key" : "regular"));
  sheet.bench.slice(0, 7).forEach((p) => roles.set(p.id, "rotation"));
  return roles;
}

const clamp = (x: number) => Math.max(0, Math.min(100, x));

/**
 * After a club match: results move everyone a little; playing time moves each player by what his
 * role led him to expect, more so when he is ambitious. Morale drifts back towards 60 over time.
 */
export function updateMorale(
  squad: CareerPlayer[],
  minutes: Map<string, number>,
  outcome: "win" | "draw" | "loss",
) {
  const roles = rolesOf(squad);
  for (const p of squad) {
    const played = minutes.get(p.id) ?? 0;
    const role = roles.get(p.id)!;
    const ambition = p.personality.ambition / 10;
    let delta = outcome === "win" ? 2 : outcome === "loss" ? -2 : 0;
    if (played >= 60) delta += role === "backup" ? 3 : role === "rotation" ? 2 : 1;
    else if (played === 0 && !p.injury && p.suspension === 0) {
      delta -=
        (role === "key" ? 4 : role === "regular" ? 2.5 : role === "rotation" ? 1 : 0.3) * ambition;
    }
    /* Professionals take setbacks better. */
    if (delta < 0) delta *= 1.2 - p.personality.professionalism / 40;
    delta = Math.max(-6, Math.min(6, delta));
    p.morale = clamp(p.morale + delta + (60 - p.morale) * 0.05);
  }
}

export function initialMorale(seed: number, playerId: string): number {
  const rng = createRng(deriveSeed(seed, "morale", playerId));
  return rng.int(52, 70);
}

/** Players of the manager's club whose contract ends this season. */
export const expiring = (state: CareerState, clubId: string) =>
  Object.values(state.players).filter(
    (p) => p.clubId === clubId && p.contract?.until === state.season.label,
  );
