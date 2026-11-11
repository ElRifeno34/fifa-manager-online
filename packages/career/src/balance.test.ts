import { describe, expect, it } from "vitest";
import { generateRoundRobin } from "@fmo/data";
import { addDays, budgets, createCareer, moveTo, simulateToSeasonEnd, squadOf } from "./index.ts";
import { investSurplus, payPrizes } from "./finance.ts";
import { career, makePack } from "./test-world.ts";
import { leagueCalendar } from "./world.ts";
import { ABROAD } from "./types.ts";

describe("economy", () => {
  it("pays more prize money to the champion than to the last club", () => {
    const state = career();
    simulateToSeasonEnd(state);
    const record = state.history.find((r) => r.leagueId === "top")!;
    const before = new Map(
      record.table.map((l) => [l.clubId, state.clubs[l.clubId]!.finance.balance]),
    );
    payPrizes(state, [record]);
    const gain = (id: string) => state.clubs[id]!.finance.balance - before.get(id)!;
    expect(gain(record.table[0]!.clubId)).toBeGreaterThan(gain(record.table.at(-1)!.clubId) * 2);
  });

  it("invests half of the cash above the board's reserve", () => {
    const state = career();
    const f = state.clubs.a!.finance;
    f.balance = f.revenue;
    investSurplus(state);
    expect(f.balance).toBe(Math.round(f.revenue - (f.revenue * 0.6) / 2));
  });

  it("gives no transfer budget to a club in debt", () => {
    expect(budgets(100e6, -1).transferBudget).toBe(0);
    expect(budgets(100e6, 10e6).transferBudget).toBeGreaterThan(0);
  });
});

describe("market flows", () => {
  it("sells players abroad and signs foreign players during the windows", () => {
    const state = career();
    for (const club of Object.values(state.clubs)) club.finance.transferBudget *= 5;
    for (let week = 0; week < 3; week++) moveTo(state, addDays(state.date, 7));
    simulateToSeasonEnd(state);
    for (let week = 0; week < 3; week++) moveTo(state, addDays(state.date, 7));
    const out = state.transfers.filter((t) => t.toId === ABROAD);
    const inward = state.transfers.filter((t) => t.fromId === ABROAD);
    expect(out.length + inward.length).toBeGreaterThan(0);
    for (const t of out) expect(state.players[t.playerId]!.abroad).toBe(true);
    for (const t of inward) expect(state.players[t.playerId]!.clubId).not.toBeNull();
  });

  it("puts the best players of a club in debt up for sale", () => {
    const state = career();
    const club = state.clubs.e!;
    club.finance.balance = -club.finance.revenue;
    moveTo(state, addDays(state.date, 7));
    expect(squadOf(state, "e").some((p) => p.listed)).toBe(true);
  });
});

describe("calendars", () => {
  it("plays a single, balanced round in leagues of more than 24 clubs", () => {
    const ids = Array.from({ length: 30 }, (_, i) => `c${i}`);
    const fixtures = leagueCalendar(ids, "2026-08-15");
    expect(fixtures).toHaveLength((30 * 29) / 2);
    for (const id of ids) {
      const home = fixtures.filter((f) => f.homeClubId === id).length;
      expect(Math.abs(home - 14.5)).toBeLessThanOrEqual(1.5);
    }
    expect(leagueCalendar(ids.slice(0, 20), "2026-08-15")).toHaveLength(
      generateRoundRobin(ids.slice(0, 20), "2026-08-15").length,
    );
  });

  it("starts a 30-club league in summer 2026 with 29 matches each", () => {
    const ids = Array.from({ length: 30 }, (_, i) => `c${i}`);
    const pack = makePack("big", ids, 65);
    const state = createCareer({ packs: [pack], clubId: "c0", managerName: "T", seed: 1 });
    expect(
      state.fixtures.filter((f) => f.homeClubId === "c0" || f.awayClubId === "c0"),
    ).toHaveLength(29);
  });
});
