import { FORMATION_NAMES, FORMATIONS, positionFit } from "./positions.ts";
import type {
  EnginePlayer,
  Formation,
  PlayerCondition,
  Position,
  Starter,
  Tactics,
  TeamSheet,
} from "./types.ts";

export const BENCH_SIZE = 9;

type Conditions = Readonly<Record<string, PlayerCondition>>;

/** What a player is worth in a slot today: level, fit and freshness (tired players are rested). */
export function selectionValue(
  player: EnginePlayer,
  slot: Position,
  condition?: PlayerCondition,
): number {
  const fatigue = condition?.fatigue ?? 0;
  return player.overall * positionFit(player, slot) * (1 - (fatigue / 100) * 0.5);
}

export interface Lineup {
  starters: Starter[];
  bench: EnginePlayer[];
  /** Sum of the starters' selection values, to compare formations. */
  value: number;
}

/**
 * Fills the formation greedily, best player and slot pair first. The bench takes the best of the
 * rest, with a goalkeeper when the squad has one.
 */
export function pickLineup(
  squad: readonly EnginePlayer[],
  formation: Formation,
  condition: Conditions = {},
): Lineup {
  const slots = FORMATIONS[formation];
  if (squad.length < slots.length) {
    throw new Error(`${squad.length} players cannot fill a ${formation}`);
  }
  const chosen = new Array<EnginePlayer | undefined>(slots.length);
  const used = new Set<string>();
  let value = 0;
  /* values[p][s]: computed once, the greedy loop below only compares numbers. */
  const taken = squad.map(() => false);
  const values = squad.map((player) =>
    slots.map((slot) => selectionValue(player, slot, condition[player.id])),
  );

  for (let filled = 0; filled < slots.length; filled++) {
    let best = { player: -1, slot: -1, value: -Infinity };
    for (let p = 0; p < squad.length; p++) {
      if (taken[p]) continue;
      const row = values[p]!;
      for (let slot = 0; slot < slots.length; slot++) {
        if (!chosen[slot] && row[slot]! > best.value) best = { player: p, slot, value: row[slot]! };
      }
    }
    const player = squad[best.player]!;
    chosen[best.slot] = player;
    taken[best.player] = true;
    used.add(player.id);
    value += best.value;
  }

  const rest = squad
    .filter((p) => !used.has(p.id))
    .sort(
      (a, b) =>
        selectionValue(b, b.position, condition[b.id]) -
        selectionValue(a, a.position, condition[a.id]),
    );
  const bench = rest.slice(0, BENCH_SIZE);
  const keeper = rest.find((p) => p.position === "GB");
  if (keeper && !bench.includes(keeper)) bench[bench.length - 1] = keeper;

  return {
    starters: slots.map((position, i) => ({ player: chosen[i]!, position })),
    bench,
    value,
  };
}

/** Average level of a squad's best eleven. */
export function squadStrength(squad: readonly EnginePlayer[]): number {
  const best = squad
    .map((p) => p.overall)
    .sort((a, b) => b - a)
    .slice(0, 11);
  return best.reduce((sum, overall) => sum + overall, 0) / Math.max(best.length, 1);
}

/**
 * Adapts a club's usual style to its opponent: cautious against a clearly stronger side (pressing
 * high against better passers gets a team cut apart), bolder against a weaker one.
 */
export function tierAgainst(tier: number, own: number, opponent: number): number {
  const gap = opponent - own;
  if (gap >= 8) return 2;
  if (gap >= 4) return Math.max(2, tier - 1);
  if (gap <= -4) return Math.min(4, tier + 1);
  return tier;
}

/** Club AI: big clubs keep the ball and press high, small ones sit deep and play direct. */
export function styleForReputation(reputation: number): Omit<Tactics, "formation"> {
  if (reputation >= 4) return { style: "possession", pressing: "high", line: "high" };
  if (reputation <= 2) return { style: "direct", pressing: "low", line: "low" };
  return { style: "balanced", pressing: "medium", line: "medium" };
}

/** The assistant's or the club AI's team: the formation that suits the squad best. */
export function autoTeamSheet(options: {
  clubId: string;
  squad: readonly EnginePlayer[];
  reputation: number;
  condition?: Conditions;
  /** Imposed tactics, e.g. the player's own; the formation is then kept too. */
  tactics?: Tactics;
  levelAdjustment?: number;
}): TeamSheet {
  const condition = options.condition ?? {};
  const formations = options.tactics ? [options.tactics.formation] : FORMATION_NAMES;
  let best: { formation: Formation; lineup: Lineup } | null = null;
  for (const formation of formations) {
    const lineup = pickLineup(options.squad, formation, condition);
    if (!best || lineup.value > best.lineup.value) best = { formation, lineup };
  }
  return {
    clubId: options.clubId,
    tactics: options.tactics ?? {
      formation: best!.formation,
      ...styleForReputation(options.reputation),
    },
    starters: best!.lineup.starters,
    bench: best!.lineup.bench,
    condition,
    ...(options.levelAdjustment ? { levelAdjustment: options.levelAdjustment } : {}),
  };
}
