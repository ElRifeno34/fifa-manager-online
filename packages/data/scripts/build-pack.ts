/**
 * Assembles /data/packs/<pack>.json for each league: squads from Wikipedia, level and profile from
 * Transfermarkt, fixtures from openfootball or a generated calendar where needed. Run pack:fetch
 * first. Usage: pack:build [league ids].
 */
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { createGunzip } from "node:zlib";
import { parseCsvLine } from "../src/import/csv.ts";
import { generateRoundRobin, matchClubNames } from "../src/import/fixtures.ts";
import {
  clubReputation,
  deriveAttributes,
  estimateMissingOverall,
  estimateOverall,
  estimatePotential,
  median,
  toPosition,
} from "../src/import/level.ts";
import { parseSquad, type KitColors, type WikiPlayer } from "../src/import/wikitext.ts";
import { packSchema, type Club, type Fixture, type Player } from "../src/schema.ts";
import { loadLeagues, RAW, ROOT, type LeagueConfig } from "./config.ts";

const STATS_SEASON = { label: "2025-26", from: "2025-07-01", to: "2026-06-30" };
const SEASON_START = "2026-08-15";
const FALLBACK_COLORS: KitColors = { primary: "#5A6472", secondary: "#FFFFFF" };

/** Local choices kept out of git: data/exclusions.json, e.g. { "nationalities": ["XXX"] }. */
const EXCLUSIONS_PATH = join(ROOT, "data/exclusions.json");
const excludedNationalities = new Set<string>(
  existsSync(EXCLUSIONS_PATH)
    ? ((JSON.parse(readFileSync(EXCLUSIONS_PATH, "utf8")).nationalities ?? []) as string[]).map(
        (n) => n.toUpperCase(),
      )
    : [],
);

const readJson = (path: string) => JSON.parse(readFileSync(join(RAW, path), "utf8"));

type Row = Record<string, string>;

async function readCsv(path: string, onRow: (row: Row) => void) {
  const stream = createReadStream(join(RAW, path)).pipe(createGunzip());
  let header: string[] | null = null;
  for await (const line of createInterface({ input: stream, crlfDelay: Infinity })) {
    const fields = parseCsvLine(line);
    if (!header) {
      header = fields;
      continue;
    }
    const row: Row = {};
    header.forEach((key, i) => (row[key] = fields[i] ?? ""));
    onRow(row);
  }
}

const normalize = (name: string) =>
  name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim();

/* Transfermarkt players, by id and by name for articles Wikidata cannot link. */
const transfermarkt = new Map<string, Row>();
const byName = new Map<string, Row[]>();
await readCsv("transfermarkt/players.csv.gz", (row) => {
  transfermarkt.set(row.player_id!, row);
  const key = normalize(row.name!);
  byName.set(key, [...(byName.get(key) ?? []), row]);
});

/* Output of last season, all competitions. */
interface Totals {
  appearances: number;
  minutes: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}
const totals = new Map<string, Totals>();
await readCsv("transfermarkt/appearances.csv.gz", (row) => {
  const date = row.date ?? "";
  if (date < STATS_SEASON.from || date > STATS_SEASON.to) return;
  const t = totals.get(row.player_id!) ?? {
    appearances: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
  };
  t.appearances += 1;
  t.minutes += Number(row.minutes_played) || 0;
  t.goals += Number(row.goals) || 0;
  t.assists += Number(row.assists) || 0;
  t.yellowCards += Number(row.yellow_cards) || 0;
  t.redCards += Number(row.red_cards) || 0;
  totals.set(row.player_id!, t);
});

function ageOn(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const [by, bm, bd] = birthDate.split("-").map(Number) as [number, number, number];
  const [year, month, day] = SEASON_START.split("-").map(Number) as [number, number, number];
  return year - by - (month < bm || (month === bm && day < bd) ? 1 : 0);
}

const FEET: Record<string, Player["foot"]> = { left: "left", right: "right", both: "both" };
const slug = (text: string) => normalize(text).replace(/ +/g, "-");

function buildFixtures(config: LeagueConfig, id: string): Fixture[] {
  if (
    !config.openfootballPath ||
    config.league.id === "brasileirao" ||
    config.league.id === "mls"
  ) {
    /*
     * The in-game season starts in summer 2026. A calendar-year competition such as Brazil's
     * 2026 season has already begun before that date; carrying over its January–December schedule
     * would silently skip half the fixtures when a career starts. MLS has conferences/play-offs,
     * which are not representable by the current plain round-robin career rules.
     */
    return generateRoundRobin(
      config.clubs.map((c) => c.id),
      SEASON_START,
    );
  }
  const matches: any[] = readJson(`fixtures/${id}.json`).matches;
  const names = [...new Set(matches.flatMap((m) => [m.team1 as string, m.team2 as string]))];
  const result = matchClubNames(
    names,
    config.clubs.map((c) => ({
      id: c.id,
      names: [c.name, c.wikipedia, ...(c.openfootball ? [c.openfootball] : [])],
    })),
  );
  if (result.unmatched.length > 0) {
    throw new Error(`${id}: calendar names without a club: ${result.unmatched.join(", ")}`);
  }
  console.log(
    `  calendar names: ${[...result.matches].map(([n, c]) => `${n} > ${c}`).join("; ")}`,
  );
  /* Scores already in the file are left out: a career starts on matchday 1. */
  return matches.map((m) => ({
    round: Number(/\d+/.exec(m.round)?.[0]),
    date: m.date,
    time: m.time ?? null,
    homeClubId: result.matches.get(m.team1)!,
    awayClubId: result.matches.get(m.team2)!,
  }));
}

