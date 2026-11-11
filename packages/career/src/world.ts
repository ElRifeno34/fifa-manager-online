import { generateRoundRobin, type Pack } from "@fmo/data";
import { addDays, seasonLabel } from "./calendar.ts";
import { openFinance, seasonRevenue, signSquad } from "./finance.ts";
import { initialMorale, personalityFor } from "./people.ts";
import { indexSquads, newSeasonStats, post } from "./state.ts";
import { newBoard, seasonMeeting } from "./board.ts";
import { splitLevelAdjustments } from "./strength.ts";
import { newFamiliarity, settleClubSystems } from "./training.ts";
import {
  CAREER_FORMAT,
  CAREER_VERSION,
  type CareerFixture,
  type CareerPlayer,
  type CareerState,
  type LeagueLink,
} from "./types.ts";

/** Divisions linked by promotion and relegation in v1: three clubs each way. */
export const LEAGUE_LINKS: LeagueLink[] = [
  { upper: "premier-league", lower: "championship", places: 3 },
  { upper: "ligue-1", lower: "ligue-2", places: 3 },
  { upper: "bundesliga", lower: "2-bundesliga", places: 3 },
  { upper: "serie-a", lower: "serie-b", places: 3 },
  { upper: "laliga", lower: "laliga-hypermotion", places: 3 },
];

/** The leagues a career in `leagueId` plays in: its pair of divisions, or the league alone. */
export function worldOf(leagueId: string, links: readonly LeagueLink[] = LEAGUE_LINKS): string[] {
  const link = links.find((l) => l.upper === leagueId || l.lower === leagueId);
  return link ? [link.upper, link.lower] : [leagueId];
}

/** Every career starts in the 2026-27 season: from summer 2026. */
export const SEASON_OPENS = "2026-07-01";
const GENERATED_START = "2026-08-15";

/**
 * A pack's calendar, or a generated one when its real calendar starts before the 2026-27 season
 * (leagues played over a calendar year, such as Brazil's 2026 season).
 */
function calendarOf(pack: Pack) {
  const big = pack.clubs.length > SINGLE_ROUND_ABOVE;
  if (!big && pack.fixtures.every((f) => f.date >= SEASON_OPENS)) return pack.fixtures;
  return leagueCalendar(
    pack.clubs.map((c) => c.id),
    GENERATED_START,
  ).map((f) => ({ ...f, time: null }));
}

/** Above this many clubs, a league plays each opponent once: MLS's 30 clubs play 29 matches. */
const SINGLE_ROUND_ABOVE = 24;

/** A league's season: home and away, or a single round for very large leagues. */
export function leagueCalendar(clubIds: readonly string[], start: string) {
  const fixtures = generateRoundRobin(clubIds, start);
  if (clubIds.length <= SINGLE_ROUND_ABOVE) return fixtures;
  /* A single round: the club with fewer home games so far plays at home, to share them out. */
  const home = new Map(clubIds.map((id) => [id, 0]));
  return fixtures
    .filter((f) => f.round < clubIds.length)
    .map((f) => {
      const swap = home.get(f.homeClubId)! > home.get(f.awayClubId)!;
      const fixture = swap ? { ...f, homeClubId: f.awayClubId, awayClubId: f.homeClubId } : f;
      home.set(fixture.homeClubId, home.get(fixture.homeClubId)! + 1);
      return fixture;
    });
}

/** Players without a birth date are taken as 26 when the career starts. */
const ASSUMED_AGE = 26;

