/** Synthetic squads for the tests. */
import { autoTeamSheet } from "./lineup.ts";
import type { Attributes, EnginePlayer, Position, Tactics, TeamSheet } from "./types.ts";

export function makePlayer(
  id: string,
  position: Position,
  level: number,
  overrides: Partial<Attributes> = {},
): EnginePlayer {
  const outfield = position === "GB" ? 4 : level;
  const keeping = position === "GB" ? level : 3;
  return {
    id,
    name: id,
    position,
    overall: Math.round(level * 5),
    attributes: {
      passing: outfield,
      dribbling: outfield,
      finishing: outfield,
      crossing: outfield,
      pace: level,
      stamina: level,
      strength: level,
      vision: outfield,
      positioning: outfield,
      composure: level,
      tackling: outfield,
      marking: outfield,
      reflexes: keeping,
      gkPositioning: keeping,
      gkDistribution: keeping,
      ...overrides,
    },
  };
}

const SQUAD: Position[] = [
  "GB",
  "GB",
  "DC",
  "DC",
  "DC",
  "DG",
  "DD",
  "DG",
  "MDC",
  "MC",
  "MC",
  "MC",
  "MOC",
  "MG",
  "MD",
  "AG",
  "AD",
  "BU",
  "BU",
  "BU",
];

/** A 20-man squad of even level; `overrides` apply to outfield players at the given positions. */
export function makeSquad(
  prefix: string,
  level: number,
  overrides: Partial<Attributes> = {},
  only?: (position: Position) => boolean,
): EnginePlayer[] {
  return SQUAD.map((position, i) =>
    makePlayer(
      `${prefix}-${i}`,
      position,
      level,
      position !== "GB" && (!only || only(position)) ? overrides : {},
    ),
  );
}

export const BALANCED: Tactics = {
  formation: "4-3-3",
  style: "balanced",
  pressing: "medium",
  line: "medium",
};

export function sheet(
  clubId: string,
  squad: EnginePlayer[],
  tactics: Partial<Tactics> = {},
): TeamSheet {
  return autoTeamSheet({ clubId, squad, reputation: 3, tactics: { ...BALANCED, ...tactics } });
}
