import { describe, expect, it } from "vitest";
import { generateRoundRobin, matchClubNames } from "./fixtures.ts";
import { parseKitColors } from "./wikitext.ts";

describe("generateRoundRobin", () => {
  const clubs = ["a", "b", "c", "d", "e", "f"];
  const fixtures = generateRoundRobin(clubs, "2026-08-15");

  it("plays every pairing once at home and once away", () => {
    const pairs = new Set(fixtures.map((f) => `${f.homeClubId}-${f.awayClubId}`));
    expect(fixtures).toHaveLength(30);
    expect(pairs.size).toBe(30);
  });
  it("gives every club one match per round", () => {
    for (let round = 1; round <= 10; round++) {
      const matches = fixtures.filter((f) => f.round === round);
      const playing = matches.flatMap((f) => [f.homeClubId, f.awayClubId]);
      expect(new Set(playing).size).toBe(clubs.length);
    }
  });
  it("keeps a balanced home record", () => {
    for (const club of clubs) {
      expect(fixtures.filter((f) => f.homeClubId === club)).toHaveLength(5);
    }
  });
  it("schedules a round a week", () => {
    expect(fixtures[0]?.date).toBe("2026-08-15");
    expect(fixtures.find((f) => f.round === 2)?.date).toBe("2026-08-22");
  });
  it("refuses an odd number of clubs", () => {
    expect(() => generateRoundRobin(["a", "b", "c"], "2026-08-15")).toThrow();
  });
});

describe("matchClubNames", () => {
  const clubs = [
    { id: "man-city", names: ["Manchester City", "Manchester City F.C."] },
    { id: "man-utd", names: ["Manchester United", "Manchester United F.C."] },
    { id: "bayern", names: ["Bayern Munich", "FC Bayern Munich"] },
  ];

  it("tells apart clubs sharing a word and ignores suffixes", () => {
    const { matches, unmatched } = matchClubNames(
      ["Manchester United FC", "Manchester City FC", "FC Bayern München"],
      clubs,
    );
    expect(matches.get("Manchester United FC")).toBe("man-utd");
    expect(matches.get("Manchester City FC")).toBe("man-city");
    expect(matches.get("FC Bayern München")).toBe("bayern");
    expect(unmatched).toEqual([]);
  });
  it("reports what it cannot match", () => {
    expect(matchClubNames(["Arsenal FC"], clubs).unmatched).toEqual(["Arsenal FC"]);
  });
});

describe("parseKitColors", () => {
  it("reads the home kit and skips colours equal to the body", () => {
    const infobox = "| body1 = ff0000\n| shorts1 = FF0000\n| socks1 = 000000";
    expect(parseKitColors(infobox)).toEqual({ primary: "#FF0000", secondary: "#000000" });
  });
  it("falls back on a contrasting secondary colour", () => {
    expect(parseKitColors("| body1 = FFFFFF")?.secondary).toBe("#121A23");
    expect(parseKitColors("| body1 = 003399")?.secondary).toBe("#FFFFFF");
  });
  it("returns null without a usable kit", () => {
    expect(parseKitColors("| body1 = red")).toBeNull();
  });
});
