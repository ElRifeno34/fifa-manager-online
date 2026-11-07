import { describe, expect, it } from "vitest";
import { ATTRIBUTES, packSchema, type Attributes, type Pack, type Player } from "./schema.ts";

const attributes = Object.fromEntries(ATTRIBUTES.map((a) => [a, 10])) as Attributes;

const player: Player = {
  id: "tm-1",
  clubId: "a",
  name: "Test",
  nationality: "ESP",
  birthDate: "2000-01-01",
  foot: "right",
  heightCm: 180,
  number: 9,
  squad: "first-team",
  position: "BU",
  secondaryPositions: [],
  marketValueEur: 1000000,
  overall: 70,
  potential: 75,
  attributes,
  lastSeason: null,
  levelFromData: true,
};

const club = (id: string) => ({
  id,
  name: id,
  initials: "AA",
  city: "X",
  primary: "#000000",
  secondary: "#FFFFFF",
  reputation: 3,
});

const fixture = (homeClubId: string, awayClubId: string, round: number) => ({
  round,
  date: "2026-08-15",
  time: null,
  homeClubId,
  awayClubId,
});

const pack: Pack = {
  meta: { id: "p", name: "P", season: "2026-27", version: 1, generatedAt: "now", sources: [] },
  league: { id: "l", name: "L", country: "C", fixturesSource: "generated" },
  clubs: [club("a"), club("b")],
  players: [player],
  fixtures: [fixture("a", "b", 1), fixture("b", "a", 2)],
  newspapers: [],
};

describe("packSchema", () => {
  it("accepts a coherent pack", () => {
    expect(packSchema.safeParse(pack).success).toBe(true);
  });
  it("rejects a player from an unknown club", () => {
    const players = [{ ...player, clubId: "z" }];
    expect(packSchema.safeParse({ ...pack, players }).success).toBe(false);
  });
  it("rejects duplicate players", () => {
    expect(packSchema.safeParse({ ...pack, players: [player, player] }).success).toBe(false);
  });
  it("rejects an incomplete fixture list", () => {
    expect(packSchema.safeParse({ ...pack, fixtures: [pack.fixtures[0]] }).success).toBe(false);
  });
  it("rejects out-of-range attributes", () => {
    const players = [{ ...player, attributes: { ...attributes, pace: 21 } }];
    expect(packSchema.safeParse({ ...pack, players }).success).toBe(false);
  });
});
