import { describe, expect, it } from "vitest";
import { deriveSeed } from "./rng.ts";
import {
  conditionsOn,
  createSeason,
  playRound,
  simulateSeason,
  standings,
  type SeasonFixture,
} from "./season.ts";
import { makeSquad, sheet } from "./test-teams.ts";

const CLUBS = ["a", "b", "c", "d"];

function league() {
  const players = CLUBS.flatMap((id, i) =>
    makeSquad(id, 12 + i * 1.5).map((p) => ({ ...p, clubId: id })),
  );
  const pairs = [
    ["a", "b", "c", "d"],
    ["a", "c", "b", "d"],
    ["a", "d", "b", "c"],
  ];
  const fixtures: SeasonFixture[] = [];
  pairs.forEach((p, i) => {
    const date = `2026-08-${String(15 + i * 7).padStart(2, "0")}`;
    fixtures.push({ round: i + 1, date, homeClubId: p[0]!, awayClubId: p[1]! });
    fixtures.push({ round: i + 1, date, homeClubId: p[2]!, awayClubId: p[3]! });
  });
  pairs.forEach((p, i) => {
    const date = `2026-09-${String(5 + i * 7).padStart(2, "0")}`;
    fixtures.push({ round: i + 4, date, homeClubId: p[1]!, awayClubId: p[0]! });
    fixtures.push({ round: i + 4, date, homeClubId: p[3]!, awayClubId: p[2]! });
  });
  return { seed: 3, clubs: CLUBS.map((id) => ({ id })), players, fixtures };
}

describe("standings", () => {
  const m = (home: string, away: string, homeGoals: number, awayGoals: number) => ({
    home,
    away,
    homeGoals,
    awayGoals,
  });

  it("ranks by points, goal difference, then goals scored", () => {
    const table = standings(CLUBS, [m("a", "b", 3, 0), m("c", "d", 1, 0), m("a", "c", 0, 0)]);
    expect(table.map((r) => r.clubId)).toEqual(["a", "c", "d", "b"]);
    expect(table[0]).toMatchObject({ played: 2, won: 1, drawn: 1, points: 4, goalDifference: 3 });
    expect(table[0]!.form).toEqual(["W", "D"]);
  });

  it("separates clubs level on everything by their head-to-head", () => {
    /* All three have 3 points; r leads on goals scored, q and p are level but q beat p. */
    const table = standings(
      ["p", "q", "r"],
      [m("q", "p", 1, 0), m("p", "r", 2, 1), m("r", "q", 2, 1)],
    );
    expect(table.map((r) => r.clubId)).toEqual(["r", "q", "p"]);
  });
});

describe("season", () => {
  it("plays the whole calendar and keeps a consistent table", () => {
    const { season, table } = simulateSeason(league());
    expect(season.results).toHaveLength(12);
    for (const row of table) expect(row.played).toBe(6);
    const goals = season.results.reduce((s, r) => s + r.result.score.home + r.result.score.away, 0);
    expect(table.reduce((s, r) => s + r.goalsFor, 0)).toBe(goals);
  });

  it("is deterministic, and each match replays from its own seed", () => {
    const first = simulateSeason(league());
    const second = simulateSeason(league());
    expect(second.table).toEqual(first.table);
    const record = first.season.results[0]!;
    const { homeClubId, awayClubId, round } = record.fixture;
    expect(record.seed).toBe(deriveSeed(3, round, homeClubId, awayClubId));
  });

  it("carries fatigue to the next days and recovers it within a week", () => {
    const season = createSeason(league());
    playRound(season, 1);
    const line = season.results[0]!.result.players.find(
      (p) => p.minutes === 90 && p.position !== "GB" && p.side === "home",
    )!;
    const club = season.results[0]!.fixture.homeClubId;
    const nextDay = conditionsOn(season, club, "2026-08-16")[line.playerId]!;
    const nextWeek = conditionsOn(season, club, "2026-08-22")[line.playerId]!;
    expect(nextDay.fatigue).toBeGreaterThan(0);
    expect(nextWeek.fatigue).toBe(0);
  });

  it("takes a manager's team as chosen but its condition from the season", () => {
    const input = league();
    const season = createSeason(input);
    const squad = input.players.filter((p) => p.clubId === "a");
    const chosen = sheet("a", squad, { formation: "5-3-2", style: "direct" });
    chosen.condition = Object.fromEntries(squad.map((p) => [p.id, { fatigue: 0, form: 1 }]));
    const [match] = playRound(season, 1, { a: chosen }).filter((r) => r.fixture.homeClubId === "a");
    const positions = match!.result.players
      .filter((p) => p.side === "home")
      .slice(0, 11)
      .map((p) => p.position);
    expect(positions.filter((p) => p === "DC")).toHaveLength(3);
  });
});
