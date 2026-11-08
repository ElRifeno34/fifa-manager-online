import { describe, expect, it } from "vitest";
import { autoTeamSheet, pickLineup } from "./lineup.ts";
import { FORMATIONS, positionFit } from "./positions.ts";
import { makePlayer, makeSquad } from "./test-teams.ts";

describe("positionFit", () => {
  const winger = makePlayer("w", "AG", 15);
  it("penalises neighbouring and distant slots", () => {
    expect(positionFit(winger, "AG")).toBe(1);
    expect(positionFit(winger, "BU")).toBe(0.9);
    expect(positionFit(winger, "DC")).toBe(0.75);
    expect(positionFit(winger, "GB")).toBe(0.3);
  });
  it("accepts secondary positions", () => {
    expect(positionFit({ ...winger, secondaryPositions: ["DC"] }, "DC")).toBe(0.95);
  });
});

describe("pickLineup", () => {
  const squad = makeSquad("a", 14);

  it("fields eleven different players, a keeper in goal, each in his position", () => {
    const { starters, bench } = pickLineup(squad, "4-3-3");
    expect(starters).toHaveLength(11);
    expect(new Set(starters.map((s) => s.player.id)).size).toBe(11);
    expect(starters.map((s) => s.position)).toEqual(FORMATIONS["4-3-3"]);
    for (const s of starters) expect(s.player.position).toBe(s.position);
    expect(bench.some((p) => p.position === "GB")).toBe(true);
    expect(bench.some((p) => starters.some((s) => s.player.id === p.id))).toBe(false);
  });

  it("rests an exhausted player when a fresh one can play", () => {
    const tired = pickLineup(squad, "4-4-2").starters.find((s) => s.position === "BU")!.player;
    const rested = pickLineup(squad, "4-4-2", { [tired.id]: { fatigue: 90, form: 0 } });
    expect(rested.starters.some((s) => s.player.id === tired.id)).toBe(false);
  });

  it("refuses a squad too small for a team", () => {
    expect(() => pickLineup(squad.slice(0, 10), "4-4-2")).toThrow();
  });
});

describe("autoTeamSheet", () => {
  it("styles the team after its standing", () => {
    const squad = makeSquad("a", 14);
    expect(autoTeamSheet({ clubId: "a", squad, reputation: 5 }).tactics).toMatchObject({
      style: "possession",
      pressing: "high",
    });
    expect(autoTeamSheet({ clubId: "a", squad, reputation: 1 }).tactics).toMatchObject({
      style: "direct",
      line: "low",
    });
  });

  it("keeps imposed tactics and their formation", () => {
    const tactics = { formation: "5-3-2", style: "direct", pressing: "low", line: "low" } as const;
    const sheet = autoTeamSheet({ clubId: "a", squad: makeSquad("a", 14), reputation: 5, tactics });
    expect(sheet.tactics).toEqual(tactics);
    expect(sheet.starters.map((s) => s.position)).toEqual(FORMATIONS["5-3-2"]);
  });

  it("picks a back three when the squad has three good centre-backs and no full-backs", () => {
    const squad = makeSquad("a", 14).map((p) =>
      p.position === "DG" || p.position === "DD" ? { ...p, overall: 40 } : p,
    );
    const { formation } = autoTeamSheet({ clubId: "a", squad, reputation: 3 }).tactics;
    expect(formation).toBe("3-5-2");
  });
});
