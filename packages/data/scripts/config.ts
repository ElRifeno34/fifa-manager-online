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
  city?: string;
  primary?: string;
  secondary?: string;
  /** Name in the calendar, when it cannot be matched automatically. */
  openfootball?: string;
}

export interface LeagueConfig {
  pack: { id: string; name: string; season: string; version: number };
  league: { id: string; name: string; country: string };
  /** Competition id in transfermarkt-datasets. */
  tmCompetition: string;
  openfootballPath: string | null;
  clubs: ClubConfig[];
  newspapers: Newspaper[];
}

/** All leagues, or those named on the command line. */
export function loadLeagues(): LeagueConfig[] {
  const dir = join(ROOT, "packages/data/sources");
  const wanted = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(readFileSync(join(dir, file), "utf8")) as LeagueConfig)
    .filter((config) => wanted.length === 0 || wanted.includes(config.league.id));
}
