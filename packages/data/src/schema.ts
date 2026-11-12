import { z } from "zod";

/** Position codes from GAME_DESIGN.md, section 4. */
export const POSITIONS = [
  "GB",
  "DC",
  "DG",
  "DD",
  "MDC",
  "MC",
  "MOC",
  "MG",
  "MD",
  "AG",
  "AD",
  "BU",
] as const;
export type Position = (typeof POSITIONS)[number];

/** The 15 attributes from GAME_DESIGN.md, section 4. */
export const ATTRIBUTES = [
  "passing",
  "dribbling",
  "finishing",
  "crossing",
  "pace",
  "stamina",
  "strength",
  "vision",
  "positioning",
  "composure",
  "tackling",
  "marking",
  "reflexes",
  "gkPositioning",
  "gkDistribution",
] as const;
export type Attribute = (typeof ATTRIBUTES)[number];

const attributeValue = z.number().int().min(1).max(20);
const rating = z.number().int().min(1).max(99);
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/);
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value, "Invalid calendar date");
const isoDateTime = z.string().datetime({ offset: true });

export const attributesSchema = z.strictObject(
  Object.fromEntries(ATTRIBUTES.map((a) => [a, attributeValue])) as Record<
    Attribute,
    typeof attributeValue
  >,
);

export const seasonStatsSchema = z.strictObject({
  season: z.string(),
  appearances: z.number().int().min(0),
  minutes: z.number().int().min(0),
  goals: z.number().int().min(0),
  assists: z.number().int().min(0),
  yellowCards: z.number().int().min(0),
  redCards: z.number().int().min(0),
});

export const playerSchema = z.strictObject({
  id: z.string().min(1),
  clubId: z.string().min(1),
  name: z.string().min(1),
  /** Three-letter code, as used by Wikipedia squad tables. */
  nationality: z.string().min(2),
  birthDate: isoDate.nullable(),
  foot: z.enum(["left", "right", "both"]).nullable(),
  heightCm: z.number().int().min(140).max(220).nullable(),
  number: z.number().int().min(1).max(99).nullable(),
  squad: z.enum(["first-team", "reserve"]),
  position: z.enum(POSITIONS),
  secondaryPositions: z.array(z.enum(POSITIONS)),
  marketValueEur: z.number().int().min(0).nullable(),
  overall: rating,
  /** Hidden in the game: the player only ever sees an estimate. */
  potential: rating,
  attributes: attributesSchema,
  lastSeason: seasonStatsSchema.nullable(),
  /** False when no market value was found and the level comes from the squad role alone. */
  levelFromData: z.boolean(),
});

export const clubSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  initials: z.string().min(2).max(5),
  city: z.string().min(1).nullable(),
  primary: hexColor,
  secondary: hexColor,
  reputation: z.number().int().min(1).max(5),
  /**
   * Collective strength not explained by the players' level (coach, form), as a share of every
   * attribute. Fitted on the season's betting odds by the engine (npm run tune:clubs).
   */
  levelAdjustment: z.number().min(-0.3).max(0.3).optional(),
});

export const fixtureSchema = z.strictObject({
  round: z.number().int().min(1),
  date: isoDate,
  time: z.string().nullable(),
  homeClubId: z.string().min(1),
  awayClubId: z.string().min(1),
});

export const newspaperSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  city: z.string().min(1),
  tone: z.string().min(1),
  favoriteClubIds: z.array(z.string()),
});

