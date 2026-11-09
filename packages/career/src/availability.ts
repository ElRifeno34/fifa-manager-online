/** Injuries and suspensions: who can play on a given day. */
import { createRng, deriveSeed, weightedIndex, type MatchResult } from "@fmo/engine";
import { addDays } from "./calendar.ts";
import { post } from "./state.ts";
import type { CareerFixture, CareerPlayer, CareerState } from "./types.ts";

export const isAvailable = (p: CareerPlayer, date: string) =>
  p.suspension === 0 && (!p.injury || p.injury.until <= date);

/** Injury kinds: share of injuries, then length in days. */
const INJURIES: { kind: string; weight: number; days: [number, number] }[] = [
  { kind: "contracture", weight: 45, days: [3, 10] },
  { kind: "entorse", weight: 25, days: [10, 28] },
  { kind: "déchirure musculaire", weight: 22, days: [21, 56] },
  { kind: "fracture", weight: 5, days: [42, 90] },
  { kind: "rupture des ligaments croisés", weight: 3, days: [150, 240] },
];

/** Chance of an injury over 90 minutes, rising with fatigue. */
const injuryChance = (fatigue: number, minutes: number) =>
  (0.022 + fatigue * 0.0003) * (minutes / 90);

/** Yellow cards that bring a one-match ban, then every this many more. */
const YELLOW_LIMIT = 5;

/**
 * After a match: players who sat out a ban count it down, then the match brings its own injuries
 * and bans.
 */
export function afterMatch(
  state: CareerState,
  fixture: CareerFixture,
  result: MatchResult,
  squads: Map<string, CareerPlayer[]>,
  yellowsBefore: Map<string, number>,
) {
  const rng = createRng(deriveSeed(state.seed, state.season.label, fixture.id, "availability"));
  const playedIds = new Set(result.players.map((l) => l.playerId));
  for (const clubId of [fixture.homeClubId, fixture.awayClubId]) {
    for (const p of squads.get(clubId) ?? []) {
      if (p.suspension > 0 && !playedIds.has(p.id)) p.suspension--;
    }
  }
  const mine = (p: CareerPlayer) => p.clubId === state.manager.clubId;
  for (const line of result.players) {
    const p = state.players[line.playerId];
    if (!p || line.minutes === 0) continue;
    if (rng.chance(injuryChance(line.fatigue, line.minutes))) {
      const injury =
        INJURIES[
          weightedIndex(
            rng,
            INJURIES.map((i) => i.weight),
          )
        ]!;
      const days = rng.int(injury.days[0], injury.days[1]);
      p.injury = { kind: injury.kind, until: addDays(state.date, days) };
      p.morale = Math.max(0, p.morale - 5);
      if (mine(p)) {
        post(
          state,
          "injury",
          `${p.name} blessé`,
          `${capitalise(injury.kind)} : environ ${weeks(days)} d'absence.`,
        );
      }
    }
    if (line.redCard) {
      const secondYellow = result.events.some(
        (e) => e.type === "red" && e.playerId === p.id && e.detail === "second yellow",
      );
      p.suspension += secondYellow ? 1 : 2;
      if (mine(p)) {
        post(
          state,
          "suspension",
          `${p.name} suspendu`,
          `Exclu, il manquera ${p.suspension} match(s).`,
        );
      }
    }
    const before = yellowsBefore.get(p.id) ?? 0;
    if (Math.floor(p.season.yellows / YELLOW_LIMIT) > Math.floor(before / YELLOW_LIMIT)) {
      p.suspension += 1;
      if (mine(p)) {
        post(
          state,
          "suspension",
          `${p.name} suspendu`,
          `${p.season.yellows} cartons jaunes : un match de suspension.`,
        );
      }
    }
  }
}

/** Players back from injury today. */
export function healed(state: CareerState) {
  for (const p of Object.values(state.players)) {
    if (p.injury && p.injury.until <= state.date) {
      if (p.clubId === state.manager.clubId) {
        post(state, "injury", `${p.name} est rétabli`, "Il est de nouveau disponible.");
      }
      p.injury = null;
    }
  }
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const weeks = (days: number) => (days < 14 ? `${days} jours` : `${Math.round(days / 7)} semaines`);
