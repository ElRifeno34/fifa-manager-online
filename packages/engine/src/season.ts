/**
 * A league season: plays the calendar round by round, carries fatigue and form from one match to the
 * next, and keeps the table. Clubs nobody controls are run by the club AI.
 */
import { autoTeamSheet, squadStrength, tierAgainst } from "./lineup.ts";
import { simulateMatch } from "./match.ts";
import { deriveSeed } from "./rng.ts";
import type { EnginePlayer, MatchResult, PlayerCondition, TeamSheet } from "./types.ts";

export interface SeasonClub {
  id: string;
}

export interface SeasonPlayer extends EnginePlayer {
  clubId: string;
}

export interface SeasonFixture {
  round: number;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  homeClubId: string;
  awayClubId: string;
}

export interface MatchRecord {
  fixture: SeasonFixture;
  seed: number;
  result: MatchResult;
}

export interface StandingRow {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  /** Last five results, oldest first. */
  form: ("W" | "D" | "L")[];
}

interface PlayerState {
  fatigue: number;
  /** Date the fatigue was measured. */
  date: string | null;
  ratings: number[];
}

export interface Season {
  seed: number;
  clubs: readonly SeasonClub[];
  fixtures: readonly SeasonFixture[];
  squads: ReadonlyMap<string, readonly SeasonPlayer[]>;
  /** Standing in the league, 2 (underdog) to 4 (favourite), which sets the club AI's style. */
  tiers: ReadonlyMap<string, number>;
  /** Average level of each club's best eleven. */
  strength: ReadonlyMap<string, number>;
  players: Map<string, PlayerState>;
  results: MatchRecord[];
}

export function createSeason(input: {
  seed: number;
  clubs: readonly SeasonClub[];
  players: readonly SeasonPlayer[];
  fixtures: readonly SeasonFixture[];
}): Season {
  const squads = new Map<string, SeasonPlayer[]>(input.clubs.map((c) => [c.id, []]));
  for (const player of input.players) squads.get(player.clubId)?.push(player);
  for (const [clubId, squad] of squads) {
    if (squad.length < 11) throw new Error(`${clubId}: only ${squad.length} players`);
  }
  const strength = new Map([...squads].map(([clubId, squad]) => [clubId, squadStrength(squad)]));
  return {
    seed: input.seed,
    clubs: input.clubs,
    tiers: tiersOf(strength),
    strength,
    fixtures: [...input.fixtures].sort((a, b) => a.round - b.round || a.date.localeCompare(b.date)),
    squads,
    players: new Map(input.players.map((p) => [p.id, { fatigue: 0, date: null, ratings: [] }])),
    results: [],
  };
}

/**
 * The club AI reads its standing within the league, not its absolute reputation: in a second
 * division the favourites also keep the ball and press.
 */
function tiersOf(strengths: ReadonlyMap<string, number>): Map<string, number> {
  const strength = [...strengths].map(([clubId, value]) => ({ clubId, value }));
  strength.sort((a, b) => b.value - a.value || a.clubId.localeCompare(b.clubId));
  const last = Math.max(strength.length - 1, 1);
  return new Map(
    strength.map(({ clubId }, rank) => [
      clubId,
      rank / last < 0.25 ? 4 : rank / last > 0.65 ? 2 : 3,
    ]),
  );
}

export const rounds = (season: Season) => [...new Set(season.fixtures.map((f) => f.round))];

const DAY = 86_400_000;

/** Fatigue and form of a club's players on a given date, rest since their last match included. */
export function conditionsOn(
  season: Season,
  clubId: string,
  date: string,
): Record<string, PlayerCondition> {
  const out: Record<string, PlayerCondition> = {};
  for (const player of season.squads.get(clubId) ?? []) {
    const state = season.players.get(player.id)!;
    const days = state.date ? Math.max(0, (Date.parse(date) - Date.parse(state.date)) / DAY) : 0;
    /* About three days to recover from a full match, a little less with good stamina. */
    const recovery = days * (6 + 0.3 * player.attributes.stamina);
    const recent = state.ratings.slice(-5);
    const average = recent.length ? recent.reduce((s, r) => s + r, 0) / recent.length : 6.5;
    out[player.id] = {
      fatigue: Math.max(0, Math.round(state.fatigue - recovery)),
      form: Math.max(-1, Math.min(1, (average - 6.5) / 1)),
    };
  }
  return out;
}

/**
 * Plays every match of a round. `sheets` holds the teams chosen by human managers; their condition
 * is always taken from the season, so a sheet cannot pretend its players are fresh.
 */