export const packSchema = z
  .strictObject({
    meta: z.strictObject({
      id: z.string().min(1),
      name: z.string().min(1),
      season: z.string().regex(/^\d{4}-\d{2}$/),
      version: z.number().int().min(1),
      generatedAt: isoDateTime,
      sources: z.array(z.string()),
    }),
    league: z.strictObject({
      id: z.string().min(1),
      name: z.string().min(1),
      country: z.string().min(1),
      /** "generated" is a plain double round-robin: real dates and play-offs are not included. */
      fixturesSource: z.enum(["openfootball", "generated"]),
    }),
    clubs: z.array(clubSchema).min(2),
    players: z.array(playerSchema),
    fixtures: z.array(fixtureSchema),
    newspapers: z.array(newspaperSchema),
  })
  .superRefine((pack, ctx) => {
    const clubIds = new Set(pack.clubs.map((c) => c.id));
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });

    for (const [label, ids] of [
      ["club", pack.clubs.map((c) => c.id)],
      ["newspaper", pack.newspapers.map((n) => n.id)],
    ] as const) {
      if (new Set(ids).size !== ids.length) fail(`Duplicate ${label} id`);
    }

    for (const newspaper of pack.newspapers) {
      for (const clubId of newspaper.favoriteClubIds) {
        if (!clubIds.has(clubId)) {
          fail(`Unknown favorite club ${clubId} for newspaper ${newspaper.id}`);
        }
      }
    }

    const clubNames = new Set(pack.clubs.map((c) => c.name));
    if (clubNames.size !== pack.clubs.length) fail("Duplicate club name");

    const playerIds = new Set<string>();
    for (const p of pack.players) {
      if (playerIds.has(p.id)) fail(`Duplicate player id: ${p.id}`);
      playerIds.add(p.id);
      if (!clubIds.has(p.clubId)) fail(`Unknown club ${p.clubId} for player ${p.id}`);
    }
    for (const f of pack.fixtures) {
      if (!clubIds.has(f.homeClubId)) fail(`Unknown home club: ${f.homeClubId}`);
      if (!clubIds.has(f.awayClubId)) fail(`Unknown away club: ${f.awayClubId}`);
      if (f.homeClubId === f.awayClubId) fail(`Club cannot play itself: ${f.homeClubId}`);
    }
    const expected = pack.clubs.length * (pack.clubs.length - 1);
    if (pack.fixtures.length !== expected) {
      fail(`Expected ${expected} fixtures for a double round-robin, got ${pack.fixtures.length}`);
    }

    const fixtureKeys = new Set<string>();
    const roundFixtures = new Map<number, Fixture[]>();
    for (const fixture of pack.fixtures) {
      const key = `${fixture.round}:${fixture.homeClubId}:${fixture.awayClubId}`;
      if (fixtureKeys.has(key)) fail(`Duplicate fixture: ${key}`);
      fixtureKeys.add(key);
      roundFixtures.set(fixture.round, [...(roundFixtures.get(fixture.round) ?? []), fixture]);
    }

    for (const [round, fixtures] of roundFixtures) {
      const playing = new Set<string>();
      for (const fixture of fixtures) {
        for (const clubId of [fixture.homeClubId, fixture.awayClubId]) {
          if (playing.has(clubId)) fail(`Club ${clubId} plays more than once in round ${round}`);
          playing.add(clubId);
        }
      }
    }

    const pairings = new Map<string, { count: number; homeCount: number }>();
    for (const fixture of pack.fixtures) {
      const pair = [fixture.homeClubId, fixture.awayClubId].sort().join(":");
      const current = pairings.get(pair) ?? { count: 0, homeCount: 0 };
      pairings.set(pair, {
        count: current.count + 1,
        homeCount: current.homeCount + (fixture.homeClubId < fixture.awayClubId ? 1 : 0),
      });
    }
    for (const [pair, counts] of pairings) {
      if (counts.count !== 2) {
        fail(`Expected each club pairing twice, got ${counts.count} for ${pair}`);
      }
      if (counts.homeCount !== 1) fail(`Expected one home fixture for pair ${pair}`);
    }
  });

export type Attributes = z.infer<typeof attributesSchema>;
export type SeasonStats = z.infer<typeof seasonStatsSchema>;
export type Player = z.infer<typeof playerSchema>;
export type Club = z.infer<typeof clubSchema>;
export type Fixture = z.infer<typeof fixtureSchema>;
export type Newspaper = z.infer<typeof newspaperSchema>;
export type Pack = z.infer<typeof packSchema>;
