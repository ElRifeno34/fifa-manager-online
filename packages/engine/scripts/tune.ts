/**
 * Fits the engine's parameters (TUNING) to the real 2026-27 season of football-data.co.uk.
 *  1. Rates measured directly in the data (fouls, cards, corners, shots, accuracy, goals per
 *     shot, home advantage, draws) are corrected in proportion to the gap, a few times over.
 *  2. The weight of the level gap (slope, gapCap) is searched against the closing odds.
 * Prints the fitted values, to copy into src/match.ts. Usage: tune [league ids] [--sims N]
 */
import { TUNING } from "../src/index.ts";
import { leaguesWithReality } from "./benchmark.ts";
import { compare, loss, type Comparison } from "./compare.ts";

const args = process.argv.slice(2);
const simsArg = args.indexOf("--sims");
const SIMS = simsArg >= 0 ? Number(args[simsArg + 1]) : 10;
const leagues = leaguesWithReality(
  args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--sims"),
);
const T = TUNING;

interface Totals {
  loss: number;
  comparisons: Comparison[];
  /** Fixture-weighted averages, real then engine; stats only over leagues that have them. */
  avg: (pick: (c: Comparison, side: "real" | "engine") => number | null) => [number, number];
}

async function evaluate(): Promise<Totals> {
  const comparisons: Comparison[] = [];
  for (const id of leagues) comparisons.push((await compare(id, SIMS))!);
  const avg: Totals["avg"] = (pick) => {
    let weight = 0;
    let real = 0;
    let engine = 0;
    for (const c of comparisons) {
      const r = pick(c, "real");
      const e = pick(c, "engine");
      if (r === null || e === null) continue;
      weight += c.fixtures;
      real += r * c.fixtures;
      engine += e * c.fixtures;
    }
    return [real / weight, engine / weight];
  };
  return { loss: comparisons.reduce((t, c) => t + loss(c), 0), comparisons, avg };
}

const show = (label: string, [real, engine]: [number, number]) =>
  `${label} ${real.toFixed(3)}/${engine.toFixed(3)}`;

/* Step 1: direct corrections. */
for (let pass = 1; pass <= 4; pass++) {
  const t = await evaluate();
  const stat = (key: keyof Comparison["real"]["stats"]) => t.avg((c, s) => c[s].stats[key]);
  const fouls = stat("fouls");
  const yellows = stat("yellows");
  const reds = stat("reds");
  const corners = stat("corners");
  const shots = stat("shots");
  const onTarget = stat("onTarget");
  const goals = t.avg((c, s) => c[s].goals / 2);
  const home = t.avg((c, s) => c[s].home - c[s].away);
  const draw = t.avg((c, s) => c[s].draw);
  console.log(
    `pass ${pass}: loss ${t.loss.toFixed(1)} | ${show("goals/team", goals)} ${show("shots", shots)} ` +
      `${show("onTarget", onTarget)} ${show("corners", corners)} ${show("fouls", fouls)} ` +
      `${show("yellows", yellows)} ${show("reds", reds)} ${show("home-away", home)} ${show("draw", draw)}`,
  );

  T.foulPerPossession *= fouls[0] / fouls[1];
  T.yellowPerFoul *= yellows[0] / fouls[0] / (yellows[1] / fouls[1]);
  T.redPerFoul *= Math.max(0.3, reds[0] / reds[1]);
  T.cornerRate *= corners[0] / corners[1];
  /* Chance creation is a logit: shift it by the log of the shot gap. */
  T.finalBase += Math.log(shots[0] / shots[1]) * 1.2;
  /* Accuracy: on-target share = (goals + saves) / shots, saves taken from the missed shots. */
  const goalsPerShot = goals[1] / shots[1];
  const targetShare = onTarget[0] / shots[0];
  T.saveShare = Math.min(0.6, Math.max(0.1, (targetShare - goalsPerShot) / (1 - goalsPerShot)));
  T.xgScale *= goals[0] / shots[0] / (goals[1] / shots[1]);
  T.homeBoost = Math.max(0, T.homeBoost + (home[0] - home[1]) * 0.12);
  T.gameState = Math.max(0, T.gameState + (draw[0] - draw[1]) * 4);
}

/* Step 2: weight of the level gap against the odds, by coordinate search. */
let best = await evaluate();
console.log(`after step 1: loss ${best.loss.toFixed(1)}`);
for (const [key, steps] of [
  ["slope", [0.06, 0.03]],
  ["gapCap", [0.4, 0.2]],
  ["slope", [0.02]],
] as const) {
  for (const step of steps) {
    for (const direction of [1, -1]) {
      for (;;) {
        const before = T[key];
        T[key] = Math.max(0.05, before + direction * step);
        const t = await evaluate();
        const fav = t.avg((c, s) => (s === "real" ? c.favourite.odds : c.favourite.engine));
        console.log(
          `  ${key} ${T[key].toFixed(3)}: loss ${t.loss.toFixed(1)} ${show("favourite", fav)}`,
        );
        if (t.loss < best.loss) best = t;
        else {
          T[key] = before;
          break;
        }
      }
    }
  }
}

const round = (x: number) => Number(x.toFixed(4));
console.log(`\nFitted (loss ${best.loss.toFixed(1)} over ${leagues.length} leagues):`);
console.log(
  JSON.stringify(
    Object.fromEntries(
      (
        [
          "midBase",
          "finalBase",
          "slope",
          "gapCap",
          "homeBoost",
          "foulPerPossession",
          "yellowPerFoul",
          "redPerFoul",
          "saveShare",
          "xgScale",
          "cornerRate",
          "gameState",
        ] as const
      ).map((k) => [k, round(T[k])]),
    ),
    null,
    2,
  ),
);
