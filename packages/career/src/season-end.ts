/**
 * End of a season: final tables, promotion and relegation, players' progression and ageing,
 * retirements, youth intake, and the next season's calendar.
 */
import { deriveAttributes } from "@fmo/data";
import { createRng, deriveSeed, squadStrength, type Position, type Rng } from "@fmo/engine";
import { addDays, ageOn, daysBetween, nextSeasonStart, seasonLabel } from "./calendar.ts";
import { poolFor } from "./names.ts";
import { leagueTable } from "./play.ts";
import {
  budgets,
  investSurplus,
  payPrizes,
  RELEGATION_WAGE_CUT,
  seasonRevenue,
  WAGE_FLOOR,
} from "./finance.ts";
import {
  careerAge,
  contractYears,
  estimateValue,
  initialMorale,
  personalityFor,
  rolesOf,
  seasonsAfter,
} from "./people.ts";
import { clubsOf, indexSquads, newSeasonStats, post, squadOf, toEngine } from "./state.ts";
import { seasonMeeting, seasonReview } from "./board.ts";
import { leagueCalendar } from "./world.ts";
import { refreshLevelAdjustments, round3 } from "./strength.ts";
import { settleClubSystems } from "./training.ts";
import type { Attributes } from "@fmo/engine";
import type { CareerPlayer, CareerState, SeasonRecord } from "./types.ts";

/** A squad below this gets extra youth players, until transfers can fill it. */
const MIN_SQUAD = 20;
/** Above this, a club lets its least useful players go (they leave the game until transfers). */
const MAX_SQUAD = 30;
/** Share of a club's form kept from one season to the next. */
const FORM_KEPT = 0.5;

export function endSeason(state: CareerState) {
  const rng = createRng(deriveSeed(state.seed, "season-end", state.season.label));
  const records = closeTables(state);
  moveClubs(state, records);
  seasonReview(state, records);
  payPrizes(state, records);
  state.promises = [];
  state.history.push(...records);
  archivePlayers(state);

  const lastMatch =
    state.fixtures
      .map((f) => f.date)
      .sort()
      .at(-1) ?? state.date;
  const start = nextSeasonStart(state.season.start, lastMatch);
  const progress = develop(state, start, rng);
  const retired = retire(state, start, rng);
  const contracts = renewContracts(state, start, rng);
  const youth = intake(state, start, rng);
  const released = release(state, start);
  /* Form fades; the structural part follows the new squads and divisions (see strength.ts). */
  for (const club of Object.values(state.clubs)) {
    club.formAdjustment = round3(club.formAdjustment * FORM_KEPT);
  }

  state.season = { label: seasonLabel(start), index: state.season.index + 1, start };
  state.fixtures = [];
  for (const league of state.leagues) {
    for (const f of leagueCalendar(clubsOf(state, league.id), start)) {
      state.fixtures.push({
        id: state.nextId++,
        leagueId: league.id,
        round: f.round,
        date: f.date,
        time: null,
        homeClubId: f.homeClubId,
        awayClubId: f.awayClubId,
        result: null,
      });
    }
  }
  state.fixtures.sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  state.date = addDays(start, -14);
  state.payday = state.date;
  for (const p of Object.values(state.players)) {
    p.fatigue = 0;
    p.fatigueDate = null;
    p.ratings = [];
    p.morale = Math.round(60 + (p.morale - 60) * 0.5);
    if (!p.retired) p.marketValueEur = estimateValue(p.overall, ageOn(p.birthDate, start));
  }
  /* New budgets: revenue follows the squad's value and the division the club now plays in. */
  const squads = indexSquads(state);
  refreshLevelAdjustments(state, squads);
  investSurplus(state);
  for (const club of Object.values(state.clubs)) {
    const f = club.finance;
    f.revenue = seasonRevenue(state, club, squads.get(club.id) ?? []);
    Object.assign(f, budgets(f.revenue, f.balance), { income: 0, wages: 0, transfers: 0 });
  }
  state.trainingDay = addDays(state.date, -4);
  state.marketDay = addDays(state.date, -6);
  /* Old talks only matter for the cooling-off period. */
  state.negotiations = state.negotiations.filter((n) => daysBetween(n.opened, state.date) < 60);
  state.offers = state.offers.filter((o) => o.status === "open");
  state.conversations = state.conversations.filter(
    (c) => c.status === "open" || daysBetween(c.date, state.date) < 120,
  );
  state.talkDay = state.date;
  state.board.lastReview = state.date;
  settleClubSystems(state, squads);
  report(state, records, progress, retired, youth, released, contracts);
  /* A sacked manager meets his new board when he takes the job. */
  if (!state.conversations.some((c) => c.topic === "sacked" && c.status === "open")) {
    seasonMeeting(state);
  }
}

