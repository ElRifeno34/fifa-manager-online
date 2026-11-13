import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Newspaper } from "../src/schema.ts";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
export const RAW = join(ROOT, "data/raw");

export interface ClubConfig {
  id: string;
  name: string;
  initials: string;
  /** Article holding the squad: the club page, or a season page for hand-written configs. */
  wikipedia: string;
  /** Language edition for club pages that have no English article. */
  wikipediaHost?: string;
  /** Override the season-page title for leagues played over a calendar year. */
  wikipediaSeason?: string;
  city?: string;
  primary?: string;
  secondary?: string;
  /** Name in the calendar, when it cannot be matched automatically. */
  openfootball?: string;
  /** Fallback roster used only while no real first-team players can be parsed. */
  fictionalSquadPath?: string;
}

export interface LeagueConfig {
  pack: { id: string; name: string; season: string; version: number };
  league: { id: string; name: string; country: string };
  /** Competition id in transfermarkt-datasets, null for leagues it does not cover. */
  tmCompetition: string | null;
  openfootballPath: string | null;
  /** Season in Wikipedia titles, "2026" for leagues played over a calendar year. */
  wikipediaSeason?: string;
  clubs: ClubConfig[];
  newspapers: Newspaper[];
}

/** All leagues, or those named on the command line. */
export function loadLeagues(): LeagueConfig[] {
  const dir = join(ROOT, "packages/data/sources");
  const wanted = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  const configs = readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(readFileSync(join(dir, file), "utf8")) as LeagueConfig)
    .filter((config) => wanted.length === 0 || wanted.includes(config.league.id));
  const found = new Set(configs.map((config) => config.league.id));
  const unknown = wanted.filter((id) => !found.has(id));
  if (unknown.length) throw new Error(`Unknown competition id(s): ${unknown.join(", ")}`);
  return configs;
}
