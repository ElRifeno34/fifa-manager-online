/** Small helpers shared by every rule of the career. */
import {
  formFromRatings,
  recoveredFatigue,
  type EnginePlayer,
  type PlayerCondition,
} from "@fmo/engine";
import type { CareerPlayer, CareerState, InboxKind, PlayerSeason } from "./types.ts";

export const newSeasonStats = (): PlayerSeason => ({
  apps: 0,
  minutes: 0,
  goals: 0,
  assists: 0,
  ratingSum: 0,
  yellows: 0,
  reds: 0,
  starts: 0,
});

export function post(state: CareerState, kind: InboxKind, title: string, body: string) {
  state.inbox.push({ id: state.nextId++, date: state.date, kind, title, body, read: false });
}

/** Every club's active players, built once per match day rather than per lookup. */
export function indexSquads(state: CareerState): Map<string, CareerPlayer[]> {
  const squads = new Map<string, CareerPlayer[]>(Object.keys(state.clubs).map((id) => [id, []]));
  for (const p of Object.values(state.players)) if (p.clubId) squads.get(p.clubId)?.push(p);
  return squads;
}

/** Active players of a club. */
export const squadOf = (state: CareerState, clubId: string): CareerPlayer[] =>
  Object.values(state.players).filter((p) => p.clubId === clubId);

/** The engine's view of a player. */
export const toEngine = (p: CareerPlayer): EnginePlayer => ({
  id: p.id,
  name: p.name,
  position: p.position,
  secondaryPositions: p.secondaryPositions,
  overall: p.overall,
  attributes: p.attributes,
});

/** Fatigue (after rest) and form of a player on a date. */
export const conditionOf = (p: CareerPlayer, date: string): PlayerCondition => ({
  fatigue: recoveredFatigue(p.fatigue, p.fatigueDate, date, p.attributes.stamina),
  /* Morale adds to form: a happy player plays a little above himself. */
  form: Math.max(-1, Math.min(1, formFromRatings(p.ratings) + (p.morale - 60) / 80)),
});

export const clubsOf = (state: CareerState, leagueId: string) =>
  Object.values(state.clubs)
    .filter((c) => c.leagueId === leagueId)
    .map((c) => c.id)
    .sort();
