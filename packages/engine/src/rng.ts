/**
 * Deterministic pseudo-random generator (mulberry32).
 * Same seed => same sequence, on server and client alike. The match engine must
 * draw all randomness from here, never from Math.random().
 */
export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [min, max], inclusive. */
  int(min: number, max: number): number;
  /** True with probability p. */
  chance(p: number): boolean;
  /** Uniformly picks one element of a non-empty array. */
  pick<T>(items: readonly T[]): T;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    chance: (p) => next() < p,
    pick: (items) => {
      if (items.length === 0) throw new Error("pick() on empty array");
      return items[Math.floor(next() * items.length)]!;
    },
  };
}
