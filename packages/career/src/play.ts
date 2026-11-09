/**
 * The day-to-day loop: move the calendar on, play each match day with the engine, and keep the
 * players' fatigue, form and statistics.
 */
import {
  autoTeamSheet,
  deriveSeed,
  simulateMatch,
  squadStrength,
  standings,
  tierAgainst,
  type MatchResult,
  type TeamSheet,
} from "@fmo/engine";
import { addDays } from "./calendar.ts";
import { afterMatch, healed, isAvailable } from "./availability.ts";
import { settleWeeks } from "./finance.ts";
import { updateMorale } from "./people.ts";
import { marketWeeks } from "./market.ts";
import { familiarityWith, practise, trainWeeks } from "./training.ts";
import { closeStaleTalks } from "./transfers.ts";
import { postPreMatchAdvice } from "./assistant.ts";
import { monthlyReview } from "./board.ts";
import { autoReply, weeklyTalks } from "./conversations.ts";
import { reviewPromises } from "./player-talk.ts";
import { pending } from "./talk.ts";
import { endSeason } from "./season-end.ts";
import { clubsOf, conditionOf, indexSquads, post, toEngine } from "./state.ts";
import type { CareerPlayer } from "./types.ts";
import type { CareerFixture, CareerState, TableLine } from "./types.ts";

const involves = (f: CareerFixture, clubId: string) =>
  f.homeClubId === clubId || f.awayClubId === clubId;

/** The manager's next match not played yet. */
export const nextUserFixture = (state: CareerState) =>
  state.fixtures.find((f) => !f.result && involves(f, state.manager.clubId));

/** Today's matches not played yet. */
export const fixturesToday = (state: CareerState) =>
  state.fixtures.filter((f) => !f.result && f.date === state.date);

export type AdvanceStop = "userMatch" | "seasonEnd" | "conversation";

/** Moves the calendar to `date`, settling the weeks and the injuries on the way. */
export function moveTo(state: CareerState, date: string) {
  if (date <= state.date) return;
  state.date = date;
  healed(state);
  const squads = indexSquads(state);
  settleWeeks(state, squads);
  trainWeeks(state, squads);
  marketWeeks(state, squads);
  closeStaleTalks(state);
  weeklyTalks(state);
  if (state.fixtures.some((f) => f.result)) monthlyReview(state);
}

/**
 * Moves day by day, playing every match day on the way, and stops on the morning of the manager's
 * next match (to pick the team) or when the season is over, after the end-of-season work.
 */
export function advance(state: CareerState): { stop: AdvanceStop; played: CareerFixture[] } {
  const played: CareerFixture[] = [];
  for (;;) {
    /* Someone is waiting for an answer: the player, the assistant or the board. */
    if (pending(state).length) return { stop: "conversation", played };
    const next = state.fixtures.find((f) => !f.result);
    if (!next) {
      endSeason(state);
      return { stop: "seasonEnd", played };
    }
    if (next.date > state.date) moveTo(state, next.date);
    if (pending(state).length) return { stop: "conversation", played };
    if (fixturesToday(state).some((f) => involves(f, state.manager.clubId))) {
      postPreMatchAdvice(state);
      return { stop: "userMatch", played };
    }
    played.push(...playToday(state).played);
    moveTo(state, addDays(state.date, 1));
  }
}

/** League strength of each club, and its standing in the league, for the club AI's style. */
type Squads = Map<string, CareerPlayer[]>;

function leagueContext(state: CareerState, leagueId: string, squads: Squads) {
  const strength = new Map<string, number>();
  for (const clubId of clubsOf(state, leagueId)) {
    const club = state.clubs[clubId]!;
    strength.set(
      clubId,
      squadStrength(squads.get(clubId)!.map(toEngine)) * (1 + club.levelAdjustment),
    );
  }
  const ranked = [...strength].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const last = Math.max(ranked.length - 1, 1);
  const tiers = new Map(
    ranked.map(([id], rank) => [id, rank / last < 0.25 ? 4 : rank / last > 0.65 ? 2 : 3]),
  );
  return { strength, tiers };
}

