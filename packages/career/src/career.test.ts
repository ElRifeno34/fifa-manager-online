import { describe, expect, it } from "vitest";
import {
  advance,
  ageOn,
  createCareer,
  fixturesToday,
  leagueTable,
  loadCareer,
  nextUserFixture,
  playToday,
  saveCareer,
  simulateToSeasonEnd,
  squadOf,
  worldOf,
  type CareerState,
} from "./index.ts";
import { autoTeamSheet } from "@fmo/engine";
import { career, LINKS, makePack, POSITIONS } from "./test-world.ts";

describe("createCareer", () => {
  it("builds the world from the packs", () => {
    const state = career();
    expect(Object.keys(state.clubs)).toHaveLength(8);
    expect(Object.keys(state.players)).toHaveLength(8 * POSITIONS.length);
    expect(state.fixtures).toHaveLength(24);
    expect(state.leagues.map((l) => l.tier)).toEqual([1, 2]);
    expect(state.date < state.fixtures[0]!.date).toBe(true);
    expect(state.inbox[0]!.kind).toBe("welcome");
    expect(state.clubs.a!.levelAdjustment).toBe(0.1);
  });

  it("pairs linked divisions and leaves other leagues alone", () => {
    expect(worldOf("ligue-2")).toEqual(["ligue-1", "ligue-2"]);
    expect(worldOf("mls")).toEqual(["mls"]);
  });

  it("refuses a club that is in no pack", () => {
    expect(() =>
      createCareer({
        packs: [makePack("top", ["a", "b"], 70)],
        clubId: "z",
        managerName: "T",
        seed: 1,
      }),
    ).toThrow();
  });
});

describe("day to day", () => {
  it("stops on the morning of the manager's match, the other matches of the way played", () => {
    const state = career();
    const { stop } = advance(state);
    expect(stop).toBe("userMatch");
    const mine = nextUserFixture(state)!;
    expect(mine.date).toBe(state.date);
    expect(mine.result).toBeNull();
    expect(advance(state).stop).toBe("userMatch");
    expect(nextUserFixture(state)).toBe(mine);
  });

  it("plays the day with the manager's team and records everything", () => {
    const state = career();
    advance(state);
    const squad = squadOf(state, "a").map((p) => ({ ...p, secondaryPositions: [] }));
    const sheet = autoTeamSheet({
      clubId: "a",
      squad,
      reputation: 3,
      tactics: { formation: "5-3-2", style: "direct", pressing: "low", line: "low" },
    });
    const { played, userMatch } = playToday(state, sheet);
    expect(played.length).toBeGreaterThan(0);
    expect(fixturesToday(state)).toHaveLength(0);
    const home = userMatch!.players.filter(
      (p) => p.side === (played[0]!.homeClubId === "a" ? "home" : "away"),
    );
    expect(home.slice(0, 11).filter((p) => p.position === "DC")).toHaveLength(3);
    const scorer = played.flatMap((f) => f.result!.goals)[0];
    if (scorer) expect(state.players[scorer.playerId]!.season.goals).toBeGreaterThan(0);
    expect(state.inbox.at(-1)!.kind).toBe("result");
    expect(state.inbox.at(-1)!.body).toContain("Identité : 5-3-2, jeu direct");
    expect(state.inbox.at(-1)!.body).toContain("récupérations au milieu");
    const userFixture = played.find((f) => f.homeClubId === "a" || f.awayClubId === "a")!;
    expect(userFixture.result!.analysis).toBeDefined();
    expect(
      userFixture.result!.analysis![userFixture.homeClubId === "a" ? "homeTactics" : "awayTactics"],
    ).toEqual(sheet.tactics);
    expect(leagueTable(state, "top").reduce((s, l) => s + l.played, 0)).toBe(4);
  });

  it("uses the manager's saved tactics when the assistant picks the team", () => {
    const state = career();
    state.tactics = { formation: "3-5-2", style: "possession", pressing: "high", line: "high" };
    advance(state);
    const { userMatch } = playToday(state);
    const positions = userMatch!.players.map((p) => p.position);
    expect(positions.filter((p) => p === "DC").length).toBeGreaterThanOrEqual(3);
  });
});

