/**
 * Real-world reference for the engine: results, match statistics and closing odds from
 * football-data.co.uk (free for private use, not for commercial products: see docs/ARCHITECTURE.md).
 * Files are downloaded once into data/raw/football-data, which git ignores.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsvLine } from "../../data/src/import/csv.ts";
import {
  autoTeamSheet,
  createSeason,
  simulateMatch,
  tierAgainst,
  type SeasonFixture,
  type SeasonPlayer,
} from "../src/index.ts";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const RAW = join(ROOT, "data/raw/football-data");
const SITE = "https://football-data.co.uk";

/** Where each pack's league lives on football-data.co.uk. Saudi Arabia and Qatar are not covered. */
const SOURCES: Record<string, { files: string[]; current: string; extra?: true }> = {
  "premier-league": { files: ["2627/E0"], current: "2627" },
  championship: { files: ["2627/E1"], current: "2627" },
  bundesliga: { files: ["2627/D1"], current: "2627" },
  "2-bundesliga": { files: ["2627/D2"], current: "2627" },
  "serie-a": { files: ["2627/I1"], current: "2627" },
  "serie-b": { files: ["2627/I2"], current: "2627" },
  laliga: { files: ["2627/SP1"], current: "2627" },
  "laliga-hypermotion": { files: ["2627/SP2"], current: "2627" },
  "ligue-1": { files: ["2627/F1"], current: "2627" },
  "ligue-2": { files: ["2627/F2"], current: "2627" },
  eredivisie: { files: ["2627/N1"], current: "2627" },
  "pro-league": { files: ["2627/B1"], current: "2627" },
  "primeira-liga": { files: ["2627/P1"], current: "2627" },
  "super-lig": { files: ["2627/T1"], current: "2627" },
  "super-league-greece": { files: ["2627/G1"], current: "2627" },
  superligaen: { files: ["DNK"], current: "2026/2027", extra: true },
  brasileirao: { files: ["BRA"], current: "2026", extra: true },
  mls: { files: ["USA"], current: "2026", extra: true },
};
/** Only the 2026-27 season (2026 for leagues played over a calendar year), as in the packs. */
const EXTRA_SEASONS: Record<string, string[]> = {
  superligaen: ["2026/2027"],
  brasileirao: ["2026"],
  mls: ["2026"],
};

/** football-data.co.uk names that word matching cannot guess. */
const ALIASES: Record<string, string> = {
  "Nott'm Forest": "nottingham-forest",
  Wolves: "wolverhampton-wanderers",
  Spurs: "tottenham-hotspur",
  "Paris SG": "paris-saint-germain",
  "Ath Madrid": "atletico",
  "Ath Bilbao": "athletic",
  Sociedad: "real-sociedad",
  Espanol: "espanyol",
  Vallecano: "rayo",
  "M'gladbach": "borussia-monchengladbach",
  Olympiakos: "olympiacos",
  Levadeiakos: "levadiakos",
  Buyuksehyr: "basaksehir",
  "Ein Frankfurt": "eintracht-frankfurt",
  "FC Koln": "koln",
  Inter: "inter-milan",
  Milan: "ac-milan",
  "Sp Lisbon": "sporting-cp",
  "Sp Braga": "braga",
  "For Sittard": "fortuna-sittard",
  "St Truiden": "sint-truiden",
  "St. Gilloise": "union-sg",
  "Club Brugge": "club-brugge",
  "Sheffield United": "sheffield-united",
  "Sheffield Weds": "sheffield-wednesday",
  QPR: "queens-park-rangers",
  "West Brom": "west-bromwich-albion",
};