/**
 * Contracts ending this season: clubs keep the players they need (the eleven best up to 34, the
 * twenty-two best up to 31) on a raise; the others leave as free agents. Until negotiation comes,
 * the assistant decides for the manager's club the same way.
 */
function renewContracts(state: CareerState, start: string, rng: Rng) {
  const renewed: CareerPlayer[] = [];
  const left: CareerPlayer[] = [];
  for (const club of Object.values(state.clubs)) {
    const squad = squadOf(state, club.id);
    const rank = new Map([...squad].sort((a, b) => b.overall - a.overall).map((p, i) => [p.id, i]));
    for (const p of squad) {
      if (p.contract?.until !== state.season.label) continue;
      const age = ageOn(p.birthDate, start);
      const r = rank.get(p.id)!;
      /* The manager negotiates his own renewals; whoever he did not extend leaves. */
      const manager = club.id === state.manager.clubId;
      if (!manager && ((r < 22 && age <= 31) || (r < 11 && age <= 34))) {
        const years = contractYears(age, rng);
        p.contract = {
          wage: Math.round((p.contract.wage * 1.08) / 100) * 100,
          until: seasonsAfter(start, years - 1),
        };
        renewed.push(p);
      } else {
        p.clubId = null;
        p.contract = null;
        p.number = null;
        left.push(p);
      }
    }
  }
  return { renewed, left };
}

function closeTables(state: CareerState): SeasonRecord[] {
  return state.leagues.map((league) => ({
    season: state.season.label,
    leagueId: league.id,
    table: leagueTable(state, league.id),
    promoted: [],
    relegated: [],
  }));
}

function moveClubs(state: CareerState, records: SeasonRecord[]) {
  for (const link of state.links) {
    const upper = records.find((r) => r.leagueId === link.upper)!;
    const lower = records.find((r) => r.leagueId === link.lower)!;
    const down = upper.table.slice(-link.places).map((l) => l.clubId);
    const up = lower.table.slice(0, link.places).map((l) => l.clubId);
    for (const id of down) {
      state.clubs[id]!.leagueId = link.lower;
      for (const p of squadOf(state, id)) {
        if (p.contract) {
          p.contract.wage = Math.round((p.contract.wage * (1 - RELEGATION_WAGE_CUT)) / 100) * 100;
        }
      }
    }
    for (const id of up) state.clubs[id]!.leagueId = link.upper;
    upper.relegated = down;
    lower.promoted = up;
  }
}

function archivePlayers(state: CareerState) {
  for (const p of Object.values(state.players)) {
    if (p.clubId && p.season.apps > 0) {
      p.history.push({
        season: state.season.label,
        clubId: p.clubId,
        leagueId: state.clubs[p.clubId]!.leagueId,
        ...p.season,
      });
    }
    p.season = newSeasonStats();
  }
}

const PHYSICAL: (keyof Attributes)[] = ["pace", "stamina", "strength"];
const MENTAL: (keyof Attributes)[] = ["vision", "positioning", "composure"];

/**
 * Young players grow towards their potential, faster when they play; players in their prime hold;
 * from 30, they decline, pace and stamina first, the mental side last.
 */
function develop(state: CareerState, start: string, rng: Rng) {
  const changes: { id: string; delta: number }[] = [];
  /* League fixtures divided by the number of clubs gives matches per club in a single round.
   * A double round-robin naturally yields twice that value. */
  const rounds = new Map(
    state.leagues.map((l) => [
      l.id,
      state.fixtures.filter((f) => f.leagueId === l.id).length /
        Math.max(clubsOf(state, l.id).length, 1),
    ]),
  );
  for (const p of Object.values(state.players)) {
    if (!p.clubId) continue;
    const age = careerAge(p, ageOn(p.birthDate, start));
    const last = p.history.at(-1);
    const share = last ? Math.min(1, last.minutes / ((rounds.get(last.leagueId) ?? 34) * 90)) : 0;
    const noise = (rng.next() * 2 - 1) * 1.5;
    const room = Math.max(0, p.potential - p.overall);
    let delta: number;
    /* Weekly training does most of the growing now; the summer adds what playing brings. */
    if (age <= 23) delta = room * (0.1 + 0.2 * share) + noise;
    else if (age <= 29) delta = room * 0.12 * share + noise * 0.8;
    else delta = -(age - 29) * 0.7 + noise * 0.8;
    delta = Math.round(Math.max(-8, Math.min(8, delta)));
    if (delta === 0) continue;
    const before = p.overall;
    p.overall = Math.max(30, Math.min(94, p.overall + delta));
    const applied = p.overall - before;
    for (const key of Object.keys(p.attributes) as (keyof Attributes)[]) {
      const weight =
        applied < 0 ? (PHYSICAL.includes(key) ? 1.6 : MENTAL.includes(key) ? 0.5 : 1) : 1;
      p.attributes[key] = Math.max(1, Math.min(20, p.attributes[key] + (applied / 5) * weight));
    }
    p.potential = Math.max(p.potential, p.overall);
    changes.push({ id: p.id, delta: applied });
  }
  return changes;
}