function buildLeague(config: LeagueConfig) {
  const leagueId = config.league.id;
  const links: Record<string, { transfermarkt: string | null }> = readJson(
    `wikidata/${leagueId}.json`,
  );

  function findTransfermarkt(player: WikiPlayer) {
    const id = player.title ? links[player.title]?.transfermarkt : null;
    const linked = id ? transfermarkt.get(id) : undefined;
    if (linked) return { row: linked, method: "wikidata" as const };
    /* Namesakes are common: only active players qualify. */
    const candidates = (byName.get(normalize(player.name)) ?? []).filter(
      (c) => Number(c.last_season) >= 2024,
    );
    const local = candidates.filter(
      (c) => c.current_club_domestic_competition_id === config.tmCompetition,
    );
    const unique =
      candidates.length === 1 ? candidates[0] : local.length === 1 ? local[0] : undefined;
    return unique
      ? { row: unique, method: "name" as const }
      : { row: null, method: "none" as const };
  }

  const players = new Map<string, Player>();
  const report = {
    loanedOut: 0,
    excluded: [] as string[],
    duplicates: [] as string[],
    byMethod: { wikidata: 0, name: 0, none: 0 },
    unmatched: [] as string[],
    byName: [] as string[],
    thinSquads: [] as string[],
    revisions: {} as Record<string, string>,
    sources: {} as Record<string, string>,
    colorsMissing: [] as string[],
  };
  const colors = new Map<string, KitColors>();

  for (const club of config.clubs) {
    const page = readJson(`wikipedia/${leagueId}/${club.id}.json`);
    report.revisions[club.id] = page.timestamp.slice(0, 10);
    report.sources[club.id] = page.title;
    const hand =
      club.primary && club.secondary
        ? { primary: club.primary, secondary: club.secondary }
        : undefined;
    if (!hand && !page.colors) report.colorsMissing.push(club.name);
    colors.set(club.id, hand ?? page.colors ?? FALLBACK_COLORS);

    for (const wiki of parseSquad(page.wikitext)) {
      if (wiki.section === "loan-out") {
        report.loanedOut++;
        continue;
      }
      if (excludedNationalities.has(wiki.nationality)) {
        report.excluded.push(`${club.id}: ${wiki.name}`);
        continue;
      }
      let { row, method } = findTransfermarkt(wiki);
      /* A name already taken is a namesake (Carlos Eduardo, Rafael…), not a transfer. */
      if (method === "name" && players.has(`tm-${row!.player_id}`)) {
        row = null;
        method = "none";
      }
      /* Without a link, a name is no identity: two João Vitor are two players. */
      let id = row ? `tm-${row.player_id}` : `wiki-${club.id}-${slug(wiki.name)}`;
      for (let n = 2; !row && players.has(id); n++) id = `wiki-${club.id}-${slug(wiki.name)}-${n}`;
      const squad = wiki.section;

      const existing = players.get(id);
      if (existing) {
        report.duplicates.push(`${wiki.name}: ${existing.clubId} / ${club.id}`);
        if (existing.squad === "first-team" || squad !== "first-team") continue;
      } else {
        report.byMethod[method]++;
        if (method === "none") report.unmatched.push(`${club.id}: ${wiki.name}`);
        if (method === "name" && row) report.byName.push(`${club.id}: ${wiki.name} -> ${row.name}`);
      }

      const birthDate = row?.date_of_birth?.slice(0, 10) || null;
      const age = ageOn(birthDate);
      const height = Number(row?.height_in_cm);
      const heightCm = height >= 140 && height <= 220 ? height : null;
      const value = Number(row?.market_value_in_eur);
      const marketValueEur = value > 0 ? value : null;
      const position = toPosition(row?.sub_position, wiki.line);
      const overall = estimateOverall({ position, age, marketValueEur, squad });
      const stats = row ? totals.get(row.player_id!) : undefined;
      const inRange = wiki.number !== null && wiki.number >= 1 && wiki.number <= 99;

      players.set(id, {
        id,
        clubId: club.id,
        name: wiki.name,
        nationality: wiki.nationality || "UNK",
        birthDate,
        foot: FEET[row?.foot ?? ""] ?? null,
        heightCm,
        number: inRange ? wiki.number : null,
        squad,
        position,
        secondaryPositions: [],
        marketValueEur,
        overall,
        potential: estimatePotential(overall, age),
        attributes: deriveAttributes({
          id,
          position,
          overall,
          age,
          heightCm,
          performance: stats ?? null,
        }),
        lastSeason: stats ? { season: STATS_SEASON.label, ...stats } : null,
        levelFromData: marketValueEur !== null,
      });
    }
  }

  const allPlayers = [...players.values()];

  /* First-team players without a value take their level from the rest of their club. */
  for (const club of config.clubs) {
    const firstTeam = allPlayers.filter((p) => p.clubId === club.id && p.squad === "first-team");
    if (firstTeam.length < 18) report.thinSquads.push(`${club.name}: ${firstTeam.length}`);
    const clubMedian = median(firstTeam.filter((p) => p.levelFromData).map((p) => p.overall));
    for (const player of firstTeam.filter((p) => !p.levelFromData)) {
      const age = ageOn(player.birthDate);
      player.overall = estimateMissingOverall(clubMedian, player.number);
      player.potential = estimatePotential(player.overall, age);
      player.attributes = deriveAttributes({
        id: player.id,
        position: player.position,
        overall: player.overall,
        age,
        heightCm: player.heightCm,
        performance: player.lastSeason,
      });
    }
  }

  const bestEleven = (clubId: string) => {
    const best = allPlayers
      .filter((p) => p.clubId === clubId && p.squad === "first-team")
      .map((p) => p.overall)
      .sort((a, b) => b - a)
      .slice(0, 11);
    return best.length ? best.reduce((sum, overall) => sum + overall, 0) / best.length : 0;
  };

  /* Club adjustments fitted on the odds by the engine, kept across rebuilds. */
  const fitPath = join(ROOT, `data/fit/${config.pack.id}.json`);
  const fit: Record<string, number> = existsSync(fitPath)
    ? JSON.parse(readFileSync(fitPath, "utf8"))
    : {};
  const clubs: Club[] = config.clubs.map((c) => ({
    id: c.id,
    name: c.name,
    initials: c.initials,
    city: c.city ?? null,
    ...colors.get(c.id)!,
    reputation: clubReputation(bestEleven(c.id)),
    ...(fit[c.id] ? { levelAdjustment: fit[c.id] } : {}),
  }));

  const pack = packSchema.parse({
    meta: {
      ...config.pack,
      generatedAt: new Date().toISOString(),
      sources: [
        "Wikipedia (CC BY-SA)",
        "Wikidata (CC0)",
        "transfermarkt-datasets",
        ...(config.openfootballPath && !["brasileirao", "mls"].includes(config.league.id)
          ? ["openfootball"]
          : []),
      ],
    },
    league: {
      ...config.league,
      fixturesSource:
        config.openfootballPath && !["brasileirao", "mls"].includes(config.league.id)
          ? "openfootball"
          : "generated",
    },
    clubs,
    players: allPlayers,
    fixtures: buildFixtures(config, leagueId),
    newspapers: config.newspapers,
  });

  mkdirSync(join(ROOT, "data/packs"), { recursive: true });
  writeFileSync(join(ROOT, `data/packs/${config.pack.id}.json`), JSON.stringify(pack));
  writeFileSync(
    join(ROOT, `data/packs/${config.pack.id}.report.json`),
    JSON.stringify(report, null, 2),
  );

  const share = (test: (p: Player) => boolean) =>
    `${Math.round((allPlayers.filter(test).length / allPlayers.length) * 100)}%`;
  const ranked = [...clubs].sort((a, b) => bestEleven(b.id) - bestEleven(a.id));
  console.log(
    `${config.league.name.padEnd(15)} clubs ${clubs.length}, players ${allPlayers.length}, ` +
      `linked ${share((p) => p.id.startsWith("tm-"))}, valued ${share((p) => p.levelFromData)}, ` +
      `numbers ${share((p) => p.number !== null)}, fixtures ${pack.fixtures.length} ` +
      `(${pack.league.fixturesSource}), thin ${report.thinSquads.length}, ` +
      `no colours ${report.colorsMissing.length}, duplicates ${report.duplicates.length}`,
  );
  console.log(
    `  top: ${ranked
      .slice(0, 3)
      .map((c) => `${c.name} ${bestEleven(c.id).toFixed(1)}`)
      .join(", ")}, last: ${ranked.at(-1)?.name} ${bestEleven(ranked.at(-1)!.id).toFixed(1)}`,
  );
}

for (const config of loadLeagues()) {
  if (!existsSync(join(RAW, `wikidata/${config.league.id}.json`))) {
    console.log(`${config.league.id}: not fetched yet, skipped`);
    continue;
  }
  buildLeague(config);
}
