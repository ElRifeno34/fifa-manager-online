import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  CareerProvider,
  useCareer,
  initialCareer,
  findPlayers,
  captureCareer,
  restoreCareer,
} from "@/components/om/career/session";
import { CAREER_PLAYERS, CAREER_FIXTURES } from "@/data/mock";
import { careerPaths } from "@/components/om/career/ui";
afterEach(cleanup);
describe("Career V1 rules", () => {
  it("provides the requested 21 views", () => {
    expect(new Set(careerPaths).size).toBe(21);
  });
  it("uses only 2026–27 season dates", () => {
    expect(CAREER_FIXTURES[0]?.date).toBe("2026-08-16");
    expect(CAREER_FIXTURES.at(-1)?.date).toBe("2027-05-30");
    expect(CAREER_FIXTURES.every((f) => f.date >= "2026-08-01" && f.date <= "2027-06-30")).toBe(
      true,
    );
  });
  it("resets career changes when the provider is remounted", () => {
    let ctx: ReturnType<typeof useCareer> | undefined;
    function Probe() {
      ctx = useCareer();
      return null;
    }
    const view = render(
      <CareerProvider>
        <Probe />
      </CareerProvider>,
    );
    act(() => ctx?.update((s) => ({ ...s, budget: 5, current: 38 })));
    expect(ctx?.state.budget).toBe(5);
    view.unmount();
    render(
      <CareerProvider>
        <Probe />
      </CareerProvider>,
    );
    expect(ctx?.state.budget).toBe(84.5);
    expect(ctx?.state.current).toBe(11);
  });
  it("restores roster and budget from a temporary snapshot", () => {
    const original = initialCareer();
    const snapshot = captureCareer(original);
    const changed = {
      ...original,
      budget: 10,
      current: 30,
      squad: [],
      saved: [{ name: "Exemple", current: original.current, snapshot }],
    };
    const restored = restoreCareer(changed, 0);
    expect(restored.budget).toBe(84.5);
    expect(restored.current).toBe(11);
    expect(restored.squad).toHaveLength(22);
  });
  it("has 11 starters without duplicate player selections", () => {
    expect(initialCareer().lineup).toHaveLength(11);
    expect(new Set(initialCareer().lineup).size).toBe(11);
  });
  it("filters search without losing accents in names", () => {
    expect(findPlayers(CAREER_PLAYERS, "morel", "Tous", "Tous", "name").map((p) => p.name)).toEqual(
      ["Adrien Morel"],
    );
  });
  it("filters player position and status together", () => {
    expect(findPlayers(CAREER_PLAYERS, "", "DC", "Incertain", "rating").map((p) => p.name)).toEqual(
      ["Jonas Keller"],
    );
  });
  it("orders fatigue descending", () => {
    const result = findPlayers(CAREER_PLAYERS, "", "Tous", "Tous", "fatigue");
    expect(result[0]?.fatigue).toBe(76);
    expect(result[1]?.fatigue).toBe(72);
  });
});