function retire(state: CareerState, start: string, rng: Rng): CareerPlayer[] {
  const retired: CareerPlayer[] = [];
  for (const p of Object.values(state.players)) {
    if (p.retired) continue;
    const age = careerAge(p, ageOn(p.birthDate, start));
    /* Free agents nobody signed stop sooner. */
    const chance = !p.clubId
      ? age >= 29
        ? 0.6
        : 0.3
      : age >= 40
        ? 1
        : age >= 34
          ? 0.25 + (age - 34) * 0.2
          : age >= 33 && p.overall < 60
            ? 0.4
            : 0;
    if (chance > 0 && rng.chance(chance)) {
      if (p.clubId) retired.push(p);
      p.clubId = null;
      p.number = null;
      p.contract = null;
      p.retired = true;
    }
  }
  return retired;
}

const YOUTH_POSITIONS: Position[] = [
  "GB",
  "DC",
  "DC",
  "DG",
  "DD",
  "MDC",
  "MC",
  "MC",
  "MOC",
  "MG",
  "MD",
  "AG",
  "AD",
  "BU",
  "BU",
];

/** Two to four academy graduates a season, and more when a squad runs short. */
function intake(state: CareerState, start: string, rng: Rng): CareerPlayer[] {
  const created: CareerPlayer[] = [];
  for (const club of Object.values(state.clubs)) {
    const league = state.leagues.find((l) => l.id === club.leagueId)!;
    const pool = poolFor(league.country);
    const squad = squadOf(state, club.id);
    const strength = squadStrength(squad.map(toEngine));
    const count = Math.max(rng.int(2, 4), MIN_SQUAD - squad.length);
    const used = new Set(squad.map((p) => p.number));
    for (let i = 0; i < count; i++) {
      const id = `gen-${state.nextId++}`;
      const position = rng.pick(YOUTH_POSITIONS);
      const age = rng.int(16, 17);
      const overall = Math.round(Math.max(38, Math.min(64, strength * 0.62 + rng.next() * 8)));
      const potential = Math.min(
        92,
        Math.round(overall + 8 + rng.next() * (12 + club.reputation * 2)),
      );
      let number = 30;
      while (used.has(number) && number < 99) number++;
      used.add(number);
      const player: CareerPlayer = {
        id,
        name: `${rng.pick(pool.first)} ${rng.pick(pool.last)}`,
        nationality: pool.nationality,
        birthDate: addDays(`${Number(start.slice(0, 4)) - age}${start.slice(4)}`, -rng.int(0, 364)),
        foot: rng.chance(0.25) ? "left" : "right",
        heightCm: rng.int(168, 192),
        number,
        position,
        secondaryPositions: [],
        overall,
        potential,
        attributes: deriveAttributes({
          id,
          position,
          overall,
          age,
          heightCm: null,
          performance: null,
        }),
        marketValueEur: null,
        clubId: club.id,
        retired: false,
        contract: {
          wage: WAGE_FLOOR[league.tier],
          until: seasonsAfter(start, 2),
        },
        personality: personalityFor(state.seed, id),
        morale: initialMorale(state.seed, id),
        injury: null,
        suspension: 0,
        trainingFocus: null,
        listed: false,
        generated: true,
        fatigue: 0,
        fatigueDate: null,
        ratings: [],
        season: newSeasonStats(),
        history: [],
      };
      state.players[id] = player;
      created.push(player);
    }
  }
  return created;
}

