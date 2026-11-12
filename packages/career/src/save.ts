import { z } from "zod";
import { CAREER_FORMAT, CAREER_VERSION, type CareerState } from "./types.ts";

export const saveCareer = (state: CareerState): string => JSON.stringify(state);

const nonEmptyString = z.string().min(1);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = Date.parse(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
  }, "Invalid calendar date");
const idList = z.array(nonEmptyString);

const playerSeasonSchema = z.object({
  apps: z.number().int().nonnegative(),
  minutes: z.number().int().nonnegative(),
  goals: z.number().int().nonnegative(),
  assists: z.number().int().nonnegative(),
  ratingSum: z.number().finite().nonnegative(),
  yellows: z.number().int().nonnegative(),
  reds: z.number().int().nonnegative(),
  starts: z.number().int().nonnegative(),
});

const playerHistorySchema = playerSeasonSchema.extend({
  season: nonEmptyString,
  clubId: nonEmptyString,
  leagueId: nonEmptyString,
});

const playerSchema = z.object({
  id: nonEmptyString,
  name: nonEmptyString,
  birthDate: date,
  overall: z.number().finite().min(1).max(99),
  potential: z.number().finite().min(1).max(99),
  morale: z.number().finite().min(0).max(100),
  fatigue: z.number().finite().min(0).max(100),
  suspension: z.number().int().nonnegative(),
  ratings: z.array(z.number().finite().min(0).max(10)),
  season: playerSeasonSchema,
  history: z.array(playerHistorySchema),
  attributes: z.record(nonEmptyString, z.number().finite().min(1).max(20)),
  personality: z.object({
    ambition: z.number().finite().min(1).max(20),
    loyalty: z.number().finite().min(1).max(20),
    temperament: z.number().finite().min(1).max(20),
    professionalism: z.number().finite().min(1).max(20),
  }),
  contract: z
    .object({ wage: z.number().finite().nonnegative(), until: z.string().regex(/^\d{4}-\d{2}$/) })
    .nullable(),
  injury: z.object({ kind: nonEmptyString, until: date }).nullable(),
});

const careerSaveSchema = z
  .object({
    format: z.literal(CAREER_FORMAT),
    version: z.number().int().positive(),
    seed: z.number().int(),
    date,
    season: z.object({
      label: z.string().regex(/^\d{4}-\d{2}$/),
      index: z.number().int().nonnegative(),
      start: date,
    }),
    manager: z.object({ name: nonEmptyString, clubId: nonEmptyString }),
    leagues: z.array(
      z.object({
        id: nonEmptyString,
        name: nonEmptyString,
        country: nonEmptyString,
        tier: z.union([z.literal(1), z.literal(2)]),
      }),
    ),
    links: z.array(
      z.object({
        upper: nonEmptyString,
        lower: nonEmptyString,
        places: z.number().int().positive(),
      }),
    ),
    clubs: z.record(
      nonEmptyString,
      z
        .object({
          id: nonEmptyString,
          name: nonEmptyString,
          leagueId: nonEmptyString,
          reputation: z.number().int().min(1).max(5),
        })
        .passthrough(),
    ),
    players: z.record(nonEmptyString, playerSchema.passthrough()),
    fixtures: z.array(
      z.object({
        id: z.number().int().positive(),
        leagueId: nonEmptyString,
        date,
        homeClubId: nonEmptyString,
        awayClubId: nonEmptyString,
        result: z.unknown().nullable(),
      }),
    ),
    newspapers: z.array(z.object({ id: nonEmptyString, favoriteClubIds: idList })),
    inbox: z.array(z.object({ id: z.number().int().positive(), date, read: z.boolean() })),
    history: z.array(
      z.object({
        season: nonEmptyString,
        leagueId: nonEmptyString,
        table: z.array(
          z.object({
            clubId: nonEmptyString,
            played: z.number().int().nonnegative(),
            points: z.number().int().nonnegative(),
          }),
        ),
        promoted: idList,
        relegated: idList,
      }),
    ),
    payday: date,
    trainingDay: date,
    marketDay: date,
    talkDay: date,
    nextId: z.number().int().positive(),
    negotiations: z.array(
      z.object({
        id: z.number().int().positive(),
        playerId: nonEmptyString,
        stage: z.enum(["fee", "contract", "done", "failed"]),
      }),
    ),
    offers: z.array(
      z.object({
        id: z.number().int().positive(),
        playerId: nonEmptyString,
        buyerId: nonEmptyString,
        status: z.enum(["open", "accepted", "rejected", "withdrawn"]),
      }),
    ),
    transfers: z.array(
      z.object({
        date,
        playerId: nonEmptyString,
        toId: nonEmptyString,
        fee: z.number().finite().nonnegative(),
      }),
    ),
    promises: z.array(
      z.object({ playerId: nonEmptyString, role: z.enum(["key", "regular", "rotation"]), date }),
    ),
    conversations: z.array(
      z.object({
        id: z.number().int().positive(),
        date,
        status: z.enum(["open", "closed"]),
        choices: z.array(z.object({ id: nonEmptyString, label: nonEmptyString })),
      }),
    ),
    board: z.object({ confidence: z.number().finite().min(0).max(100), lastReview: date }),
    training: z
      .object({
        intensity: z.enum(["light", "normal", "high"]),
        theme: z.enum(["physical", "technical", "tactical", "setPieces", "recovery"]),
      })
      .nullable(),
    assistantPlan: z
      .object({
        intensity: z.enum(["light", "normal", "high"]),
        theme: z.enum(["physical", "technical", "tactical", "setPieces", "recovery"]),
      })
      .nullable(),
  })
  .passthrough();

