/**
 * Engine inputs. They mirror the data pack (`@fmo/data`) structurally, so a pack player can be passed
 * as is, while the engine stays free of dependencies.
 */
export type Position =
  "GB" | "DC" | "DG" | "DD" | "MDC" | "MC" | "MOC" | "MG" | "MD" | "AG" | "AD" | "BU";

/** Scale 1 to 20. */
export interface Attributes {
  passing: number;
  dribbling: number;
  finishing: number;
  crossing: number;
  pace: number;
  stamina: number;
  strength: number;
  vision: number;
  positioning: number;
  composure: number;
  tackling: number;
  marking: number;
  reflexes: number;
  gkPositioning: number;
  gkDistribution: number;
}

export interface EnginePlayer {
  id: string;
  name: string;
  position: Position;
  secondaryPositions?: readonly Position[];
  /** 1 to 99. */
  overall: number;
  attributes: Attributes;
}

/** State carried from one match to the next. */
export interface PlayerCondition {
  /** 0 (fresh) to 100 (exhausted). */
  fatigue: number;
  /** -1 (poor run) to 1 (great run), from recent ratings. */
  form: number;
}

export type Formation = "4-4-2" | "4-3-3" | "4-2-3-1" | "3-5-2" | "5-3-2";
export type Style = "possession" | "balanced" | "direct";
export type Level = "low" | "medium" | "high";

export interface Tactics {
  formation: Formation;
  style: Style;
  pressing: Level;
  line: Level;
}

export interface Starter {
  player: EnginePlayer;
  /** Slot of the formation the player fills, which may differ from his own position. */
  position: Position;
}

export interface TeamSheet {
  clubId: string;
  tactics: Tactics;
  /** Exactly 11, the first one in goal. */
  starters: Starter[];
  bench: EnginePlayer[];
  /** By player id; players missing from it are fresh and in neutral form. */
  condition?: Readonly<Record<string, PlayerCondition>>;
  /**
   * Collective strength that the players' level does not explain (coach, form, cohesion), as a
   * share of every attribute: 0.05 plays 5 % above the squad's level. Fitted on betting odds.
   */
  levelAdjustment?: number;
  /**
   * How well the team knows its formation and instructions, 0 to 1: trained tactics are played
   * better, a system changed every week a little worse. Missing means 0.7, a settled side.
   */
  familiarity?: number;
}

export type Side = "home" | "away";

export type MatchEventType =
  | "kickoff"
  | "pass"
  | "dribble"
  | "turnover"
  | "shot"
  | "save"
  | "goal"
  | "foul"
  | "yellow"
  | "red"
  | "corner"
  | "freeKick"
  | "penalty"
  | "substitution"
  | "halfTime"
  | "fullTime";

export interface MatchEvent {
  half: 1 | 2;
  /** Clock minute: up to 45+ in the first half, from 45 to 90+ in the second. */
  minute: number;
  second: number;
  type: MatchEventType;
  side: Side | null;
  playerId?: string;
  /** Assist provider, player fouled, or player coming on. */
  otherPlayerId?: string;
  /** Ball position: x from the home goal (0) to the away goal (100), y from left to right touchline. */
  ball: { x: number; y: number };
  /** Kind of chance for shots and goals: through, cross, dribble, longShot, counter, corner… */
  detail?: string;
}

export interface TeamStats {
  goals: number;
  /** Share of time on the ball, 0 to 100. */
  possession: number;
  shots: number;
  shotsOnTarget: number;
  expectedGoals: number;
  passes: number;
  passesCompleted: number;
  /** Opposition build-up sequences faced while using a high press. */
  pressingSequences: number;
  /** Opposition build-up possessions lost in midfield against this team's defense. */
  midfieldRegains: number;
  /** Possessions that began immediately after a turnover and were played as a counter. */
  counterAttacks: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
}

export interface PlayerMatchLine {
  playerId: string;
  side: Side;
  position: Position;
  minutes: number;
  /** Out of 10, 6.0 being an average match. */
  rating: number;
  goals: number;
  assists: number;
  shots: number;
  yellowCards: number;
  redCard: boolean;
  /** Fatigue at the final whistle, to carry into the next match. */
  fatigue: number;
}

export interface MatchResult {
  score: { home: number; away: number };
  stats: { home: TeamStats; away: TeamStats };
  players: PlayerMatchLine[];
  manOfTheMatch: string;
  events: MatchEvent[];
}
