/**
 * Downloads the raw sources into /data/raw (ignored by git). What is already there is kept, so a
 * rerun resumes where it stopped. Usage: pack:fetch [league ids] [--refresh to reread squads].
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseKitColors, parseSquad } from "../src/import/wikitext.ts";
import { loadLeagues, RAW, type ClubConfig } from "./config.ts";

const TRANSFERMARKT = "https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data";
const OPENFOOTBALL = "https://raw.githubusercontent.com/openfootball/football.json/master";
const HEADERS = { "User-Agent": "online-manager-pack-builder/0.1" };
const WIKI_DELAY_MS = 3000;
const PAGES_PER_CALL = 4;
const MIN_SQUAD = 15;

const refresh = process.argv.includes("--refresh");
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function get(url: string): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, { headers: HEADERS }).catch((error: unknown) => {
      if (attempt === 5) throw error;
      return null;
    });
    if (!response) {
      console.log("  network error, retrying in 30s");
      await wait(30000);
      continue;
    }
    if (response.ok) return response;
    if (response.status !== 429 || attempt === 5) {
      throw new Error(`${response.status} on ${url}`);
    }
    const seconds = Number(response.headers.get("retry-after")) || 30;
    console.log(`  rate limited, waiting ${seconds}s`);
    await wait(seconds * 1000);
  }
}

async function download(url: string, path: string) {
  if (existsSync(path)) return;
  mkdirSync(dirname(path), { recursive: true });
  const body = Buffer.from(await (await get(url)).arrayBuffer());
  writeFileSync(path, body);
  console.log(`saved ${path} (${(body.length / 1048576).toFixed(1)} MB)`);
}

async function wikiApi(host: string, params: Record<string, string>) {
  await wait(WIKI_DELAY_MS);
  const query = new URLSearchParams({ ...params, format: "json", formatversion: "2" });
  return (await get(`https://${host}/w/api.php?${query}`)).json() as Promise<any>;
}

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Follows normalisation and redirects back to the title that was asked for. */
function requestedTitles(query: any, title: string): string[] {
  const renamed = new Map<string, string>();
  for (const step of [...(query.normalized ?? []), ...(query.redirects ?? [])]) {
    renamed.set(step.to, step.from);
  }
  const titles = [title];
  for (let t = title; renamed.has(t); ) {
    t = renamed.get(t)!;
    titles.push(t);
  }
  return titles;
}

interface Page {
  title: string;
  timestamp: string;
  wikitext: string;
}

async function readPages(titles: string[]): Promise<Map<string, Page>> {
  const pages = new Map<string, Page>();
  for (const batch of chunks(titles, PAGES_PER_CALL)) {
    let resume: Record<string, string> = {};
    for (;;) {
      const data = await wikiApi("en.wikipedia.org", {
        action: "query",
        prop: "revisions",
        rvprop: "content|timestamp",
        rvslots: "main",
        titles: batch.join("|"),
        redirects: "1",
        ...resume,
      });
      for (const page of data.query.pages) {
        const revision = page.revisions?.[0];
        if (!revision) continue;
        const content = {
          title: page.title,
          timestamp: revision.timestamp,
          wikitext: revision.slots.main.content,
        };
        for (const title of requestedTitles(data.query, page.title)) pages.set(title, content);
      }
      if (!data.continue) break;
      resume = data.continue;
    }
  }
  return pages;
}

const seasonPage = (club: ClubConfig) => `2026–27 ${club.wikipedia} season`;

async function fetchSquads(leagueId: string, clubs: ClubConfig[]) {
  const pathOf = (club: ClubConfig) => join(RAW, `wikipedia/${leagueId}/${club.id}.json`);
  const missing = clubs.filter((club) => refresh || !existsSync(pathOf(club)));
  for (const batch of chunks(missing, PAGES_PER_CALL)) {
    const pages = await readPages(batch.flatMap((c) => [seasonPage(c), c.wikipedia]));
    for (const club of batch) {
      const season = pages.get(seasonPage(club));
      const main = pages.get(club.wikipedia);
      const present = (page?: Page) =>
        page ? parseSquad(page.wikitext).filter((p) => p.section !== "loan-out").length : 0;
      const best = present(season) >= MIN_SQUAD ? season : main;
      if (!best) throw new Error(`No Wikipedia page for ${club.name}: ${club.wikipedia}`);
      const colors = main ? parseKitColors(main.wikitext) : null;
      mkdirSync(dirname(pathOf(club)), { recursive: true });
      writeFileSync(pathOf(club), JSON.stringify({ ...best, colors }));
      console.log(`  ${club.id}: ${present(best)} players from "${best.title}"`);
    }
  }
}

/** Links each Wikipedia article to its Transfermarkt id, through Wikidata. */
async function fetchLinks(leagueId: string, clubs: ClubConfig[]) {
  const path = join(RAW, `wikidata/${leagueId}.json`);
  if (!refresh && existsSync(path)) return;

  const titles = new Set<string>();
  for (const club of clubs) {
    const { wikitext } = JSON.parse(
      readFileSync(join(RAW, `wikipedia/${leagueId}/${club.id}.json`), "utf8"),
    );
    for (const player of parseSquad(wikitext)) if (player.title) titles.add(player.title);
  }

  const titleToItem = new Map<string, string>();
  for (const batch of chunks([...titles], 50)) {
    const data = await wikiApi("en.wikipedia.org", {
      action: "query",
      prop: "pageprops",
      ppprop: "wikibase_item",
      titles: batch.join("|"),
      redirects: "1",
    });
    for (const page of data.query.pages) {
      const item = page.pageprops?.wikibase_item;
      if (!item) continue;
      for (const title of requestedTitles(data.query, page.title)) titleToItem.set(title, item);
    }
  }

  const itemToTransfermarkt = new Map<string, string>();
  for (const batch of chunks([...new Set(titleToItem.values())], 50)) {
    const data = await wikiApi("www.wikidata.org", {
      action: "wbgetentities",
      ids: batch.join("|"),
      props: "claims",
    });
    for (const [item, entity] of Object.entries<any>(data.entities)) {
      const id = entity.claims?.P2446?.[0]?.mainsnak?.datavalue?.value;
      if (id) itemToTransfermarkt.set(item, id);
    }
  }
  const links = Object.fromEntries(
    [...titleToItem].map(([title, item]) => [
      title,
      { item, transfermarkt: itemToTransfermarkt.get(item) ?? null },
    ]),
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(links));
  console.log(`  ${titleToItem.size} players linked to Wikidata`);
}

await download(`${TRANSFERMARKT}/players.csv.gz`, join(RAW, "transfermarkt/players.csv.gz"));
await download(
  `${TRANSFERMARKT}/appearances.csv.gz`,
  join(RAW, "transfermarkt/appearances.csv.gz"),
);

for (const config of loadLeagues()) {
  const id = config.league.id;
  console.log(id);
  if (config.openfootballPath) {
    await download(`${OPENFOOTBALL}/${config.openfootballPath}`, join(RAW, `fixtures/${id}.json`));
  }
  await fetchSquads(id, config.clubs);
  await fetchLinks(id, config.clubs);
}
