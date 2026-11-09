/**
 * Weekly training: progression towards potential, fatigue and injury risk by intensity, and
 * familiarity with the club's system. The assistant plans the week when the manager does not, and
 * every other club follows the same advice.
 */
import {
  autoTeamSheet,
  createRng,
  deriveSeed,
  squadStrength,
  styleForReputation,
  type Attributes,
  type Tactics,
} from "@fmo/engine";
import { addDays, ageOn, daysBetween } from "./calendar.ts";
import { conditionOf, post, toEngine } from "./state.ts";
import type {
  CareerClub,
  CareerPlayer,
  CareerState,
  Familiarity,
  TrainingFocus,
  TrainingIntensity,
  TrainingPlan,
  TrainingTheme,
} from "./types.ts";

const INTENSITY: Record<TrainingIntensity, { growth: number; fatigue: number; injury: number }> = {
  light: { growth: 0.6, fatigue: 2, injury: 0.002 },
  normal: { growth: 1, fatigue: 5, injury: 0.004 },
  high: { growth: 1.35, fatigue: 10, injury: 0.009 },
};

/** Share of the gap to potential closed by a season of normal training, by age. */
function seasonRate(age: number): number {
  if (age <= 20) return 0.25;
  if (age <= 23) return 0.18;
  if (age <= 27) return 0.06;
  return 0;
}
const WEEKS_PER_SEASON = 40;

const THEME_ATTRIBUTES: Record<TrainingTheme, (keyof Attributes)[]> = {
  physical: ["pace", "stamina", "strength"],
  technical: ["passing", "dribbling", "finishing", "crossing"],
  tactical: ["positioning", "vision", "marking", "tackling"],
  setPieces: ["crossing", "finishing", "composure"],
  recovery: [],
};

const FOCUS_ATTRIBUTES: Record<TrainingFocus, (keyof Attributes)[]> = {
  attack: ["finishing", "dribbling", "positioning", "composure"],
  defence: ["tackling", "marking", "positioning", "strength"],
  physical: ["pace", "stamina", "strength"],
  technique: ["passing", "dribbling", "crossing", "vision"],
  mental: ["vision", "positioning", "composure"],
  goalkeeping: ["reflexes", "gkPositioning", "gkDistribution"],
};

const OUTFIELD_ONLY: (keyof Attributes)[] = ["reflexes", "gkPositioning", "gkDistribution"];

export const instructionsKey = (t: Tactics) => `${t.style}/${t.pressing}/${t.line}`;

/** Familiarity of a club with a set of tactics, 0 to 1, for the engine. */
export function familiarityWith(club: CareerClub, tactics: Tactics): number {
  const formation = club.familiarity.formations[tactics.formation] ?? 30;
  const instructions = club.familiarity.instructions[instructionsKey(tactics)] ?? 30;
  return (formation + instructions) / 200;
}

/** Practising a system (in training or in a match) makes it familiar; the others fade slowly. */
export function practise(familiarity: Familiarity, tactics: Tactics, amount: number) {
  const bump = (table: Record<string, number>, key: string) => {
    for (const k of Object.keys(table))
      if (k !== key) table[k] = Math.max(20, table[k]! - amount / 4);
    table[key] = Math.min(100, (table[key] ?? 30) + amount);
  };
  bump(familiarity.formations, tactics.formation);
  bump(familiarity.instructions, instructionsKey(tactics));
}

/**
 * The assistant's plan: recover after a tiring week, go light on the eve of a match, drill the
 * system when it is not yet known, otherwise alternate technique and fitness; train hard only with
 * a week free and fresh legs.
 */
export function suggestTraining(
  state: CareerState,
  clubId: string,
  squad: CareerPlayer[],
): TrainingPlan {
  const next = state.fixtures.find(
    (f) =>
      !f.result && f.date >= state.date && (f.homeClubId === clubId || f.awayClubId === clubId),
  );
  const daysToMatch = next ? daysBetween(state.date, next.date) : 30;
  const fatigue =
    squad.reduce((s, p) => s + conditionOf(p, state.date).fatigue, 0) / Math.max(squad.length, 1);
  const club = state.clubs[clubId]!;
  const known = club.tactics ? familiarityWith(club, club.tactics) : 1;
  if (fatigue > 30) return { intensity: "light", theme: "recovery" };
  const intensity: TrainingIntensity =
    daysToMatch <= 1 ? "light" : daysToMatch >= 6 && fatigue < 10 ? "high" : "normal";
  if (known < 0.6) return { intensity, theme: "tactical" };
  const week = Math.floor(daysBetween(state.season.start, state.date) / 7);
  return { intensity, theme: week % 2 === 0 ? "technical" : "physical" };
}

