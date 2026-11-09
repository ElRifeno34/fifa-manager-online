/**
 * Collective level of the clubs. Market value exaggerates the gaps between clubs: fitted on the
 * 2026-27 odds, clubs above their league's average play about 0.56 % below their squad per point of
 * best-eleven gap, and clubs below it as much above. That structural part follows the squads every
 * season; what remains of the odds fit is the club's form, which fades.
 */
import { squadStrength } from "@fmo/engine";
import { toEngine } from "./state.ts";
import type { CareerPlayer, CareerState } from "./types.ts";

/** Adjustment per point of best-eleven gap to the league average (regression on 346 clubs). */
const GAP_COMPRESSION = -0.0056;
const LIMIT = 0.15;

/** Three decimals, and never a negative zero (it would not survive a save). */
export const round3 = (x: number) => Number(x.toFixed(3)) || 0;

const rawStrength = (squad: CareerPlayer[]) => squadStrength(squad.map(toEngine));

function structuralByLeague(state: CareerState, squads: Map<string, CareerPlayer[]>) {
  const structural = new Map<string, number>();
  for (const league of state.leagues) {
    const clubs = Object.values(state.clubs).filter((c) => c.leagueId === league.id);
    const levels = clubs.map((c) => rawStrength(squads.get(c.id) ?? []));
    const mean = levels.reduce((s, x) => s + x, 0) / Math.max(levels.length, 1);
    clubs.forEach((c, i) => {
      const value = GAP_COMPRESSION * (levels[i]! - mean);
      structural.set(c.id, Math.max(-LIMIT, Math.min(LIMIT, value)));
    });
  }
  return structural;
}

/** At career start: the pack's fitted adjustment splits into structure and form. */
export function splitLevelAdjustments(state: CareerState, squads: Map<string, CareerPlayer[]>) {
  const structural = structuralByLeague(state, squads);
  for (const league of state.leagues) {
    const clubs = Object.values(state.clubs).filter((c) => c.leagueId === league.id);
    /* Leagues without odds (no fit) only get the structural part. */
    const fitted = clubs.some((c) => c.levelAdjustment !== 0);
    for (const c of clubs) {
      const s = structural.get(c.id)!;
      c.formAdjustment = fitted ? round3(c.levelAdjustment - s) : 0;
      c.levelAdjustment = round3(s + c.formAdjustment);
    }
  }
}

/** Recomputes each club's adjustment from its current squad, its league and its form. */
export function refreshLevelAdjustments(state: CareerState, squads: Map<string, CareerPlayer[]>) {
  const structural = structuralByLeague(state, squads);
  for (const c of Object.values(state.clubs)) {
    c.levelAdjustment = round3((structural.get(c.id) ?? 0) + c.formAdjustment);
  }
}
