import { describe, expect, it } from "vitest";
import { autoTeamSheet } from "@fmo/engine";
import {
  addDays,
  advance,
  estimateValue,
  isAvailable,
  moveTo,
  playToday,
  rolesOf,
  simulateToSeasonEnd,
  squadOf,
  updateMorale,
  weeklyWages,
} from "./index.ts";
import { afterMatch } from "./availability.ts";
import { indexSquads, toEngine } from "./state.ts";
import { career } from "./test-world.ts";

describe("contracts and money", () => {
  it("gives every player a contract within the club's wage bill", () => {
    const state = career();
    for (const club of Object.values(state.clubs)) {
      const squad = squadOf(state, club.id);
      for (const p of squad) {
        expect(p.contract!.wage).toBeGreaterThan(0);
        expect(p.contract!.until >= state.season.label).toBe(true);
      }
      expect(weeklyWages(squad)).toBeGreaterThan(club.finance.wageBudget * 0.95);
      expect(weeklyWages(squad)).toBeLessThan(club.finance.wageBudget * 1.2);
      expect(club.finance.balance).toBeGreaterThan(0);
    }
    /* Stronger club, bigger budget. */
    expect(state.clubs.d!.finance.revenue).toBeGreaterThan(state.clubs.e!.finance.revenue);
  });

  it("values young players above veterans of the same level", () => {
    expect(estimateValue(75, 20)).toBeGreaterThan(estimateValue(75, 27));
    expect(estimateValue(75, 27)).toBeGreaterThan(estimateValue(75, 33));
    expect(estimateValue(85, 27)).toBeGreaterThan(estimateValue(75, 27) * 4);
  });

  it("settles income and wages every week", () => {
    const state = career();
    const club = state.clubs.a!;
    const before = club.finance.balance;
    moveTo(state, addDays(state.date, 21));
    expect(club.finance.wages).toBe(weeklyWages(squadOf(state, "a")) * 3);
    expect(club.finance.income).toBe(Math.round(club.finance.revenue / 52) * 3);
    expect(club.finance.balance).not.toBe(before);
  });

  it("renews or frees expiring contracts and cuts wages on relegation", () => {
    const state = career();
    const expiring = Object.values(state.players).filter((p) => p.contract!.until === "2026-27");
    const wages = new Map(Object.values(state.players).map((p) => [p.id, p.contract!.wage]));
    simulateToSeasonEnd(state);
    expect(expiring.length).toBeGreaterThan(0);
    for (const p of expiring) {
      if (p.clubId) expect(p.contract!.until > "2026-27").toBe(true);
      else expect(p.contract).toBeNull();
    }
    const relegated = state.history[0]!.relegated[0]!;
    const kept = squadOf(state, relegated).find(
      (p) => !p.generated && p.contract!.until !== "2026-27" && wages.has(p.id),
    )!;
    expect(kept.contract!.wage).toBe(Math.round((wages.get(kept.id)! * 0.7) / 100) * 100);
    for (const club of Object.values(state.clubs)) {
      expect(club.finance.income).toBe(0);
    }
  });
});

describe("availability", () => {
  it("keeps injured and suspended players out of the team", () => {
    const state = career();
    advance(state);
    const squad = squadOf(state, "a");
    const injured = squad[0]!;
    const banned = squad[1]!;
    injured.injury = { kind: "entorse", until: addDays(state.date, 10) };
    banned.suspension = 1;
    expect(isAvailable(injured, state.date)).toBe(false);
    expect(isAvailable(banned, state.date)).toBe(false);
    const { userMatch } = playToday(state);
    const ids = userMatch!.players.map((p) => p.playerId);
    expect(ids).not.toContain(injured.id);
    expect(ids).not.toContain(banned.id);
    /* Sitting the match out served the ban. */
    expect(banned.suspension).toBe(0);
    expect(isAvailable(injured, addDays(state.date, 10))).toBe(true);
  });

  it("refuses a team sheet naming an unavailable player", () => {
    const state = career();
    advance(state);
    const squad = squadOf(state, "a");
    const sheet = autoTeamSheet({ clubId: "a", squad: squad.map(toEngine), reputation: 3 });
    const starter = state.players[sheet.starters[3]!.player.id]!;
    starter.suspension = 1;
    expect(() => playToday(state, sheet)).toThrow(/Not available/);
  });

  it("bans a sent-off player and brings injuries over a season", () => {
    const state = career();
    advance(state);
    const fixture = state.fixtures.find((f) => !f.result && f.date === state.date)!;
    const player = squadOf(state, fixture.homeClubId)[4]!;
    const line = {
      playerId: player.id,
      side: "home" as const,
      position: player.position,
      minutes: 60,
      rating: 5,
      goals: 0,
      assists: 0,
      shots: 0,
      yellowCards: 0,
      redCard: true,
      fatigue: 0,
    };
    const result = {
      score: { home: 0, away: 0 },
      stats: {} as never,
      players: [line],
      manOfTheMatch: player.id,
      events: [],
    };
    afterMatch(state, fixture, result, indexSquads(state), new Map());
    expect(player.suspension).toBe(2);

    simulateToSeasonEnd(state);
    simulateToSeasonEnd(state);
    expect(state.inbox.map((m) => m.kind)).toContain("injury");
  });
});

describe("morale", () => {
  it("rises with wins and playing time, falls for key players left out", () => {
    const state = career();
    const squad = squadOf(state, "a");
    const roles = rolesOf(squad);
    const key = squad.find((p) => roles.get(p.id) === "key")!;
    const backup = squad.find((p) => roles.get(p.id) === "backup")!;
    for (const p of squad) p.morale = 60;
    const minutes = new Map(squad.filter((p) => p !== key).map((p) => [p.id, 90]));
    updateMorale(squad, minutes, "loss");
    expect(key.morale).toBeLessThan(58);
    expect(backup.morale).toBeGreaterThan(60);
    const before = squad[5]!.morale;
    updateMorale(squad, new Map(squad.map((p) => [p.id, 90])), "win");
    expect(squad[5]!.morale).toBeGreaterThan(before);
  });

  it("treats a second keeper as a substitute, not a key player", () => {
    const state = career();
    const squad = squadOf(state, "a");
    const roles = rolesOf(squad);
    const keepers = squad.filter((p) => p.position === "GB");
    expect(
      keepers.map((k) => roles.get(k.id)).filter((r) => r === "key" || r === "regular"),
    ).toHaveLength(1);
  });

  it("keeps hidden personality stable for a player", () => {
    const a = career(1);
    const b = career(1);
    expect(a.players["a-3"]!.personality).toEqual(b.players["a-3"]!.personality);
  });
});
