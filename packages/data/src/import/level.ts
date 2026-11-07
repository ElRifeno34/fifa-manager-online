import { ATTRIBUTES, type Attribute, type Attributes, type Position } from "../schema.ts";

export interface LevelInput {
  position: Position;
  age: number | null;
  marketValueEur: number | null;
  squad: "first-team" | "reserve";
}

export interface PerformanceInput {
  minutes: number;
  goals: number;
  assists: number;
  yellowCards: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Turns a market value into a 1-99 level. Values mostly price age and potential as well as
 * current ability, so young players are pulled down, veterans pushed up, and goalkeepers
 * (structurally cheaper) lifted. Rough on purpose: the engine calibration will tune it.
 */
export function estimateOverall({ position, age, marketValueEur, squad }: LevelInput): number {
  if (!marketValueEur) return squad === "first-team" ? 62 : 52;
  let overall = 62 + (Math.log10(marketValueEur) - 6) * 13;
  if (age !== null && age < 24) overall -= (24 - age) * 0.9;
  if (age !== null && age > 29) overall += Math.min(age - 29, 6) * 1.4;
  if (position === "GB") overall += 3;
  return Math.round(clamp(overall, 40, 94));
}

export function estimatePotential(overall: number, age: number | null): number {
  if (age === null || age >= 29) return overall;
  const growth = age < 24 ? (24 - age) * 1.8 + 2 : (29 - age) * 0.4;
  return Math.round(clamp(overall + growth, overall, 96));
}

type Profile = Partial<Record<Attribute, number>>;

/** Offsets from the player's base level, per position. Unlisted attributes stay at the base. */
const PROFILES: Record<Position, Profile> = {
  GB: {},
  DC: {
    marking: 2,
    tackling: 2,
    strength: 2,
    positioning: 1,
    finishing: -7,
    dribbling: -4,
    crossing: -5,
    pace: -1,
  },
  DG: { pace: 1, crossing: 1, stamina: 1, finishing: -6, marking: -1 },
  DD: { pace: 1, crossing: 1, stamina: 1, finishing: -6, marking: -1 },
  MDC: { tackling: 2, marking: 1, stamina: 1, positioning: 1, passing: 1, finishing: -5 },
  MC: { passing: 2, vision: 2, stamina: 1, tackling: -2, marking: -3, finishing: -3 },
  MOC: { vision: 2, passing: 2, dribbling: 2, finishing: -1, tackling: -6, marking: -7 },
  MG: { crossing: 2, pace: 1, stamina: 1, dribbling: 1, tackling: -4, marking: -5 },
  MD: { crossing: 2, pace: 1, stamina: 1, dribbling: 1, tackling: -4, marking: -5 },
  AG: { pace: 2, dribbling: 2, crossing: 1, finishing: -1, tackling: -7, marking: -8 },
  AD: { pace: 2, dribbling: 2, crossing: 1, finishing: -1, tackling: -7, marking: -8 },
  BU: {
    finishing: 3,
    positioning: 2,
    composure: 1,
    strength: 1,
    passing: -3,
    crossing: -4,
    tackling: -9,
    marking: -10,
  },
};

const KEEPER_ONLY: readonly Attribute[] = ["reflexes", "gkPositioning", "gkDistribution"];
const OUTFIELD_ONLY: readonly Attribute[] = [
  "passing",
  "dribbling",
  "finishing",
  "crossing",
  "tackling",
  "marking",
  "vision",
  "positioning",
];

/** Typical output per 90 minutes, to compare a player with others at his position. */
const GOALS_PER_90: Partial<Record<Position, number>> = {
  BU: 0.45,
  AG: 0.28,
  AD: 0.28,
  MOC: 0.22,
  MG: 0.15,
  MD: 0.15,
  MC: 0.08,
};
const ASSISTS_PER_90: Partial<Record<Position, number>> = {
  MOC: 0.2,
  AG: 0.2,
  AD: 0.2,
  MG: 0.17,
  MD: 0.17,
  MC: 0.11,
  DG: 0.1,
  DD: 0.1,
};

/** Stable pseudo-random value in [-1, 1] for a player and attribute (FNV-1a). */
function jitter(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) / 0xffffffff) * 2 - 1;
}

