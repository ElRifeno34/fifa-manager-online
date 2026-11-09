/**
 * Fits each club's level adjustment to the closing odds of the real 2026-27 season
 * (football-data.co.uk): the share of strength that the players' market value does not explain.
 * For every club, the expected points the engine gives it in the matches played so far are compared
 * with those the odds give it, and its adjustment moves until they agree.
 * Writes data/fit/<pack>.json (reapplied by pack:build) and updates data/packs/<pack>.json.
 * Usage: tune:clubs [league ids] [--sims N] [--rounds N]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { leaguesWithReality } from "./benchmark.ts";
import { engineMatchup, loadPack, loadReality, matchTeams, resetContext, ROOT } from "./reality.ts";

const args = process.argv.slice(2);
const option = (name: string, fallback: number) => {
  const i = args.indexOf(name);
  return i >= 0 ? Number(args[i + 1]) : fallback;
};
const SIMS = option("--sims", 24);
const ROUNDS = option("--rounds", 8);
const LEARNING_RATE = 0.12;
const LIMIT = 0.25;
const leagues = leaguesWithReality(
  args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--")),
);

for (const leagueId of leagues) {
  const reality = (await loadReality(leagueId))!;
  const pack = loadPack(leagueId);
  const played = reality.matches.filter((m) => m.season === reality.current && m.odds);
  const { map } = matchTeams([...new Set(played.flatMap((m) => [m.home, m.away]))], pack.clubs);
  const fixtures = played
    .map((m, i) => ({
      home: map.get(m.home),
      away: map.get(m.away),
      odds: m.odds!,
      seed: i * 104_729,
    }))
    .filter((f): f is typeof f & { home: string; away: string } => !!f.home && !!f.away);
  const adjustment = new Map(pack.clubs.map((c) => [c.id, 0]));
  const games = new Map(pack.clubs.map((c) => [c.id, 0]));
  for (const f of fixtures) {
    games.set(f.home, games.get(f.home)! + 1);
    games.set(f.away, games.get(f.away)! + 1);
  }

  console.log(`\n${pack.league.name}: ${fixtures.length} matches with odds`);
  for (let round = 1; round <= ROUNDS; round++) {
    for (const club of pack.clubs) club.levelAdjustment = adjustment.get(club.id)!;
    resetContext(pack);
    const residual = new Map(pack.clubs.map((c) => [c.id, 0]));
    let gap = 0;
    for (const f of fixtures) {
      let h = 0;
      let d = 0;
      for (const r of engineMatchup(pack, f.home, f.away, SIMS, f.seed)) {
        if (r.score.home > r.score.away) h++;
        else if (r.score.home === r.score.away) d++;
      }
      const engine = { home: h / SIMS, draw: d / SIMS, away: 1 - (h + d) / SIMS };
      /* Expected points: what the odds expect of each side, against what the engine gives it. */
      const homeGap = 3 * f.odds.home + f.odds.draw - (3 * engine.home + engine.draw);
      const awayGap = 3 * f.odds.away + f.odds.draw - (3 * engine.away + engine.draw);
      residual.set(f.home, residual.get(f.home)! + homeGap);
      residual.set(f.away, residual.get(f.away)! + awayGap);
      gap += Math.abs(engine.home - f.odds.home);
    }
    for (const club of pack.clubs) {
      const n = games.get(club.id)!;
      if (n === 0) continue;
      /* Few matches, smaller steps: a club is not judged on two games. */
      const step = (residual.get(club.id)! / n) * LEARNING_RATE * (n / (n + 3));
      adjustment.set(club.id, adjustment.get(club.id)! + step);
    }
    /* The odds compare clubs within a league; the league's own level stays the players'. */
    const mean = [...adjustment.values()].reduce((s, a) => s + a, 0) / adjustment.size;
    for (const [id, a] of adjustment) {
      adjustment.set(id, Math.max(-LIMIT, Math.min(LIMIT, a - mean)));
    }
    console.log(
      `  round ${round}: mean gap to the odds on a home win ${((100 * gap) / fixtures.length).toFixed(1)}%`,
    );
  }

  const fitted: Record<string, number> = {};
  for (const [id, a] of adjustment) if (Math.abs(a) >= 0.0005) fitted[id] = Number(a.toFixed(3));
  mkdirSync(join(ROOT, "data/fit"), { recursive: true });
  writeFileSync(join(ROOT, `data/fit/${leagueId}-2026-27.json`), JSON.stringify(fitted, null, 2));
  const packPath = join(ROOT, `data/packs/${leagueId}-2026-27.json`);
  const stored = JSON.parse(readFileSync(packPath, "utf8"));
  for (const club of stored.clubs) {
    if (fitted[club.id] !== undefined) club.levelAdjustment = fitted[club.id];
    else delete club.levelAdjustment;
  }
  writeFileSync(packPath, JSON.stringify(stored));
  const ranked = Object.entries(fitted).sort((a, b) => b[1] - a[1]);
  const label = ([id, a]: [string, number]) =>
    `${pack.clubs.find((c) => c.id === id)?.name} ${a > 0 ? "+" : ""}${(a * 100).toFixed(1)}%`;
  console.log(`  above their squad: ${ranked.slice(0, 3).map(label).join(", ")}`);
  console.log(`  below their squad: ${ranked.slice(-3).reverse().map(label).join(", ")}`);
}