export interface RealMatch {
  season: string;
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
  /** Shots, shots on target, corners, fouls, yellows, reds: home then away, when available. */
  stats: Record<string, [number, number]> | null;
  /** Closing odds turned into probabilities, margin removed. */
  odds: { home: number; draw: number; away: number } | null;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(file: string, extra: boolean): Promise<string> {
  const path = join(RAW, `${file.replace("/", "-")}.csv`);
  if (!existsSync(path)) {
    const url = `${SITE}/${extra ? "new" : "mmz4281"}/${file}.csv`;
    const response = await fetch(url, {
      headers: { "User-Agent": "online-manager-benchmark/0.1" },
    });
    if (!response.ok) throw new Error(`${response.status} on ${url}`);
    mkdirSync(RAW, { recursive: true });
    writeFileSync(path, await response.text());
    console.log(`saved ${path}`);
    await wait(1500);
  }
  return readFileSync(path, "utf8").replace(/^﻿/, "");
}

const STAT_COLUMNS: Record<string, [string, string]> = {
  shots: ["HS", "AS"],
  onTarget: ["HST", "AST"],
  corners: ["HC", "AC"],
  fouls: ["HF", "AF"],
  yellows: ["HY", "AY"],
  reds: ["HR", "AR"],
  xg: ["HxG", "AxG"],
};

function parse(text: string, extra: boolean, seasonOf: string): RealMatch[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const header = parseCsvLine(lines[0]!);
  const at = (row: string[], name: string) => row[header.indexOf(name)] ?? "";
  const matches: RealMatch[] = [];
  for (const line of lines.slice(1)) {
    const row = parseCsvLine(line);
    const home = at(row, extra ? "Home" : "HomeTeam");
    const homeGoals = Number.parseInt(at(row, extra ? "HG" : "FTHG"), 10);
    const awayGoals = Number.parseInt(at(row, extra ? "AG" : "FTAG"), 10);
    if (!home || Number.isNaN(homeGoals) || Number.isNaN(awayGoals)) continue;
    let odds: RealMatch["odds"] = null;
    for (const book of ["AvgC", "PSC", "Avg", "B365C", "B365"]) {
      const o = ["H", "D", "A"].map((r) => Number(at(row, `${book}${r}`)));
      if (o.every((x) => x > 1)) {
        const inv = o.map((x) => 1 / x);
        const total = inv[0]! + inv[1]! + inv[2]!;
        odds = { home: inv[0]! / total, draw: inv[1]! / total, away: inv[2]! / total };
        break;
      }
    }
    let stats: RealMatch["stats"] = null;
    if (!extra && at(row, "HS") !== "") {
      stats = {};
      for (const [key, columns] of Object.entries(STAT_COLUMNS)) {
        /* French second division and a few others give free kicks conceded instead of fouls. */
        const [h, a] = key === "fouls" && at(row, columns[0]) === "" ? ["HFKC", "AFKC"] : columns;
        if (at(row, h) === "" || at(row, a) === "") continue;
        const pair: [number, number] = [Number(at(row, h)), Number(at(row, a))];
        if (pair.every((x) => Number.isFinite(x))) stats[key] = pair;
      }
    }
    matches.push({
      season: extra ? at(row, "Season") : seasonOf,
      home,
      away: at(row, extra ? "Away" : "AwayTeam"),
      homeGoals,
      awayGoals,
      stats,
      odds,
    });
  }
  return matches;
}

export const hasReality = (leagueId: string) => leagueId in SOURCES;

export async function loadReality(leagueId: string) {
  const source = SOURCES[leagueId];
  if (!source) return null;
  const matches: RealMatch[] = [];
  for (const file of source.files) {
    const text = await download(file, !!source.extra);
    const parsed = parse(text, !!source.extra, file.split("/")[0]!);
    matches.push(
      ...(source.extra
        ? parsed.filter((m) => EXTRA_SEASONS[leagueId]!.includes(m.season))
        : parsed),
    );
  }
  return { matches, current: source.current };
}

export interface Club {
  id: string;
  levelAdjustment?: number;
  name: string;
  initials: string;
  reputation: number;
  /** Other names: Wikipedia title from the pack configuration. */
  aliases: string[];
}

const words = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(
      (w) => w.length > 1 && !["fc", "cf", "sc", "ac", "afc", "fk", "sk", "cd", "ud"].includes(w),
    );

/** Maps football-data.co.uk team names to pack clubs: aliases, then shared word beginnings. */
export function matchTeams(names: string[], clubs: Club[]) {
  const map = new Map<string, string>();
  const taken = new Set<string>();
  for (const name of names) {
    const alias = ALIASES[name];
    if (alias && clubs.some((c) => c.id === alias)) {
      map.set(name, alias);
      taken.add(alias);
    }
  }
  const scored: { name: string; club: string; score: number }[] = [];
  for (const name of names.filter((n) => !map.has(n))) {
    const query = words(name);
    for (const club of clubs) {
      const target = [club.name, club.id, ...club.aliases].flatMap(words);
      const score = query.filter((q) =>
        target.some(
          (t) =>
            t === q || (q.length >= 3 && t.length >= 3 && (t.startsWith(q) || q.startsWith(t))),
        ),
      ).length;
      if (score > 0) scored.push({ name, club: club.id, score: score / query.length });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  for (const { name, club } of scored) {
    if (map.has(name) || taken.has(club)) continue;
    map.set(name, club);
    taken.add(club);
  }
  return { map, unmatched: names.filter((n) => !map.has(n)) };
}

export interface Pack {
  league: { id: string; name: string };
  clubs: Club[];
  players: SeasonPlayer[];
  fixtures: SeasonFixture[];
}

export function loadPack(leagueId: string): Pack {
  const pack = JSON.parse(
    readFileSync(join(ROOT, `data/packs/${leagueId}-2026-27.json`), "utf8"),
  ) as Pack;
  const config = JSON.parse(
    readFileSync(join(ROOT, `packages/data/sources/${leagueId}-2026-27.json`), "utf8"),
  ) as { clubs: { id: string; wikipedia: string; openfootball?: string }[] };
  for (const club of pack.clubs) {
    const c = config.clubs.find((x) => x.id === club.id);
    club.aliases = [c?.wikipedia ?? "", c?.openfootball ?? ""].filter(Boolean);
  }
  return pack;
}

/** Plays a fixture many times with the club AI, as in a season, and returns the outcome shares. */
export function engineMatchup(pack: Pack, homeId: string, awayId: string, sims: number, seed = 0) {
  const league = leagueContext(pack);
  const sheet = (id: string, opponent: string) =>
    autoTeamSheet({
      clubId: id,
      squad: league.squads.get(id)!,
      reputation: tierAgainst(
        league.tiers.get(id)!,
        league.strength.get(id)!,
        league.strength.get(opponent)!,
      ),
      levelAdjustment: pack.clubs.find((c) => c.id === id)?.levelAdjustment ?? 0,
    });
  const home = sheet(homeId, awayId);
  const away = sheet(awayId, homeId);
  const results = [];
  for (let i = 0; i < sims; i++) {
    results.push(simulateMatch({ seed: seed + i * 7919, home, away }));
  }
  return results;
}

const contexts = new WeakMap<Pack, ReturnType<typeof createSeason>>();
/** To call after changing the clubs' level adjustments. */
export const resetContext = (pack: Pack) => contexts.delete(pack);
function leagueContext(pack: Pack) {
  let context = contexts.get(pack);
  if (!context) {
    context = createSeason({ seed: 0, clubs: pack.clubs, players: pack.players, fixtures: [] });
    contexts.set(pack, context);
  }
  return context;
}