describe("end of season", () => {
  it("promotes and relegates, ages the players and opens a new calendar", () => {
    const state = career();
    const before = structuredClone(state.players);
    const form = state.clubs.a!.formAdjustment;
    simulateToSeasonEnd(state);
    expect(state.season.label).toBe("2027-28");
    const [top, second] = state.history;
    expect(top!.table).toHaveLength(4);
    expect(top!.relegated).toHaveLength(1);
    expect(second!.promoted).toHaveLength(1);
    expect(state.clubs[top!.relegated[0]!]!.leagueId).toBe("second");
    expect(state.clubs[second!.promoted[0]!]!.leagueId).toBe("top");
    expect(state.fixtures).toHaveLength(24);
    expect(state.fixtures.every((f) => f.result === null)).toBe(true);
    expect(state.date < state.fixtures[0]!.date).toBe(true);

    const young = Object.values(before).filter((p) => ageOn(p.birthDate, "2026-08-15") <= 20);
    const old = Object.values(before).filter((p) => ageOn(p.birthDate, "2026-08-15") >= 33);
    const gain = (ids: typeof young) =>
      ids.reduce((s, p) => s + ((state.players[p.id]?.overall ?? p.overall) - p.overall), 0) /
      ids.length;
    expect(gain(young)).toBeGreaterThan(0);
    expect(gain(old)).toBeLessThan(0);
    for (const clubId of Object.keys(state.clubs)) {
      const size = squadOf(state, clubId).length;
      expect(size).toBeGreaterThanOrEqual(20);
      expect(size).toBeLessThanOrEqual(30);
    }
    expect(Object.values(state.players).some((p) => p.generated)).toBe(true);
    expect(state.players["a-0"]!.history[0]).toMatchObject({ season: "2026-27", clubId: "a" });
    expect(state.clubs.a!.formAdjustment).toBeCloseTo(form / 2, 2);
    expect(state.inbox.some((m) => m.kind === "season")).toBe(true);
  });

  it("plays several seasons in a row", () => {
    const state = career();
    for (let s = 0; s < 3; s++) simulateToSeasonEnd(state);
    expect(state.history).toHaveLength(6);
    expect(state.season.label).toBe("2029-30");
  });
});

describe("determinism and saves", () => {
  it("replays the same career from the same seed", () => {
    const a = career(9);
    const b = career(9);
    simulateToSeasonEnd(a);
    simulateToSeasonEnd(b);
    expect(saveCareer(a)).toBe(saveCareer(b));
    const c = career(10);
    simulateToSeasonEnd(c);
    expect(saveCareer(c)).not.toBe(saveCareer(a));
  });

  it("saves and loads back the same career, and refuses foreign files", () => {
    const state = career();
    advance(state);
    playToday(state);
    const loaded = loadCareer(saveCareer(state));
    expect(loaded).toEqual(state);
    simulateToSeasonEnd(loaded);
    expect(loaded.season.index).toBe(1);
    expect(() => loadCareer(JSON.stringify({ format: "other" }))).toThrow();
    expect(() => loadCareer(JSON.stringify({ ...state, version: 99 }))).toThrow();
    const missingPlayerClub = structuredClone(state);
    missingPlayerClub.players[Object.keys(missingPlayerClub.players)[0]!]!.clubId = "missing";
    expect(() => loadCareer(saveCareer(missingPlayerClub))).toThrow(/unknown club/);
    expect(() => loadCareer("{")).toThrow(/valid JSON/);
  });
});

describe("club level", () => {
  it("tones down strong squads and lifts weak ones, form apart", () => {
    const second = makePack("second", ["e", "f", "g", "h"], 60);
    delete second.clubs[0]!.levelAdjustment;
    const state = createCareer({
      packs: [makePack("top", ["a", "b", "c", "d"], 70), second],
      clubId: "a",
      managerName: "Test",
      seed: 5,
      links: LINKS,
    });
    /* The second division has no fit: only the structural part applies. */
    expect(state.clubs.h!.levelAdjustment).toBeLessThan(0);
    expect(state.clubs.e!.levelAdjustment).toBeGreaterThan(0);
    /* In the top division the fitted values are kept, split into structure and form. */
    expect(state.clubs.a!.levelAdjustment).toBeCloseTo(0.1, 3);
    expect(state.clubs.a!.formAdjustment).not.toBe(0);
    const top = ["a", "b", "c", "d"].map((id) => state.clubs[id]!);
    expect(top.reduce((s, c) => s + c.levelAdjustment - c.formAdjustment, 0)).toBeCloseTo(0, 2);
  });
});

describe("season 2026-27", () => {
  it("starts every career in summer 2026, even for a league played over a calendar year", () => {
    const pack = makePack("calendar", ["a", "b", "c", "d"], 70);
    pack.fixtures = pack.fixtures.map((f) => ({
      ...f,
      date: f.date.replace("2026-08", "2026-02"),
    }));
    const state = createCareer({ packs: [pack], clubId: "a", managerName: "T", seed: 1 });
    expect(state.season.label).toBe("2026-27");
    expect(state.fixtures.every((f) => f.date >= "2026-08-15")).toBe(true);
    expect(state.date >= "2026-07-01").toBe(true);
  });

  it("keeps all matches in a large odd-sized league's single round", () => {
    const pack = makePack(
      "large-odd",
      Array.from({ length: 25 }, (_, i) => `c${i}`),
      70,
    );
    const state = createCareer({ packs: [pack], clubId: "c0", managerName: "T", seed: 1 });
    expect(state.fixtures).toHaveLength((25 * 24) / 2);
    expect(new Set(state.fixtures.map((f) => f.round))).toHaveProperty("size", 25);
    const gamesPerClub = new Map<string, number>();
    for (const fixture of state.fixtures) {
      gamesPerClub.set(fixture.homeClubId, (gamesPerClub.get(fixture.homeClubId) ?? 0) + 1);
      gamesPerClub.set(fixture.awayClubId, (gamesPerClub.get(fixture.awayClubId) ?? 0) + 1);
    }
    expect([...gamesPerClub.values()].every((games) => games === 24)).toBe(true);
  });
});
