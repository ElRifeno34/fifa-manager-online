/**
 * Engine against reality: plays each real 2026-27 fixture many times with the club AI and compares
 * the outcome with what happened and with the closing odds.
 */
import type { MatchResult } from "../src/index.ts";
import { engineMatchup, loadPack, loadReality, matchTeams } from "./reality.ts";

const STATS = ["shots", "onTarget", "corners", "fouls", "yellows", "reds", "xg"] as const;
type Stat = (typeof STATS)[number];

const ENGINE_FIELD: Record<Stat, keyof MatchResult["stats"]["home"]> = {
  shots: "shots",
  onTarget: "shotsOnTarget",
  corners: "corners",
  fouls: "fouls",
  yellows: "yellowCards",
  reds: "redCards",
  xg: "expectedGoals",
};

export interface Profile {
  matches: number;
  goals: number;
  home: number;
  draw: number;
  away: number;
  /** Per team and per match; null when the source does not have it. */
  stats: Record<Stat, number | null>;
  /** Share of matches by total goals: 0, 1, 2, 3, 4, 5+. */
  totals: number[];
  /** Share of matches by margin: 0, 1, 2, 3+. */
  margins: number[];
}

interface Score {
  homeGoals: number;
  awayGoals: number;
  stats: Partial<Record<Stat, [number, number]>> | null;
}

function profile(scores: Score[]): Profile {
  const n = Math.max(scores.length, 1);
  const share = (test: (s: Score) => boolean) => scores.filter(test).length / n;
  const perTeam = (key: Stat) => {
    const withStat = scores.filter((s) => s.stats?.[key]);
    if (withStat.length < scores.length * 0.5) return null;
    return (
      withStat.reduce((t, s) => t + s.stats![key]![0] + s.stats![key]![1], 0) /
      (2 * withStat.length)
    );
  };
  const total = (s: Score) => s.homeGoals + s.awayGoals;
  const margin = (s: Score) => Math.abs(s.homeGoals - s.awayGoals);
  return {
    matches: scores.length,
    goals: scores.reduce((t, s) => t + total(s), 0) / n,
    home: share((s) => s.homeGoals > s.awayGoals),
    draw: share((s) => s.homeGoals === s.awayGoals),
    away: share((s) => s.homeGoals < s.awayGoals),
    stats: Object.fromEntries(STATS.map((k) => [k, perTeam(k)])) as Record<Stat, number | null>,
    totals: [0, 1, 2, 3, 4, 5].map((g) => share((s) => (g === 5 ? total(s) >= 5 : total(s) === g))),
    margins: [0, 1, 2, 3].map((m) => share((s) => (m === 3 ? margin(s) >= 3 : margin(s) === m))),
  };
}

export interface Comparison {
  league: string;
  real: Profile;
  engine: Profile;
  fixtures: number;
  /** Mean absolute gap between engine and odds probabilities. */
  oddsGap: { home: number; draw: number; away: number };
  /** Average probability given to the odds' favourite: how lopsided matches are. */
  favourite: { odds: number; engine: number };
  /** Brier score of outcome predictions (lower is better); the odds are the yardstick. */
  brier: { odds: number; engine: number };
  buckets: { range: string; count: number; odds: number; engine: number }[];
}

const BUCKETS = [0.3, 0.45, 0.55, 0.65, 0.75, 1.01];

