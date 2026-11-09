/**
 * Sets the engine against the real 2026-27 season (football-data.co.uk): results, goals, match
 * statistics, and every fixture played so far replayed against its closing odds.
 * Usage: benchmark [league ids] [--sims N]
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { compare, loss, type Profile } from "./compare.ts";
import { hasReality, ROOT } from "./reality.ts";

const args = process.argv.slice(2);
const simsArg = args.indexOf("--sims");
const SIMS = simsArg >= 0 ? Number(args[simsArg + 1]) : 40;
const wanted = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--sims");

export function leaguesWithReality(filter: string[] = []): string[] {
  const packs = join(ROOT, "data/packs");
  if (!existsSync(packs)) {
    console.error("No packs in data/packs: run npm run pack:fetch and npm run pack:build first.");
    process.exit(1);
  }
  return readdirSync(packs)
    .filter((f) => f.endsWith("-2026-27.json"))
    .map((f) => f.replace("-2026-27.json", ""))
    .filter((id) => hasReality(id) && (filter.length === 0 || filter.includes(id)));
}

const pct = (x: number) => `${Math.round(x * 100)}%`.padStart(4);
const num = (x: number | null, digits = 1) => (x === null ? "-" : x.toFixed(digits));
const row = (label: string, real: string, engine: string) =>
  `    ${label.padEnd(20)} ${real.padStart(24)}   ${engine.padStart(24)}`;
const results = (p: Profile) => `${pct(p.home)} ${pct(p.draw)} ${pct(p.away)}`;
const dist = (xs: number[]) => xs.map(pct).join("");

if (import.meta.main) {
  let totalLoss = 0;
  const all = { fixtures: 0, brierOdds: 0, brierEngine: 0, favOdds: 0, favEngine: 0 };
  const leagues = leaguesWithReality(wanted);
  for (const id of leagues) {
    const started = performance.now();
    const c = (await compare(id, SIMS))!;
    const l = loss(c);
    totalLoss += l;
    console.log(
      `\n${c.league}: ${c.fixtures} matches of 2026-27 x ${SIMS} simulations ` +
        `(${((performance.now() - started) / 1000).toFixed(1)} s), gap score ${l.toFixed(1)}`,
    );
    console.log(row("", "reality", "engine"));
    console.log(row("Goals per match", num(c.real.goals, 2), num(c.engine.goals, 2)));
    console.log(row("Home / draw / away", results(c.real), results(c.engine)));
    for (const key of Object.keys(c.real.stats) as (keyof Profile["stats"])[]) {
      const digits = key === "reds" || key === "xg" ? 2 : 1;
      console.log(
        row(`${key} per team`, num(c.real.stats[key], digits), num(c.engine.stats[key], digits)),
      );
    }
    console.log(row("Total goals 0..5+", dist(c.real.totals), dist(c.engine.totals)));
    console.log(row("Margin 0..3+", dist(c.real.margins), dist(c.engine.margins)));
    console.log(
      `    Odds: favourite ${pct(c.favourite.odds)} vs engine ${pct(c.favourite.engine)}, ` +
        `mean gap home ${pct(c.oddsGap.home)} draw ${pct(c.oddsGap.draw)} away ${pct(c.oddsGap.away)}, ` +
        `Brier odds ${c.brier.odds.toFixed(3)} vs engine ${c.brier.engine.toFixed(3)}`,
    );
    console.log(
      `    By favourite strength: ${c.buckets
        .filter((b) => b.count)
        .map((b) => `${b.range} (${b.count}) engine ${pct(b.engine)}`)
        .join(" | ")}`,
    );
    all.fixtures += c.fixtures;
    all.brierOdds += c.brier.odds * c.fixtures;
    all.brierEngine += c.brier.engine * c.fixtures;
    all.favOdds += c.favourite.odds * c.fixtures;
    all.favEngine += c.favourite.engine * c.fixtures;
  }
  const f = Math.max(all.fixtures, 1);
  console.log(
    `\nAll ${leagues.length} leagues, ${all.fixtures} matches: favourite ${pct(all.favOdds / f)} ` +
      `(odds) vs ${pct(all.favEngine / f)} (engine), Brier ${(all.brierOdds / f).toFixed(3)} ` +
      `(odds) vs ${(all.brierEngine / f).toFixed(3)} (engine), total gap score ${totalLoss.toFixed(1)}`,
  );
}