/** Squads above the limit let go of their least useful players, keeping the best prospects. */
function release(state: CareerState, start: string): CareerPlayer[] {
  const released: CareerPlayer[] = [];
  for (const club of Object.values(state.clubs)) {
    /* The manager chooses whom to let go. */
    if (club.id === state.manager.clubId) continue;
    const squad = squadOf(state, club.id);
    if (squad.length <= MAX_SQUAD) continue;
    const worth = (p: CareerPlayer) =>
      p.overall + (ageOn(p.birthDate, start) <= 21 ? (p.potential - p.overall) * 0.5 : 0);
    const keepers = squad.filter((p) => p.position === "GB").sort((a, b) => worth(b) - worth(a));
    const protectedIds = new Set(keepers.slice(0, 2).map((p) => p.id));
    const candidates = squad
      .filter((p) => !protectedIds.has(p.id))
      .sort((a, b) => worth(a) - worth(b))
      .slice(0, squad.length - MAX_SQUAD);
    for (const p of candidates) {
      p.clubId = null;
      p.number = null;
      p.contract = null;
      released.push(p);
    }
  }
  return released;
}

function report(
  state: CareerState,
  records: SeasonRecord[],
  progress: { id: string; delta: number }[],
  retired: CareerPlayer[],
  youth: CareerPlayer[],
  released: CareerPlayer[],
  contracts: { renewed: CareerPlayer[]; left: CareerPlayer[] },
) {
  const clubId = state.manager.clubId;
  const name = (id: string) => state.clubs[id]!.name;
  const previous = records.find((r) => r.table.some((l) => l.clubId === clubId))!;
  const position = previous.table.findIndex((l) => l.clubId === clubId) + 1;
  const league = state.leagues.find((l) => l.id === previous.leagueId)!;
  post(
    state,
    "season",
    `Saison ${previous.season} terminée : ${position}e de ${league.name}`,
    `${name(previous.table[0]!.clubId)} est champion avec ${previous.table[0]!.points} points. ` +
      `Nous finissons ${position}e avec ${previous.table[position - 1]!.points} points.`,
  );
  for (const r of records) {
    if (r.promoted.includes(clubId)) {
      post(state, "promotion", "Montée !", `${name(clubId)} jouera en division supérieure.`);
    }
    if (r.relegated.includes(clubId)) {
      post(state, "relegation", "Relégation", `${name(clubId)} descend en division inférieure.`);
    }
  }
  const mine = (id: string) => state.players[id]!.clubId === clubId;
  const best = progress.filter((c) => mine(c.id)).sort((a, b) => b.delta - a.delta);
  if (best.length) {
    const label = (c: { id: string; delta: number }) =>
      `${state.players[c.id]!.name} (${c.delta > 0 ? "+" : ""}${c.delta})`;
    post(
      state,
      "progression",
      "Évolution de l'effectif",
      `Progrès : ${best.slice(0, 3).map(label).join(", ")}. ` +
        `En baisse : ${
          best
            .slice(-3)
            .reverse()
            .filter((c) => c.delta < 0)
            .map(label)
            .join(", ") || "personne"
        }.`,
    );
  }
  const ours = retired.filter((p) => p.history.at(-1)?.clubId === clubId);
  if (ours.length) {
    post(
      state,
      "retirement",
      "Fins de carrière",
      ours.map((p) => p.name).join(", ") + " prennent leur retraite.",
    );
  }
  const leaving = released.filter((p) => p.history.at(-1)?.clubId === clubId || p.generated);
  const ourReleases = leaving.filter((p) => !p.generated || p.history.length > 0);
  if (ourReleases.length && released.some((p) => ourReleases.includes(p))) {
    const names = released.filter((p) => p.history.at(-1)?.clubId === clubId).map((p) => p.name);
    if (names.length) {
      post(
        state,
        "retirement",
        "Départs en fin de saison",
        `${names.join(", ")} quittent le club.`,
      );
    }
  }
  const renewedHere = contracts.renewed.filter((p) => p.clubId === clubId);
  const leftHere = contracts.left.filter((p) => p.history.at(-1)?.clubId === clubId);
  if (renewedHere.length || leftHere.length) {
    post(
      state,
      "contract",
      "Contrats en fin de saison",
      `Prolongés : ${renewedHere.map((p) => p.name).join(", ") || "personne"}. ` +
        `Partis libres : ${leftHere.map((p) => p.name).join(", ") || "personne"}.`,
    );
  }
  const academy = youth.filter((p) => p.clubId === clubId);
  if (academy.length) {
    post(
      state,
      "youth",
      "Nouveaux jeunes au centre de formation",
      academy.map((p) => `${p.name} (${p.position}, ${p.overall})`).join(", "),
    );
  }
}