export async function compare(leagueId: string, sims: number): Promise<Comparison | null> {
  const reality = await loadReality(leagueId);
  if (!reality) return null;
  const pack = loadPack(leagueId);
  const played = reality.matches.filter((m) => m.season === reality.current);
  const reference = reality.matches.filter((m) => m.season === reality.reference);
  const { map } = matchTeams([...new Set(played.flatMap((m) => [m.home, m.away]))], pack.clubs);

  const engineScores: Score[] = [];
  const gaps = { home: 0, draw: 0, away: 0 };
  const favourite = { odds: 0, engine: 0 };
  const brier = { odds: 0, engine: 0 };
  const buckets = BUCKETS.slice(0, -1).map((low, i) => ({
    range: `${Math.round(low * 100)}-${Math.round(Math.min(BUCKETS[i + 1]!, 1) * 100)}%`,
    count: 0,
    odds: 0,
    engine: 0,
  }));
  let fixtures = 0;

  for (const [index, match] of played.entries()) {
    const home = map.get(match.home);
    const away = map.get(match.away);
    if (!home || !away || !match.odds) continue;
    fixtures++;
    let h = 0;
    let d = 0;
    for (const r of engineMatchup(pack, home, away, sims, index * 104_729)) {
      if (r.score.home > r.score.away) h++;
      else if (r.score.home === r.score.away) d++;
      engineScores.push({
        homeGoals: r.score.home,
        awayGoals: r.score.away,
        stats: Object.fromEntries(
          STATS.map((k) => [
            k,
            [r.stats.home[ENGINE_FIELD[k]], r.stats.away[ENGINE_FIELD[k]]] as [number, number],
          ]),
        ),
      });
    }
    const engine = [h / sims, d / sims, 1 - (h + d) / sims] as const;
    const odds = [match.odds.home, match.odds.draw, match.odds.away] as const;
    gaps.home += Math.abs(engine[0] - odds[0]);
    gaps.draw += Math.abs(engine[1] - odds[1]);
    gaps.away += Math.abs(engine[2] - odds[2]);
    const homeFavourite = odds[0] >= odds[2];
    const oddsFavourite = homeFavourite ? odds[0] : odds[2];
    const engineFavourite = homeFavourite ? engine[0] : engine[2];
    favourite.odds += oddsFavourite;
    favourite.engine += engineFavourite;
    const outcome =
      match.homeGoals > match.awayGoals ? 0 : match.homeGoals === match.awayGoals ? 1 : 2;
    const score = (p: readonly number[]) =>
      p.reduce((t, x, i) => t + (x - (i === outcome ? 1 : 0)) ** 2, 0);
    brier.odds += score(odds);
    brier.engine += score(engine);
    const bucket = buckets[Math.max(0, BUCKETS.findIndex((b) => oddsFavourite < b) - 1)]!;
    bucket.count++;
    bucket.odds += oddsFavourite;
    bucket.engine += engineFavourite;
  }

  const n = Math.max(fixtures, 1);
  return {
    league: pack.league.name,
    /* Level of goals and statistics: the last full season. */
    real: profile(reference.length ? reference : played),
    engine: profile(engineScores),
    fixtures,
    oddsGap: { home: gaps.home / n, draw: gaps.draw / n, away: gaps.away / n },
    favourite: { odds: favourite.odds / n, engine: favourite.engine / n },
    brier: { odds: brier.odds / n, engine: brier.engine / n },
    buckets: buckets.map((b) => ({
      ...b,
      odds: b.count ? b.odds / b.count : 0,
      engine: b.count ? b.engine / b.count : 0,
    })),
  };
}

/** Gap to reality as one number to minimise: squared gaps, each scaled by its tolerance. */
export function loss(c: Comparison): number {
  const sq = (engine: number | null, real: number | null, tolerance: number) =>
    engine === null || real === null ? 0 : ((engine - real) / tolerance) ** 2;
  const { stats: e } = c.engine;
  const { stats: r } = c.real;
  return (
    sq(c.engine.goals, c.real.goals, 0.15) +
    sq(c.engine.home, c.real.home, 0.04) +
    sq(c.engine.draw, c.real.draw, 0.04) +
    sq(e.shots, r.shots, 1.2) +
    sq(e.onTarget, r.onTarget, 0.5) +
    sq(e.xg, r.xg, 0.12) +
    sq(e.corners, r.corners, 0.8) +
    sq(e.fouls, r.fouls, 1.5) +
    sq(e.yellows, r.yellows, 0.3) +
    sq(c.favourite.engine, c.favourite.odds, 0.025) +
    (c.oddsGap.home / 0.06) ** 2 +
    c.engine.totals.reduce((t, x, i) => t + sq(x, c.real.totals[i]!, 0.04), 0) / 3
  );
}
