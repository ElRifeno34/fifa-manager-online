/**
 * A career is one plain object: it saves as JSON, loads back, and every rule reads and writes it.
 */
import type { Newspaper } from "@fmo/data";
import type { Attributes, Position, Tactics } from "@fmo/engine";

export const CAREER_FORMAT = "fmo-career";
export const CAREER_VERSION = 6;

export interface PlayerSeason {
  apps: number;
  minutes: number;
  goals: number;
  assists: number;
  /** Sum of match ratings, for the average. */
  ratingSum: number;
  yellows: number;
  reds: number;
  /** Matches with an hour or more on the pitch, counted as starts. */
  starts: number;
}

export interface PlayerSeasonLine extends PlayerSeason {
  season: string;
  clubId: string;
  leagueId: string;
}

/** Hidden traits, 1 to 20: they shape a player's reactions and, later, his words. */
export interface Personality {
  ambition: number;
  loyalty: number;
  temperament: number;
  professionalism: number;
}

export interface Contract {
  /** Euros per week. */
  wage: number;
  /** Last season of the contract, e.g. "2028-29": the player is free when it ends. */
  until: string;
}

export interface Injury {
  kind: string;
  /** First day the player is available again. */
  until: string;
}

export type TrainingIntensity = "light" | "normal" | "high";
export type TrainingTheme = "physical" | "technical" | "tactical" | "setPieces" | "recovery";
/** Attributes a player works on in particular. */
export type TrainingFocus =
  "attack" | "defence" | "physical" | "technique" | "mental" | "goalkeeping";

export interface TrainingPlan {
  intensity: TrainingIntensity;
  theme: TrainingTheme;
}

/** How well a club knows each system, 0 to 100. */
export interface Familiarity {
  formations: Record<string, number>;
  /** By "style/pressing/line", e.g. "possession/high/high". */
  instructions: Record<string, number>;
}

export interface CareerPlayer {
  id: string;
  name: string;
  nationality: string;
  /** Estimated when the source has none, so that every player ages. */
  birthDate: string;
  foot: "left" | "right" | "both" | null;
  heightCm: number | null;
  number: number | null;
  position: Position;
  secondaryPositions: Position[];
  /** Attributes may hold decimals: progression moves them a little at a time. */
  overall: number;
  potential: number;
  attributes: Attributes;
  marketValueEur: number | null;
  /** Null for free agents and retired players. */
  clubId: string | null;
  retired: boolean;
  /** Free agents and retired players have none. */
  contract: Contract | null;
  personality: Personality;
  /** 0 to 100, 50 neutral: playing time, results and words move it. */
  morale: number;
  injury: Injury | null;
  /** Club matches still to sit out. */
  suspension: number;
  /** Individual training focus set by the manager; null trains everything evenly. */
  trainingFocus: TrainingFocus | null;
  /** Put up for sale by his club: cheaper, and other clubs look at him first. */
  listed: boolean;
  /** Created by the game (youth intake) rather than taken from a pack. */
  generated: boolean;
  fatigue: number;
  /** Date the fatigue was measured: it then recovers day after day. */
  fatigueDate: string | null;
  /** Last five match ratings, for form. */
  ratings: number[];
  season: PlayerSeason;
  history: PlayerSeasonLine[];
}

export interface ClubFinance {
  /** Cash, in euros. */
  balance: number;
  /** Expected revenue over a season (TV, commercial, tickets). */
  revenue: number;
  /** Weekly wage bill the board allows. */
  wageBudget: number;
  transferBudget: number;
  /** This season so far. */
  income: number;
  wages: number;
  transfers: number;
}

export type NegotiationKind = "transfer" | "free" | "renewal";
export type NegotiationStage = "fee" | "contract" | "done" | "failed";

/** A deal the manager is negotiating: first the fee with the club, then the contract with the player. */
export interface Negotiation {
  id: number;
  kind: NegotiationKind;
  playerId: string;
  /** Selling club, for a transfer. */
  sellerId: string | null;
  stage: NegotiationStage;
  opened: string;
  /** Rounds used in the current stage (three at most). */
  round: number;
  /** What the other side asks for now: a fee, then a weekly wage. */
  askingFee: number;
  demandWage: number;
  /** Agreed fee once the clubs agree. */
  fee: number | null;
  /** Playing time promised to the player, kept for the conversations. */
  promise: "key" | "regular" | "rotation" | null;
}

/** A bid from another club for one of the manager's players. */
export interface IncomingOffer {
  id: number;
  date: string;
  buyerId: string;
  playerId: string;
  fee: number;
  /** Most the buyer will pay; hidden from the manager. */
  limit: number;
  round: number;
  status: "open" | "accepted" | "rejected" | "withdrawn";
}

export interface TransferRecord {
  date: string;
  playerId: string;
  fromId: string | null;
  toId: string;
  fee: number;
}

