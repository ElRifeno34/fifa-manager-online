/** Small synthetic world for the tests: two linked divisions of four clubs. */
import { deriveAttributes, generateRoundRobin, type Pack, type Position } from "@fmo/data";
import { autoReply } from "./conversations.ts";
import { createCareer } from "./world.ts";
import type { CareerState } from "./types.ts";

export const POSITIONS: Position[] = [
  "GB",
  "GB",
  "DC",
  "DC",
  "DC",
  "DG",
  "DD",
  "DG",
  "MDC",
  "MC",
  "MC",
  "MC",
  "MOC",
  "MG",
  "MD",
  "AG",
  "AD",
  "BU",
  "BU",
  "BU",
  "DC",
  "MC",
];

export function makePack(leagueId: string, clubIds: string[], level: number): Pack {
  return {
    meta: {
      id: `${leagueId}-2026-27`,
      name: leagueId,
      season: "2026-27",
      version: 1,
      generatedAt: "",
      sources: [],
    },
    league: { id: leagueId, name: leagueId, country: "France", fixturesSource: "generated" },
    clubs: clubIds.map((id, i) => ({
      id,
      name: id.toUpperCase(),
      initials: id.slice(0, 3).toUpperCase(),
      city: null,
      primary: "#112233",
      secondary: "#FFFFFF",
      reputation: 3,
      ...(i === 0 ? { levelAdjustment: 0.1 } : {}),
    })),
    players: clubIds.flatMap((clubId, c) =>
      POSITIONS.map((position, i) => {
        const overall = level + c * 2 - (i % 5);
        const age = 18 + ((i * 7 + c) % 18);
        return {
          id: `${clubId}-${i}`,
          clubId,
          name: `${clubId} player ${i}`,
          nationality: "FRA",
          birthDate: `${2026 - age}-03-0${1 + (i % 9)}`,
          foot: "right" as const,
          heightCm: 180,
          number: i + 1,
          squad: "first-team" as const,
          position,
          secondaryPositions: [],
          marketValueEur: null,
          overall,
          potential: Math.min(95, overall + (age < 23 ? 12 : 0)),
          attributes: deriveAttributes({
            id: `${clubId}-${i}`,
            position,
            overall,
            age,
            heightCm: 180,
            performance: null,
          }),
          lastSeason: null,
          levelFromData: false,
        };
      }),
    ),
    fixtures: generateRoundRobin(clubIds, "2026-08-15").map((f) => ({ ...f, time: null })),
    newspapers: [],
  };
}

export const LINKS = [{ upper: "top", lower: "second", places: 1 }];

/** A career with the pre-season meeting answered, ready to play. */
export function career(seed = 5): CareerState {
  const state = freshCareer(seed);
  autoReply(state);
  return state;
}

export function freshCareer(seed = 5): CareerState {
  return createCareer({
    packs: [
      makePack("top", ["a", "b", "c", "d"], 70),
      makePack("second", ["e", "f", "g", "h"], 60),
    ],
    clubId: "a",
    managerName: "Test",
    seed,
    links: LINKS,
  });
}