function sheetFor(
  state: CareerState,
  clubId: string,
  opponentId: string,
  context: ReturnType<typeof leagueContext>,
  squads: Squads,
  chosen?: TeamSheet,
): TeamSheet {
  const everyone = squads.get(clubId)!;
  /* Injured and suspended players are left out, unless the club cannot field eleven without them. */
  const fit = everyone.filter((p) => isAvailable(p, state.date));
  const squad = fit.length >= 11 ? fit : everyone;
  const condition = Object.fromEntries(squad.map((p) => [p.id, conditionOf(p, state.date)]));
  const levelAdjustment = state.clubs[clubId]!.levelAdjustment;
  if (chosen) {
    const named = [...chosen.starters.map((s) => s.player.id), ...chosen.bench.map((p) => p.id)];
    const unavailable = named.filter((id) => !squad.some((p) => p.id === id));
    if (unavailable.length) {
      throw new Error(`Not available or not in the squad: ${unavailable.join(", ")}`);
    }
    return {
      ...chosen,
      condition,
      levelAdjustment,
      familiarity: familiarityWith(state.clubs[clubId]!, chosen.tactics),
    };
  }
  const manager = clubId === state.manager.clubId;
  const auto = autoTeamSheet({
    clubId,
    squad: squad.map(toEngine),
    reputation: tierAgainst(
      context.tiers.get(clubId) ?? 3,
      context.strength.get(clubId) ?? 0,
      context.strength.get(opponentId) ?? 0,
    ),
    condition,
    levelAdjustment,
    ...(manager && state.tactics ? { tactics: state.tactics } : {}),
  });
  return { ...auto, familiarity: familiarityWith(state.clubs[clubId]!, auto.tactics) };
}

/**
 * Plays every match of the day. `sheet` is the manager's team, as picked on the team screen;
 * without it, the assistant picks the side with the manager's tactics. Returns the manager's match
 * in full, for the match and post-match screens.
 */
export function playToday(
  state: CareerState,
  sheet?: TeamSheet,
): { played: CareerFixture[]; userMatch: MatchResult | null } {
  const today = fixturesToday(state);
  const contexts = new Map<string, ReturnType<typeof leagueContext>>();
  const squads = indexSquads(state);
  let userMatch: MatchResult | null = null;
  for (const fixture of today) {
    let context = contexts.get(fixture.leagueId);
    if (!context) {
      context = leagueContext(state, fixture.leagueId, squads);
      contexts.set(fixture.leagueId, context);
    }
    const mine = (id: string) => (id === state.manager.clubId ? sheet : undefined);
    const home = sheetFor(
      state,
      fixture.homeClubId,
      fixture.awayClubId,
      context,
      squads,
      mine(fixture.homeClubId),
    );
    const away = sheetFor(
      state,
      fixture.awayClubId,
      fixture.homeClubId,
      context,
      squads,
      mine(fixture.awayClubId),
    );
    const seed = deriveSeed(state.seed, state.season.label, fixture.id);
    const result = simulateMatch({ seed, home, away });
    record(state, fixture, result, squads);
    /* Playing a system counts as practice; the manager's club trains what it plays. */
    for (const played of [home, away]) {
      const club = state.clubs[played.clubId]!;
      practise(club.familiarity, played.tactics, 2);
      if (club.id === state.manager.clubId) club.tactics = played.tactics;
    }
    if (involves(fixture, state.manager.clubId)) {
      userMatch = result;
      reportUserMatch(state, fixture);
      reviewPromises(state);
    }
  }
  return { played: today, userMatch };
}

