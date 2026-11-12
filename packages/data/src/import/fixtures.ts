import type { Fixture } from "../schema.ts";

const WEEK_MS = 7 * 86400000;

/**
 * Double round-robin by the circle method, for leagues without a published calendar: one round
 * a week from `firstDate`, every club meets every other club once at home and once away, and an
 * odd-sized league gets a bye each round.
 */
export function generateRoundRobin(clubIds: readonly string[], firstDate: string): Fixture[] {
  const ids = [...clubIds].sort();
  if (ids.length < 2) throw new Error("At least two clubs are required");
  if (new Set(ids).size !== ids.length) throw new Error("Club ids must be unique");
  const parsedStart = Date.parse(`${firstDate}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(firstDate) ||
    Number.isNaN(parsedStart) ||
    new Date(parsedStart).toISOString().slice(0, 10) !== firstDate
  ) {
    throw new Error(`Invalid first date: ${firstDate}`);
  }

  /* Add a bye slot when needed; the club paired with it rests this round. */
  const scheduleIds = ids.length % 2 === 0 ? ids : [...ids, "__bye__"];
  const rounds = scheduleIds.length - 1;
  const rotation = scheduleIds.slice(1);
  const firstLeg: [string, string][][] = [];
  for (let round = 0; round < rounds; round++) {
    const circle = [scheduleIds[0]!, ...rotation];
    const pairs: [string, string][] = [];
    for (let i = 0; i < circle.length / 2; i++) {
      const a = circle[i]!;
      const b = circle[circle.length - 1 - i]!;
      if (a !== "__bye__" && b !== "__bye__") pairs.push((round + i) % 2 === 0 ? [a, b] : [b, a]);
    }
    firstLeg.push(pairs);
    rotation.unshift(rotation.pop()!);
  }

  const start = parsedStart;
  const legs = [...firstLeg, ...firstLeg.map((r) => r.map(([a, b]): [string, string] => [b, a]))];
  return legs.flatMap((pairs, index) =>
    pairs.map(([homeClubId, awayClubId]) => ({
      round: index + 1,
      date: new Date(start + index * WEEK_MS).toISOString().slice(0, 10),
      time: null,
      homeClubId,
      awayClubId,
    })),
  );
}

const STOP_WORDS = new Set(
  "fc cf ac afc sc sv ss as rc cd ud sk fk bk if vfb vfl tsg rb ssc us aj ogc de la le 1 04 05 07".split(
    " ",
  ),
);

function tokens(name: string): Set<string> {
  const plain = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ");
  return new Set(plain.split(/\s+/).filter((t) => t && !STOP_WORDS.has(t)));
}

export interface ClubNames {
  id: string;
  names: string[];
}

/**
 * Maps calendar names to clubs by shared words, best scores first, so each club is taken once.
 * Returns the names left unmatched, for the config's aliases.
 */
export function matchClubNames(
  calendarNames: readonly string[],
  clubs: readonly ClubNames[],
): { matches: Map<string, string>; unmatched: string[] } {
  const scored: { name: string; id: string; score: number }[] = [];
  for (const name of calendarNames) {
    const wanted = tokens(name);
    for (const club of clubs) {
      const known = new Set(club.names.flatMap((n) => [...tokens(n)]));
      const shared = [...wanted].filter((t) => known.has(t)).length;
      if (shared > 0) scored.push({ name, id: club.id, score: shared / wanted.size });
    }
  }
  scored.sort((a, b) => b.score - a.score);

  const matches = new Map<string, string>();
  const taken = new Set<string>();
  for (const { name, id } of scored) {
    if (matches.has(name) || taken.has(id)) continue;
    matches.set(name, id);
    taken.add(id);
  }
  return { matches, unmatched: calendarNames.filter((n) => !matches.has(n)) };
}