/** Runs the weekly sessions due up to today. */
export function trainWeeks(state: CareerState, squads: Map<string, CareerPlayer[]>) {
  while (daysBetween(state.trainingDay, state.date) >= 7) {
    state.trainingDay = addDays(state.trainingDay, 7);
    for (const club of Object.values(state.clubs)) {
      const squad = squads.get(club.id) ?? [];
      const manager = club.id === state.manager.clubId;
      const plan = (manager && state.training) || suggestTraining(state, club.id, squad);
      session(state, club, squad, plan);
      if (manager && !state.training) state.assistantPlan = plan;
    }
  }
}

function session(state: CareerState, club: CareerClub, squad: CareerPlayer[], plan: TrainingPlan) {
  const rng = createRng(deriveSeed(state.seed, "training", club.id, state.trainingDay));
  const level = INTENSITY[plan.intensity];
  const date = state.trainingDay;
  for (const p of squad) {
    /* The injured rest; suspended players still train. */
    if (p.injury && p.injury.until > date) continue;
    const condition = conditionOf(p, date);
    /* Fatigue: the session adds its load; a recovery week takes some off. */
    const load = plan.theme === "recovery" ? -8 : level.fatigue;
    p.fatigue = Math.max(0, Math.min(100, condition.fatigue + load));
    p.fatigueDate = date;
    if (plan.theme !== "recovery") grow(p, date, plan, level.growth);
    if (rng.chance(level.injury * (1 + condition.fatigue / 50))) {
      const days = rng.int(3, 21);
      p.injury = { kind: "blessure à l'entraînement", until: addDays(date, days) };
      if (club.id === state.manager.clubId) {
        post(
          state,
          "injury",
          `${p.name} blessé à l'entraînement`,
          `Environ ${days} jours d'absence.`,
        );
      }
    }
  }
  if (club.tactics) {
    practise(club.familiarity, club.tactics, plan.theme === "tactical" ? 12 : 4 * level.growth);
  }
}

/** A week's progress towards potential, faster for the young and the professional. */
function grow(p: CareerPlayer, date: string, plan: TrainingPlan, intensity: number) {
  const room = p.potential - p.overall;
  if (room <= 0) return;
  const rate = seasonRate(ageOn(p.birthDate, date));
  if (rate === 0) return;
  const gain =
    (room * rate * intensity * (0.7 + p.personality.professionalism / 33)) / WEEKS_PER_SEASON;
  p.overall = Math.min(p.potential, p.overall + gain);
  const themed = THEME_ATTRIBUTES[plan.theme];
  const focused = p.trainingFocus ? FOCUS_ATTRIBUTES[p.trainingFocus] : [];
  const keeper = p.position === "GB";
  for (const key of Object.keys(p.attributes) as (keyof Attributes)[]) {
    if (!keeper && OUTFIELD_ONLY.includes(key)) continue;
    const weight = (themed.includes(key) ? 1.5 : 0.8) * (focused.includes(key) ? 2 : 1);
    p.attributes[key] = Math.min(20, p.attributes[key] + (gain / 5) * weight);
  }
}

/**
 * The system a club AI plays by default, from its standing in its league, and a familiarity that
 * knows it well (and its cautious and bold variants fairly well): the squad had a pre-season.
 */
export function settleClubSystems(state: CareerState, squads: Map<string, CareerPlayer[]>) {
  for (const league of state.leagues) {
    const clubs = Object.values(state.clubs).filter((c) => c.leagueId === league.id);
    const strength = new Map(
      clubs.map((c) => [
        c.id,
        squadStrength((squads.get(c.id) ?? []).map(toEngine)) * (1 + c.levelAdjustment),
      ]),
    );
    const ranked = [...clubs].sort(
      (a, b) => strength.get(b.id)! - strength.get(a.id)! || a.id.localeCompare(b.id),
    );
    const last = Math.max(ranked.length - 1, 1);
    ranked.forEach((club, rank) => {
      const tier = rank / last < 0.25 ? 4 : rank / last > 0.65 ? 2 : 3;
      const squad = (squads.get(club.id) ?? []).map(toEngine);
      if (squad.length < 11) return;
      const tactics = autoTeamSheet({ clubId: club.id, squad, reputation: tier }).tactics;
      const manager = club.id === state.manager.clubId;
      if (!manager || !club.tactics)
        club.tactics = manager && state.tactics ? state.tactics : tactics;
      const f = club.familiarity;
      f.formations[club.tactics.formation] = Math.max(
        f.formations[club.tactics.formation] ?? 0,
        70,
      );
      for (const t of [2, 3, 4]) {
        const key = instructionsKey({ ...club.tactics, ...styleForReputation(t) });
        f.instructions[key] = Math.max(f.instructions[key] ?? 0, 50);
      }
      f.instructions[instructionsKey(club.tactics)] = Math.max(
        f.instructions[instructionsKey(club.tactics)] ?? 0,
        70,
      );
    });
  }
}

export const newFamiliarity = (): Familiarity => ({ formations: {}, instructions: {} });
