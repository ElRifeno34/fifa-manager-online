import { describe, expect, it } from "vitest";
import { simulateMatch } from "./match.ts";
import { makeSquad, sheet } from "./test-teams.ts";
import type { Attributes, MatchResult, Position, Tactics, TeamSheet } from "./types.ts";

const strong = makeSquad("s", 17);
const weak = makeSquad("w", 12);
const even = makeSquad("e", 14);
const rival = makeSquad("r", 14);

function series(n: number, home: () => TeamSheet, away: () => TeamSheet): MatchResult[] {
  return Array.from({ length: n }, (_, seed) =>
    simulateMatch({ seed, home: home(), away: away() }),
  );
}

const sum = (results: MatchResult[], f: (r: MatchResult) => number) =>
  results.reduce((s, r) => s + f(r), 0);

describe("simulateMatch", () => {
  it("replays the same match from the same seed", () => {
    const a = simulateMatch({ seed: 7, home: sheet("h", even), away: sheet("a", rival) });
    const b = simulateMatch({ seed: 7, home: sheet("h", even), away: sheet("a", rival) });
    expect(a).toEqual(b);
    const others = [8, 9, 10].map((seed) =>
      simulateMatch({ seed, home: sheet("h", even), away: sheet("a", rival) }),
    );
    expect(others.some((o) => JSON.stringify(o.events) !== JSON.stringify(a.events))).toBe(true);
  });

  it("keeps score, events, stats and player lines consistent", () => {
    for (const r of series(
      30,
      () => sheet("h", even),
      () => sheet("a", rival),
    )) {
      const goals = (side: string) => r.events.filter((e) => e.type === "goal" && e.side === side);
      expect(goals("home")).toHaveLength(r.score.home);
      expect(goals("away")).toHaveLength(r.score.away);
      expect(r.stats.home.goals).toBe(r.score.home);
      expect(r.stats.home.possession + r.stats.away.possession).toBe(100);
      expect(r.stats.home.shotsOnTarget).toBeLessThanOrEqual(r.stats.home.shots);
      const scorers = r.players.reduce((s, p) => s + p.goals, 0);
      expect(scorers).toBe(r.score.home + r.score.away);
      for (const p of r.players) {
        expect(p.rating).toBeGreaterThanOrEqual(3);
        expect(p.rating).toBeLessThanOrEqual(10);
      }
      expect(r.players.some((p) => p.playerId === r.manOfTheMatch)).toBe(true);
      expect(r.players.filter((p) => p.side === "home").length).toBeGreaterThanOrEqual(11);
      expect(r.players.filter((p) => p.side === "home").length).toBeLessThanOrEqual(16);
      const clock = r.events.map((e) => e.half * 10_000 + e.minute * 60 + e.second);
      expect(clock).toEqual([...clock].sort((a, b) => a - b));
      expect(r.events.at(-1)?.type).toBe("fullTime");
    }
  });

  it("lets the stronger team win most of the time", () => {
    const results = series(
      200,
      () => sheet("s", strong),
      () => sheet("w", weak),
    );
    const wins = results.filter((r) => r.score.home > r.score.away).length;
    expect(wins / results.length).toBeGreaterThan(0.7);
  });

  it("lifts a club whose collective plays above its squad", { timeout: 15_000 }, () => {
    const points = (levelAdjustment: number) =>
      sum(
        series(
          300,
          () => ({ ...sheet("h", even), levelAdjustment }),
          () => sheet("a", rival),
        ),
        (r) => (r.score.home > r.score.away ? 3 : r.score.home === r.score.away ? 1 : 0),
      );
    expect(points(0.08)).toBeGreaterThan(points(0) * 1.15);
    expect(points(-0.08)).toBeLessThan(points(0) * 0.85);
  });

  it("plays a well-drilled system better than a new one", () => {
    const points = (familiarity: number) =>
      sum(
        series(
          300,
          () => ({ ...sheet("h", even), familiarity }),
          () => sheet("a", rival),
        ),
        (r) => (r.score.home > r.score.away ? 3 : r.score.home === r.score.away ? 1 : 0),
      );
    expect(points(1)).toBeGreaterThan(points(0.2));
  });

  it("gives a small edge to the home side", () => {
    const results = series(
      600,
      () => sheet("h", even),
      () => sheet("a", rival),
    );
    const home = results.filter((r) => r.score.home > r.score.away).length;
    const away = results.filter((r) => r.score.home < r.score.away).length;
    expect(home).toBeGreaterThan(away);
    expect(home / results.length).toBeLessThan(0.6);
  });

  it("plays with ten after a red card", () => {
    const results = series(
      200,
      () => sheet("h", even),
      () => sheet("a", rival),
    );
    const sentOff = results.find((r) => r.players.some((p) => p.redCard));
    expect(sentOff).toBeDefined();
    const red = sentOff!.players.find((p) => p.redCard)!;
    const at = sentOff!.events.findIndex((e) => e.type === "red" && e.playerId === red.playerId);
    expect(at).toBeGreaterThan(-1);
    /* Once sent off, the player takes no further part in the play. */
    const later = sentOff!.events.slice(at + 1).filter((e) => e.type !== "substitution");
    expect(later.some((e) => e.playerId === red.playerId || e.otherPlayerId === red.playerId)).toBe(
      false,
    );
  });

  it("rejects a team without eleven starters", () => {
    const short = sheet("h", even);
    short.starters = short.starters.slice(0, 10);
    expect(() => simulateMatch({ seed: 1, home: short, away: sheet("a", rival) })).toThrow();
  });
});

