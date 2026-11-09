/**
 * Simulates whole seasons on the real packs (data/packs, built by pack:build) and compares the
 * season-level output (titles, points, positions); `npm run benchmark` compares with reality.
 * Usage: calibrate [league ids] [--seasons N]
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  simulateSeason,
  type SeasonClub,
  type SeasonFixture,
  type SeasonPlayer,
} from "../src/index.ts";

interface Pack {
  league: { id: string; name: string };
  clubs: (SeasonClub & { name: string })[];
  players: (SeasonPlayer & { squad: string })[];
  fixtures: SeasonFixture[];
}

const PACKS = join(dirname(fileURLToPath(import.meta.url)), "../../../data/packs");
const args = process.argv.slice(2);
const seasonsArg = args.indexOf("--seasons");
const SEASONS = seasonsArg >= 0 ? Number(args[seasonsArg + 1]) : 10;
const wanted = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--seasons");

if (!existsSync(PACKS)) {
  console.error("No packs in data/packs: run npm run pack:fetch and npm run pack:build first.");
  process.exit(1);
}

const pct = (n: number, d: number) => `${((100 * n) / Math.max(d, 1)).toFixed(0)}%`;
const avg = (n: number, d: number) => (n / Math.max(d, 1)).toFixed(2);

const total = { matches: 0, goals: 0, home: 0, draw: 0, favourites: 0, favouriteWins: 0, ms: 0 };

for (const file of readdirSync(PACKS).filter(
  (f) => f.endsWith(".json") && !f.includes(".report"),
)) {
  const pack = JSON.parse(readFileSync(join(PACKS, file), "utf8")) as Pack;
  if (wanted.length > 0 && !wanted.includes(pack.league.id)) continue;

  const bestEleven = new Map<string, number>();
  for (const club of pack.clubs) {
    const top = pack.players
      .filter((p) => p.clubId === club.id)
      .map((p) => p.overall)
      .sort((a, b) => b - a)
      .slice(0, 11);
    bestEleven.set(club.id, top.reduce((s, o) => s + o, 0) / top.length);
  }

  const m = {
    matches: 0,
    goals: 0,
    home: 0,
    draw: 0,
    shots: 0,
    onTarget: 0,
    fouls: 0,
    yellows: 0,
    reds: 0,
    corners: 0,
    favourites: 0,
    favouriteWins: 0,
    champion: 0,
    last: 0,
  };
  const titles = new Map<string, number>();
  const positions = new Map<string, number>();
  const started = performance.now();

  for (let s = 0; s < SEASONS; s++) {
    const { season, table } = simulateSeason({
      seed: 1000 + s,
      clubs: pack.clubs,
      players: pack.players,
      fixtures: pack.fixtures,
    });
    for (const { fixture, result } of season.results) {
      const { home, away } = result.score;
      m.matches++;
      m.goals += home + away;
      if (home > away) m.home++;
      else if (home === away) m.draw++;
      for (const side of [result.stats.home, result.stats.away]) {
        m.shots += side.shots;
        m.onTarget += side.shotsOnTarget;
        m.fouls += side.fouls;
        m.yellows += side.yellowCards;
        m.reds += side.redCards;
        m.corners += side.corners;
      }
      const gap = bestEleven.get(fixture.homeClubId)! - bestEleven.get(fixture.awayClubId)!;
      if (Math.abs(gap) >= 5) {
        m.favourites++;
        if ((gap > 0 && home > away) || (gap < 0 && away > home)) m.favouriteWins++;
      }
    }
    m.champion += table[0]!.points;
    m.last += table.at(-1)!.points;
    titles.set(table[0]!.clubId, (titles.get(table[0]!.clubId) ?? 0) + 1);
    table.forEach((row, i) => positions.set(row.clubId, (positions.get(row.clubId) ?? 0) + i + 1));
  }
  const ms = (performance.now() - started) / SEASONS;

  const name = (id: string) => pack.clubs.find((c) => c.id === id)?.name ?? id;
  const ranked = [...bestEleven].sort((a, b) => b[1] - a[1]);
  console.log(
    `${pack.league.name} (${SEASONS} seasons, ${ms.toFixed(0)} ms each)\n` +
      `  goals ${avg(m.goals, m.matches)} | home ${pct(m.home, m.matches)} draw ${pct(m.draw, m.matches)} ` +
      `away ${pct(m.matches - m.home - m.draw, m.matches)} | shots ${avg(m.shots, 2 * m.matches)} ` +
      `on target ${avg(m.onTarget, 2 * m.matches)} | corners ${avg(m.corners, 2 * m.matches)} ` +
      `fouls ${avg(m.fouls, 2 * m.matches)} yellows ${avg(m.yellows, m.matches)} reds ${avg(m.reds, m.matches)}\n` +
      `  favourite (best XI 5+ higher) wins ${pct(m.favouriteWins, m.favourites)} of ${m.favourites} | ` +
      `points: champion ${avg(m.champion, SEASONS)}, last ${avg(m.last, SEASONS)}\n` +
      `  titles: ${[...titles]
        .sort((a, b) => b[1] - a[1])
        .map(([id, n]) => `${name(id)} ${n}`)
        .join(", ")}\n` +
      `  average position of the 4 strongest: ${ranked
        .slice(0, 4)
        .map(([id]) => `${name(id)} ${avg(positions.get(id)!, SEASONS)}`)
        .join(", ")}`,
  );
  total.matches += m.matches;
  total.goals += m.goals;
  total.home += m.home;
  total.draw += m.draw;
  total.favourites += m.favourites;
  total.favouriteWins += m.favouriteWins;
  total.ms += ms;
}

console.log(
  `\nAll: goals ${avg(total.goals, total.matches)} | home ${pct(total.home, total.matches)} ` +
    `draw ${pct(total.draw, total.matches)} away ${pct(total.matches - total.home - total.draw, total.matches)} | ` +
    `favourite wins ${pct(total.favouriteWins, total.favourites)}\n` +
    `Real 2026-27 (football-data.co.uk, 18 leagues): goals 3.00 | home 45% draw 25% away 30% | ` +
    `shots 13.8 per team. Match by match against the odds: npm run benchmark`,
);