export function playRound(
  season: Season,
  round: number,
  sheets: Readonly<Record<string, TeamSheet>> = {},
): MatchRecord[] {
  const played: MatchRecord[] = [];
  for (const fixture of season.fixtures.filter((f) => f.round === round)) {
    const sheetFor = (clubId: string, opponentId: string): TeamSheet => {
      const condition = conditionsOn(season, clubId, fixture.date);
      const chosen = sheets[clubId];
      if (chosen) return { ...chosen, condition };
      return autoTeamSheet({
        clubId,
        squad: season.squads.get(clubId)!,
        reputation: tierAgainst(
          season.tiers.get(clubId) ?? 3,
          season.strength.get(clubId)!,
          season.strength.get(opponentId)!,
        ),
        condition,
      });
    };
    const home = sheetFor(fixture.homeClubId, fixture.awayClubId);
    const away = sheetFor(fixture.awayClubId, fixture.homeClubId);
    const seed = deriveSeed(season.seed, fixture.round, fixture.homeClubId, fixture.awayClubId);
    const result = simulateMatch({ seed, home, away });

    for (const clubId of [fixture.homeClubId, fixture.awayClubId]) {
      const condition = clubId === home.clubId ? home.condition! : away.condition!;
      for (const player of season.squads.get(clubId)!) {
        const state = season.players.get(player.id)!;
        state.fatigue = condition[player.id]?.fatigue ?? 0;
        state.date = fixture.date;
      }
    }
    for (const line of result.players) {
      const state = season.players.get(line.playerId);
      if (!state) continue;
      state.fatigue = line.fatigue;
      if (line.minutes >= 20) state.ratings.push(line.rating);
    }
    const record = { fixture, seed, result };
    season.results.push(record);
    played.push(record);
  }
  return played;
}

function emptyRow(clubId: string): StandingRow {
  return {
    clubId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: [],
  };
}

function tally(
  clubIds: readonly string[],
  matches: readonly { home: string; away: string; homeGoals: number; awayGoals: number }[],
): Map<string, StandingRow> {
  const rows = new Map(clubIds.map((id) => [id, emptyRow(id)]));
  for (const m of matches) {
    const home = rows.get(m.home);
    const away = rows.get(m.away);
    if (!home || !away) continue;
    for (const [row, scored, conceded] of [
      [home, m.homeGoals, m.awayGoals],
      [away, m.awayGoals, m.homeGoals],
    ] as const) {
      row.played++;
      row.goalsFor += scored;
      row.goalsAgainst += conceded;
      row.goalDifference = row.goalsFor - row.goalsAgainst;
      const outcome: "W" | "D" | "L" = scored > conceded ? "W" : scored === conceded ? "D" : "L";
      if (outcome === "W") row.won++;
      else if (outcome === "D") row.drawn++;
      else row.lost++;
      row.points += outcome === "W" ? 3 : outcome === "D" ? 1 : 0;
      row.form = [...row.form, outcome].slice(-5);
    }
  }
  return rows;
}

/** League table: points, goal difference, goals scored, then head-to-head among tied clubs. */
export function standings(
  clubIds: readonly string[],
  matches: readonly { home: string; away: string; homeGoals: number; awayGoals: number }[],
): StandingRow[] {
  const rows = tally(clubIds, matches);
  const key = (r: StandingRow) => `${r.points}|${r.goalDifference}|${r.goalsFor}`;
  const groups = new Map<string, string[]>();
  for (const row of rows.values())
    groups.set(key(row), [...(groups.get(key(row)) ?? []), row.clubId]);
  const headToHead = new Map<string, StandingRow>();
  for (const tied of groups.values()) {
    if (tied.length < 2) continue;
    const mutual = matches.filter((m) => tied.includes(m.home) && tied.includes(m.away));
    for (const [id, row] of tally(tied, mutual)) headToHead.set(id, row);
  }
  const h2h = (id: string) => headToHead.get(id) ?? emptyRow(id);
  return [...rows.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      h2h(b.clubId).points - h2h(a.clubId).points ||
      h2h(b.clubId).goalDifference - h2h(a.clubId).goalDifference ||
      a.clubId.localeCompare(b.clubId),
  );
}

export function seasonTable(season: Season): StandingRow[] {
  return standings(
    season.clubs.map((c) => c.id),
    season.results.map((r) => ({
      home: r.fixture.homeClubId,
      away: r.fixture.awayClubId,
      homeGoals: r.result.score.home,
      awayGoals: r.result.score.away,
    })),
  );
}

/** Quick simulation of a whole season by the club AI. */
export function simulateSeason(input: Parameters<typeof createSeason>[0]) {
  const season = createSeason(input);
  for (const round of rounds(season)) playRound(season, round);
  return { season, table: seasonTable(season) };
}