/** The tactical "rock-paper-scissors" of GAME_DESIGN.md, measured over many matches. */
describe("tactics", () => {
  const N = 400;
  const fast = (level: number, extra: Partial<Attributes>, where: (p: Position) => boolean) =>
    makeSquad(`x${level}`, level, extra, where);
  const attackers = (p: Position) => p === "BU" || p === "AG" || p === "AD" || p === "MOC";

  function conceded(defending: Partial<Tactics>, attackingSquad = rival, attackingTactics = {}) {
    const results = series(
      N,
      () => sheet("d", even, defending),
      () => sheet("a", attackingSquad, attackingTactics),
    );
    return sum(results, (r) => r.score.away) / N;
  }

  it("makes a high line risky against fast forwards", () => {
    const sprinters = fast(14, { pace: 20 }, attackers);
    expect(conceded({ line: "high" }, sprinters)).toBeGreaterThan(
      conceded({ line: "medium" }, sprinters) * 1.1,
    );
  });

  it("makes direct play toothless against a low block", () => {
    const shots = (line: Tactics["line"]) =>
      sum(
        series(
          N,
          () => sheet("d", even, { line }),
          () => sheet("a", rival, { style: "direct" }),
        ),
        (r) => r.stats.away.shots,
      );
    expect(shots("low")).toBeLessThan(shots("medium"));
  });

  it("gets a high press played through by good passers", { timeout: 15_000 }, () => {
    const passers = fast(14, { passing: 19, dribbling: 18, composure: 19 }, () => true);
    const gain = (opponent: typeof rival) =>
      conceded({ pressing: "medium" }, opponent) - conceded({ pressing: "high" }, opponent);
    expect(gain(passers)).toBeLessThan(gain(rival));
  });

  it("wears out a pressing team without stamina late in the match", () => {
    const unfit = makeSquad("u", 14, { stamina: 4 });
    const late = (pressing: Tactics["pressing"]) =>
      sum(
        series(
          N,
          () => sheet("u", unfit, { pressing }),
          () => sheet("a", rival),
        ),
        (r) =>
          r.events.filter((e) => e.type === "goal" && e.side === "away" && e.minute >= 70).length,
      );
    expect(late("high")).toBeGreaterThan(late("medium"));
  });
});