export interface AttributeInput {
  id: string;
  position: Position;
  overall: number;
  age: number | null;
  heightCm: number | null;
  performance: PerformanceInput | null;
}

/**
 * Builds the 15 attributes. Finishing, passing and vision react to real output, strength to
 * height, pace, stamina and composure to age. Everything else is an estimate from position
 * and level, since free sources have no tackles, duels or speed data.
 */
export function deriveAttributes(input: AttributeInput): Attributes {
  const { id, position, overall, age, heightCm, performance } = input;
  const base = overall / 5;
  const offsets: Profile = { ...PROFILES[position] };
  const add = (attribute: Attribute, delta: number) => {
    offsets[attribute] = (offsets[attribute] ?? 0) + delta;
  };

  if (performance && performance.minutes >= 900) {
    const per90 = 90 / performance.minutes;
    const goalNorm = GOALS_PER_90[position];
    if (goalNorm) {
      add("finishing", clamp((performance.goals * per90 - goalNorm) / goalNorm, -1, 1.5) * 2);
    }
    const assistNorm = ASSISTS_PER_90[position];
    if (assistNorm) {
      const delta = clamp((performance.assists * per90 - assistNorm) / assistNorm, -1, 1.5);
      add("vision", delta * 1.5);
      add("passing", delta);
    }
    if (performance.yellowCards * per90 > 0.3) add("composure", -1);
  }
  if (heightCm !== null) add("strength", clamp((heightCm - 182) / 6, -2.5, 2.5));
  if (age !== null) {
    if (age > 29) {
      add("pace", -(age - 29) * 0.6);
      add("stamina", -(age - 29) * 0.4);
      add("composure", Math.min(age - 29, 3) * 0.5);
    } else if (age < 21) add("composure", -(21 - age) * 0.5);
  }

  const keeper = position === "GB";
  const entries = ATTRIBUTES.map((attribute) => {
    let value: number;
    if (KEEPER_ONLY.includes(attribute)) {
      value = keeper ? base + (attribute === "gkDistribution" ? -1.5 : 0.5) : 1 + base / 10;
    } else if (keeper && OUTFIELD_ONLY.includes(attribute)) {
      value = base / 3;
    } else {
      value = base + (offsets[attribute] ?? 0);
    }
    return [attribute, Math.round(clamp(value + jitter(`${id}:${attribute}`) * 0.9, 1, 20))];
  });
  return Object.fromEntries(entries) as Attributes;
}

const SUB_POSITIONS: Record<string, Position> = {
  Goalkeeper: "GB",
  "Centre-Back": "DC",
  "Left-Back": "DG",
  "Right-Back": "DD",
  "Defensive Midfield": "MDC",
  "Central Midfield": "MC",
  "Attacking Midfield": "MOC",
  "Left Midfield": "MG",
  "Right Midfield": "MD",
  "Left Winger": "AG",
  "Right Winger": "AD",
  "Second Striker": "BU",
  "Centre-Forward": "BU",
};

const LINES: Record<string, Position> = { GK: "GB", DF: "DC", MF: "MC", FW: "BU" };

/** Prefers the detailed Transfermarkt position, falling back on the Wikipedia line. */
export function toPosition(subPosition: string | undefined, line: string): Position {
  return (subPosition && SUB_POSITIONS[subPosition]) || LINES[line] || "MC";
}

/**
 * Level of a first-team player with no market value, usually a promoted club's player missing
 * from Transfermarkt: just under the club's known players, or a youth level for high numbers.
 */
export function estimateMissingOverall(clubMedian: number, number: number | null): number {
  return number !== null && number <= 25 ? clubMedian - 1 : Math.min(clubMedian - 4, 58);
}

export function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 62;
}

/** Stars from the average level of the club's best eleven. */
export function clubReputation(bestElevenOverall: number): number {
  if (bestElevenOverall >= 82) return 5;
  if (bestElevenOverall >= 77) return 4;
  if (bestElevenOverall >= 74) return 3;
  if (bestElevenOverall >= 69) return 2;
  return 1;
}
