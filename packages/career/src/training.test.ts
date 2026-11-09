import { describe, expect, it } from "vitest";
import { addDays, advance, moveTo, playToday, squadOf } from "./index.ts";
import { career } from "./test-world.ts";
import { familiarityWith, practise, suggestTraining } from "./training.ts";
import type { CareerState } from "./types.ts";

const youngest = (state: CareerState, clubId: string) =>
  squadOf(state, clubId)
    .filter((p) => p.potential > p.overall + 3)
    .sort((a, b) => a.birthDate.localeCompare(b.birthDate))
    .at(-1)!;

describe("familiarity", () => {
  it("starts high for the club's own system and grows with practice", () => {
    const state = career();
    const club = state.clubs.a!;
    expect(familiarityWith(club, club.tactics!)).toBeGreaterThanOrEqual(0.7);
    const fresh = { formation: "3-5-2", style: "direct", pressing: "low", line: "low" } as const;
    const before = familiarityWith(club, fresh);
    practise(club.familiarity, fresh, 12);
    expect(familiarityWith(club, fresh)).toBeGreaterThan(before);
  });

  it("is passed to the engine and follows the manager's choice", () => {
    const state = career();
    state.tactics = { formation: "5-3-2", style: "direct", pressing: "low", line: "low" };
    advance(state);
    playToday(state);
    expect(state.clubs.a!.tactics).toEqual(state.tactics);
    expect(state.clubs.a!.familiarity.formations["5-3-2"]).toBeGreaterThan(30);
  });
});

describe("assistant plan", () => {
  it("rests a tired squad, goes light before a match, drills an unknown system", () => {
    const state = career();
    const squad = squadOf(state, "a");
    for (const p of squad) {
      p.fatigue = 50;
      p.fatigueDate = state.date;
    }
    expect(suggestTraining(state, "a", squad).theme).toBe("recovery");
    for (const p of squad) p.fatigue = 0;
    const match = state.fixtures.find((f) => f.homeClubId === "a" || f.awayClubId === "a")!;
    state.date = addDays(match.date, -1);
    expect(suggestTraining(state, "a", squad).intensity).toBe("light");
    state.date = addDays(match.date, -3);
    state.clubs.a!.tactics = { formation: "3-5-2", style: "direct", pressing: "low", line: "low" };
    expect(suggestTraining(state, "a", squad).theme).toBe("tactical");
  });
});

describe("weekly sessions", () => {
  it("makes young players grow, more on their focus, and tires by intensity", () => {
    const hard = career();
    const soft = career();
    hard.training = { intensity: "high", theme: "technical" };
    soft.training = { intensity: "light", theme: "technical" };
    const kid = youngest(hard, "a");
    hard.players[kid.id]!.trainingFocus = "attack";
    const start = { ...kid.attributes };
    const overall = kid.overall;
    moveTo(hard, addDays(hard.date, 8));
    moveTo(soft, addDays(soft.date, 8));
    const trained = hard.players[kid.id]!;
    expect(trained.overall).toBeGreaterThan(overall);
    expect(trained.attributes.finishing - start.finishing).toBeGreaterThan(
      trained.attributes.tackling - start.tackling,
    );
    expect(trained.overall - overall).toBeGreaterThan(soft.players[kid.id]!.overall - overall);
    expect(hard.players[kid.id]!.fatigue).toBeGreaterThan(soft.players[kid.id]!.fatigue);
  });

  it("lets the assistant plan when the manager does not", () => {
    const state = career();
    moveTo(state, addDays(state.date, 8));
    expect(state.assistantPlan).not.toBeNull();
  });

  it("leaves veterans without growth and the injured out of the session", () => {
    const state = career();
    state.training = { intensity: "high", theme: "physical" };
    const squad = squadOf(state, "a");
    const veteran = squad.sort((a, b) => a.birthDate.localeCompare(b.birthDate))[0]!;
    const injured = squadOf(state, "a").find((p) => p !== veteran && p.potential > p.overall)!;
    injured.injury = { kind: "entorse", until: addDays(state.date, 30) };
    const [v, i] = [veteran.overall, injured.overall];
    moveTo(state, addDays(state.date, 8));
    expect(veteran.overall).toBe(v);
    expect(injured.overall).toBe(i);
  });
});