/** Reads a saved career; refuses files from another game or a newer version. */
export function loadCareer(text: string): CareerState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid save file: the file is not valid JSON");
  }
  if (!parsed || typeof parsed !== "object" || !("format" in parsed)) {
    throw new Error("Not an Online Manager save");
  }
  const envelope = parsed as Record<string, unknown>;
  if (envelope.format !== CAREER_FORMAT) throw new Error("Not an Online Manager save");
  /* Reject foreign/new versions before validating this version's full shape. */
  if (envelope.version !== CAREER_VERSION) {
    throw new Error(
      `Save version ${String(envelope.version)} does not match this game (${CAREER_VERSION})`,
    );
  }
  const result = careerSaveSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Invalid save file: ${result.error.issues[0]?.message ?? "invalid data"}`);
  }
  /* Validate without rebuilding: Zod strips undeclared fields, which would corrupt valid saves. */
  const data = parsed as CareerState;
  /* No migration yet: a save from another version of the rules cannot be read. */
  const state = data;
  if (!state.clubs[state.manager.clubId])
    throw new Error("Invalid save file: manager club is missing");
  for (const [key, player] of Object.entries(state.players)) {
    if (key !== player.id) throw new Error(`Invalid save file: player key mismatch (${key})`);
    if (player.clubId && !player.retired && !state.clubs[player.clubId]) {
      throw new Error(`Invalid save file: player ${player.id} references an unknown club`);
    }
  }
  for (const fixture of state.fixtures) {
    if (!state.clubs[fixture.homeClubId] || !state.clubs[fixture.awayClubId]) {
      throw new Error(`Invalid save file: fixture ${fixture.id} references an unknown club`);
    }
  }
  for (const offer of state.offers) {
    if (!state.players[offer.playerId] || !state.clubs[offer.buyerId]) {
      throw new Error(`Invalid save file: offer ${offer.id} references an unknown player or club`);
    }
  }
  for (const negotiation of state.negotiations) {
    if (!state.players[negotiation.playerId]) {
      throw new Error(
        `Invalid save file: negotiation ${negotiation.id} references an unknown player`,
      );
    }
    if (negotiation.sellerId && !state.clubs[negotiation.sellerId]) {
      throw new Error(
        `Invalid save file: negotiation ${negotiation.id} references an unknown club`,
      );
    }
  }
  for (const transfer of state.transfers) {
    if (
      !state.players[transfer.playerId] ||
      !state.clubs[transfer.toId] ||
      (transfer.fromId && transfer.fromId !== "abroad" && !state.clubs[transfer.fromId])
    ) {
      throw new Error(`Invalid save file: transfer references an unknown player or club`);
    }
  }
  for (const message of state.inbox) {
    if (
      message.conversationId !== undefined &&
      !state.conversations.some((conversation) => conversation.id === message.conversationId)
    ) {
      throw new Error(
        `Invalid save file: message ${message.id} references an unknown conversation`,
      );
    }
  }
  for (const conversation of state.conversations) {
    if (conversation.playerId && !state.players[conversation.playerId]) {
      throw new Error(
        `Invalid save file: conversation ${conversation.id} references an unknown player`,
      );
    }
  }
  return state;
}