export interface PlayingTimePromise {
  playerId: string;
  role: "key" | "regular" | "rotation";
  date: string;
  /** His starts and the club's matches when the promise was made, to judge it later. */
  starts0: number;
  matches0: number;
  /** Promises already broken to him. */
  broken: number;
}

export type Speaker = "manager" | "player" | "assistant" | "board";

export interface ConversationLine {
  speaker: Speaker;
  text: string;
}

export interface ConversationChoice {
  id: string;
  label: string;
}

export type ConversationTopic =
  | "playingTime"
  | "contract"
  | "transferRequest"
  | "brokenPromise"
  | "blockedMove"
  | "praise"
  | "criticism"
  | "advice"
  | "seasonObjective"
  | "warning"
  | "sacked"
  | "jobOffer";

export interface Conversation {
  id: number;
  date: string;
  with: "player" | "assistant" | "board";
  playerId: string | null;
  topic: ConversationTopic;
  lines: ConversationLine[];
  /** Answers the manager can give; empty once the conversation is over. */
  choices: ConversationChoice[];
  status: "open" | "closed";
  /** Topic data, e.g. the clubs offering a job. */
  data: Record<string, string | number>;
}

export type ObjectiveKind = "title" | "europe" | "topHalf" | "midTable" | "survival" | "promotion";

export interface Board {
  objective: { kind: ObjectiveKind; position: number };
  /** 0 to 100: below about 15 the manager is sacked. */
  confidence: number;
  lastReview: string;
  /** The board granted extra budget this season already. */
  budgetAsked: boolean;
}

export interface CareerClub {
  id: string;
  name: string;
  initials: string;
  city: string | null;
  primary: string;
  secondary: string;
  reputation: number;
  /** Collective level the engine applies: structure (see strength.ts) plus form. */
  levelAdjustment: number;
  /** Part of the level that comes from the club's form; it halves every season. */
  formAdjustment: number;
  leagueId: string;
  finance: ClubFinance;
  familiarity: Familiarity;
  /** Tactics of the club's last match: the system it trains. */
  tactics: Tactics | null;
}

export interface CareerLeague {
  id: string;
  name: string;
  country: string;
  /** 1 for a top division, 2 for the division below it. */
  tier: 1 | 2;
}

/** Two divisions swapping clubs at the end of each season. */
export interface LeagueLink {
  upper: string;
  lower: string;
  /** Clubs going up and down. */
  places: number;
}

export interface Goal {
  playerId: string;
  assistId: string | null;
  minute: number;
  side: "home" | "away";
}

export interface CareerFixture {
  id: number;
  leagueId: string;
  round: number;
  date: string;
  time: string | null;
  homeClubId: string;
  awayClubId: string;
  result: { home: number; away: number; goals: Goal[]; manOfTheMatch: string } | null;
}

export type InboxKind =
  | "welcome"
  | "result"
  | "season"
  | "promotion"
  | "relegation"
  | "progression"
  | "youth"
  | "retirement"
  | "injury"
  | "suspension"
  | "contract"
  | "finance"
  | "training"
  | "transfer"
  | "offer"
  | "conversation"
  | "advice";

export interface InboxMessage {
  id: number;
  date: string;
  kind: InboxKind;
  title: string;
  body: string;
  read: boolean;
  /** The conversation to answer, when the message opens one. */
  conversationId?: number;
}

export interface TableLine {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface SeasonRecord {
  season: string;
  leagueId: string;
  /** Final table, first to last. */
  table: TableLine[];
  promoted: string[];
  relegated: string[];
}

export interface CareerState {
  format: typeof CAREER_FORMAT;
  version: number;
  seed: number;
  /** Today, YYYY-MM-DD. */
  date: string;
  season: { label: string; index: number; start: string };
  manager: { name: string; clubId: string };
  /** The manager's tactics, kept from match to match; null lets the assistant choose. */
  tactics: Tactics | null;
  leagues: CareerLeague[];
  links: LeagueLink[];
  clubs: Record<string, CareerClub>;
  players: Record<string, CareerPlayer>;
  /** This season's calendar; past seasons survive as tables and player history. */
  fixtures: CareerFixture[];
  newspapers: Newspaper[];
  inbox: InboxMessage[];
  history: SeasonRecord[];
  /** Last day wages and income were settled; it happens every seven days. */
  payday: string;
  /** Last weekly training session; sessions are seven days apart. */
  trainingDay: string;
  /** The manager's weekly plan; null lets the assistant choose each week. */
  training: TrainingPlan | null;
  /** Plan the assistant applied last week, when the manager left it to him. */
  assistantPlan: TrainingPlan | null;
  /** Last day of transfer activity by the club AI; it happens every seven days in a window. */
  marketDay: string;
  negotiations: Negotiation[];
  offers: IncomingOffer[];
  transfers: TransferRecord[];
  promises: PlayingTimePromise[];
  conversations: Conversation[];
  board: Board;
  /** Last weekly look at the squad for players who want to talk. */
  talkDay: string;
  /** Next id for messages, fixtures and generated players. */
  nextId: number;
}