function record(state: CareerState, fixture: CareerFixture, result: MatchResult, squads: Squads) {
  fixture.result = {
    home: result.score.home,
    away: result.score.away,
    goals: result.events
      .filter((e) => e.type === "goal")
      .map((e) => ({
        playerId: e.playerId!,
        assistId: e.otherPlayerId ?? null,
        minute: e.minute + 1,
        side: e.side!,
      })),
    manOfTheMatch: result.manOfTheMatch,
  };
  /* Everyone in both squads: rest counts up to today, then the match adds its own fatigue. */
  for (const clubId of [fixture.homeClubId, fixture.awayClubId]) {
    for (const p of squads.get(clubId)!) {
      p.fatigue = conditionOf(p, state.date).fatigue;
      p.fatigueDate = state.date;
    }
  }
  const yellowsBefore = new Map(
    result.players.map((l) => [l.playerId, state.players[l.playerId]?.season.yellows ?? 0]),
  );
  for (const line of result.players) {
    const p = state.players[line.playerId];
    if (!p) continue;
    p.fatigue = line.fatigue;
    if (line.minutes >= 20) p.ratings = [...p.ratings, line.rating].slice(-5);
    const s = p.season;
    s.apps++;
    s.minutes += line.minutes;
    s.goals += line.goals;
    s.assists += line.assists;
    s.ratingSum += line.rating;
    s.yellows += line.yellowCards;
    s.reds += line.redCard ? 1 : 0;
    if (line.minutes >= 60) s.starts++;
  }
  afterMatch(state, fixture, result, squads, yellowsBefore);
  const minutes = new Map(result.players.map((l) => [l.playerId, l.minutes]));
  const { home, away } = result.score;
  updateMorale(
    squads.get(fixture.homeClubId)!,
    minutes,
    home > away ? "win" : home === away ? "draw" : "loss",
  );
  updateMorale(
    squads.get(fixture.awayClubId)!,
    minutes,
    away > home ? "win" : home === away ? "draw" : "loss",
  );
}

function reportUserMatch(state: CareerState, f: CareerFixture) {
  const r = f.result!;
  const home = f.homeClubId === state.manager.clubId;
  const opponent = state.clubs[home ? f.awayClubId : f.homeClubId]!.name;
  const [mine, theirs] = home ? [r.home, r.away] : [r.away, r.home];
  const outcome = mine > theirs ? "Victoire" : mine === theirs ? "Match nul" : "Défaite";
  const scorers = r.goals
    .filter((g) => (g.side === "home") === home)
    .map((g) => `${state.players[g.playerId]?.name ?? "?"} (${g.minute}')`);
  post(
    state,
    "result",
    `${outcome} ${mine}-${theirs} ${home ? "contre" : "chez"} ${opponent}`,
    scorers.length ? `Buteurs : ${scorers.join(", ")}.` : "Aucun but de notre côté.",
  );
}

/** Current table of a league, first to last. */
export function leagueTable(state: CareerState, leagueId: string): TableLine[] {
  const clubIds = clubsOf(state, leagueId);
  const matches = state.fixtures
    .filter((f) => f.leagueId === leagueId && f.result)
    .map((f) => ({
      home: f.homeClubId,
      away: f.awayClubId,
      homeGoals: f.result!.home,
      awayGoals: f.result!.away,
    }));
  return standings(clubIds, matches).map((r) => ({
    clubId: r.clubId,
    played: r.played,
    won: r.won,
    drawn: r.drawn,
    lost: r.lost,
    goalsFor: r.goalsFor,
    goalsAgainst: r.goalsAgainst,
    points: r.points,
  }));
}

/** Quick simulation: the assistant runs the club until the season ends. */
export function simulateToSeasonEnd(state: CareerState) {
  for (;;) {
    const { stop } = advance(state);
    if (stop === "seasonEnd") {
      autoReply(state);
      return;
    }
    if (stop === "conversation") {
      autoReply(state);
      continue;
    }
    playToday(state);
    moveTo(state, addDays(state.date, 1));
  }
}