export function createCareer(options: {
  packs: readonly Pack[];
  clubId: string;
  managerName: string;
  seed: number;
  links?: readonly LeagueLink[];
}): CareerState {
  const links = (options.links ?? LEAGUE_LINKS).filter(
    (l) =>
      options.packs.some((p) => p.league.id === l.upper) &&
      options.packs.some((p) => p.league.id === l.lower),
  );
  if (!options.packs.some((p) => p.clubs.some((c) => c.id === options.clubId))) {
    throw new Error(`No club ${options.clubId} in the packs`);
  }
  const calendars = new Map(options.packs.map((p) => [p.league.id, calendarOf(p)]));
  const firstMatch = [...calendars.values()].flatMap((c) => c.map((f) => f.date)).sort()[0]!;
  const start = addDays(firstMatch, -14);
  const assumedBirth = `${Number(start.slice(0, 4)) - ASSUMED_AGE}${start.slice(4)}`;

  const state: CareerState = {
    format: CAREER_FORMAT,
    version: CAREER_VERSION,
    seed: options.seed,
    date: start,
    season: { label: seasonLabel(firstMatch), index: 0, start: firstMatch },
    manager: { name: options.managerName, clubId: options.clubId },
    tactics: null,
    leagues: options.packs.map((p) => ({
      id: p.league.id,
      name: p.league.name,
      country: p.league.country,
      tier: links.some((l) => l.lower === p.league.id) ? 2 : 1,
    })),
    links,
    clubs: {},
    players: {},
    fixtures: [],
    newspapers: options.packs.flatMap((p) => p.newspapers),
    inbox: [],
    history: [],
    payday: start,
    /* Last session: four days before the start, so the first falls midweek, three days in. */
    trainingDay: addDays(start, -4),
    training: null,
    assistantPlan: null,
    marketDay: addDays(start, -6),
    negotiations: [],
    offers: [],
    transfers: [],
    promises: [],
    conversations: [],
    board: {
      objective: { kind: "midTable", position: 10 },
      confidence: 60,
      lastReview: start,
      budgetAsked: false,
    },
    talkDay: start,
    nextId: 1,
  };

  for (const pack of options.packs) {
    for (const c of pack.clubs) {
      state.clubs[c.id] = {
        id: c.id,
        name: c.name,
        initials: c.initials,
        city: c.city,
        primary: c.primary,
        secondary: c.secondary,
        reputation: c.reputation,
        levelAdjustment: c.levelAdjustment ?? 0,
        formAdjustment: 0,
        leagueId: pack.league.id,
        finance: openFinance(0),
        familiarity: newFamiliarity(),
        tactics: null,
      };
    }
    for (const p of pack.players) {
      const player: CareerPlayer = {
        id: p.id,
        name: p.name,
        nationality: p.nationality,
        birthDate: p.birthDate ?? assumedBirth,
        foot: p.foot,
        heightCm: p.heightCm,
        number: p.number,
        position: p.position,
        secondaryPositions: [...p.secondaryPositions],
        overall: p.overall,
        potential: p.potential,
        attributes: { ...p.attributes },
        marketValueEur: p.marketValueEur,
        clubId: p.clubId,
        retired: false,
        contract: null,
        personality: personalityFor(options.seed, p.id),
        morale: initialMorale(options.seed, p.id),
        injury: null,
        suspension: 0,
        trainingFocus: null,
        listed: false,
        generated: false,
        fatigue: 0,
        fatigueDate: null,
        ratings: [],
        season: newSeasonStats(),
        history: [],
      };
      state.players[p.id] = player;
    }
    const fixtures: CareerFixture[] = [...calendars.get(pack.league.id)!]
      .sort((a, b) => a.date.localeCompare(b.date) || a.round - b.round)
      .map((f) => ({
        id: state.nextId++,
        leagueId: pack.league.id,
        round: f.round,
        date: f.date,
        time: f.time,
        homeClubId: f.homeClubId,
        awayClubId: f.awayClubId,
        result: null,
      }));
    state.fixtures.push(...fixtures);
  }
  state.fixtures.sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);

  /* Money and contracts follow from the squads: revenue from their value, wages from revenue. */
  const squads = indexSquads(state);
  splitLevelAdjustments(state, squads);
  for (const c of Object.values(state.clubs)) {
    const squad = squads.get(c.id) ?? [];
    c.finance = openFinance(seasonRevenue(state, c, squad));
    signSquad(state, c, squad);
  }
  settleClubSystems(state, squads);

  const club = state.clubs[options.clubId]!;
  const league = state.leagues.find((l) => l.id === club.leagueId)!;
  post(
    state,
    "welcome",
    `Bienvenue à ${club.name}`,
    `${options.managerName} prend les commandes de ${club.name} (${league.name}) pour la saison ` +
      `${state.season.label}. Premier match le ${firstMatchOf(state, club.id)}.`,
  );
  state.board = newBoard(state);
  seasonMeeting(state);
  return state;
}

export const firstMatchOf = (state: CareerState, clubId: string) =>
  state.fixtures.find((f) => f.homeClubId === clubId || f.awayClubId === clubId)?.date ?? "-";
