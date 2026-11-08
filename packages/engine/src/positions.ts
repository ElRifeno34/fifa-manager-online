import type { EnginePlayer, Formation, Position } from "./types.ts";

/** Slots of each formation, goalkeeper first. */
export const FORMATIONS: Record<Formation, readonly Position[]> = {
  "4-4-2": ["GB", "DG", "DC", "DC", "DD", "MG", "MC", "MC", "MD", "BU", "BU"],
  "4-3-3": ["GB", "DG", "DC", "DC", "DD", "MC", "MDC", "MC", "AG", "BU", "AD"],
  "4-2-3-1": ["GB", "DG", "DC", "DC", "DD", "MDC", "MDC", "AG", "MOC", "AD", "BU"],
  "3-5-2": ["GB", "DC", "DC", "DC", "MG", "MC", "MDC", "MC", "MD", "BU", "BU"],
  "5-3-2": ["GB", "DG", "DC", "DC", "DC", "DD", "MC", "MDC", "MC", "BU", "BU"],
};

export const FORMATION_NAMES = Object.keys(FORMATIONS) as Formation[];

const NEIGHBOURS: Record<Position, readonly Position[]> = {
  GB: [],
  DC: ["DG", "DD", "MDC"],
  DG: ["DC", "MG"],
  DD: ["DC", "MD"],
  MDC: ["DC", "MC"],
  MC: ["MDC", "MOC", "MG", "MD"],
  MOC: ["MC", "AG", "AD", "BU"],
  MG: ["DG", "MC", "AG"],
  MD: ["DD", "MC", "AD"],
  AG: ["MG", "MOC", "AD", "BU"],
  AD: ["MD", "MOC", "AG", "BU"],
  BU: ["MOC", "AG", "AD"],
};

export type Line = "goal" | "defence" | "midfield" | "attack";

export function lineOf(position: Position): Line {
  if (position === "GB") return "goal";
  if (position === "DC" || position === "DG" || position === "DD") return "defence";
  if (position === "AG" || position === "AD" || position === "BU") return "attack";
  return "midfield";
}

export const isFlank = (position: Position) =>
  position === "DG" ||
  position === "DD" ||
  position === "MG" ||
  position === "MD" ||
  position === "AG" ||
  position === "AD";

/**
 * Share of his level a player keeps in a slot: whole at his position, −10 % next to it, −25 %
 * further away. A goalkeeper out of goal, or an outfield player in goal, is nearly useless.
 */
export function positionFit(player: EnginePlayer, slot: Position): number {
  if (player.position === slot) return 1;
  if (player.position === "GB" || slot === "GB") return 0.3;
  if (player.secondaryPositions?.includes(slot)) return 0.95;
  return NEIGHBOURS[player.position].includes(slot) ? 0.9 : 0.75;
}
