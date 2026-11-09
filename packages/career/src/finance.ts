/**
 * Club money. Packs have no real budgets, so revenue is derived from the squad's value and the
 * division; the wage bill takes about 60 % of it, as in most professional leagues.
 */
import { createRng, deriveSeed } from "@fmo/engine";
import { ageOn, daysBetween, addDays } from "./calendar.ts";
import { contractYears, seasonsAfter, shareWages, valueOf } from "./people.ts";
import { post } from "./state.ts";
import type { CareerClub, CareerPlayer, CareerState, ClubFinance } from "./types.ts";

/** Share of revenue a club spends on wages. */
const WAGE_SHARE = 0.6;
/** Running costs besides wages (staff, facilities, travel), as a share of revenue. */
const OPERATING_SHARE = 0.37;
/** Wage cut written into contracts when a club goes down. */
export const RELEGATION_WAGE_CUT = 0.3;
/** Revenue every club of a division gets whatever its squad (TV rights, mostly). */
const DIVISION_BASE: Record<1 | 2, number> = { 1: 40_000_000, 2: 6_000_000 };
export const WAGE_FLOOR: Record<1 | 2, number> = { 1: 3_000, 2: 800 };

const tierOf = (state: CareerState, club: CareerClub) =>
  state.leagues.find((l) => l.id === club.leagueId)?.tier ?? 1;

export function seasonRevenue(state: CareerState, club: CareerClub, squad: CareerPlayer[]): number {
  const value = squad.reduce((s, p) => s + valueOf(p, state.date), 0);
  return Math.round(0.45 * value + DIVISION_BASE[tierOf(state, club)]);
}

/** Budgets the board grants for a season, from revenue and the cash in hand. */
export function budgets(revenue: number, balance: number) {
  return {
    wageBudget: Math.round((revenue * WAGE_SHARE) / 52),
    transferBudget: Math.max(0, Math.round(revenue * 0.1 + balance * 0.5)),
  };
}

export function openFinance(revenue: number): ClubFinance {
  const balance = Math.round(revenue * 0.15);
  return { balance, revenue, ...budgets(revenue, balance), income: 0, wages: 0, transfers: 0 };
}

/** First contracts: wages shared by value within the wage bill, lengths by age. */
export function signSquad(state: CareerState, club: CareerClub, squad: CareerPlayer[]) {
  const tier = tierOf(state, club);
  const wages = shareWages(squad, club.finance.wageBudget, state.date, WAGE_FLOOR[tier]);
  squad.forEach((p, i) => {
    const rng = createRng(deriveSeed(state.seed, "contract", p.id));
    const years = contractYears(ageOn(p.birthDate, state.date), rng);
    p.contract = { wage: wages[i]!, until: seasonsAfter(state.season.start, years - 1) };
  });
}

export const weeklyWages = (squad: CareerPlayer[]) =>
  squad.reduce((s, p) => s + (p.contract?.wage ?? 0), 0);

/** Settles every seven days: a week of revenue in, a week of wages out. */
export function settleWeeks(state: CareerState, squads: Map<string, CareerPlayer[]>) {
  while (daysBetween(state.payday, state.date) >= 7) {
    state.payday = addDays(state.payday, 7);
    for (const club of Object.values(state.clubs)) {
      const f = club.finance;
      const income = Math.round(f.revenue / 52);
      const wages = weeklyWages(squads.get(club.id) ?? []);
      const costs = Math.round((f.revenue * OPERATING_SHARE) / 52);
      f.income += income;
      f.wages += wages;
      f.balance += income - wages - costs;
    }
    const mine = state.clubs[state.manager.clubId]!.finance;
    if (mine.balance < 0 && mine.balance + mine.revenue / 52 > 0) {
      post(state, "finance", "Compte dans le rouge", "La trésorerie du club est passée sous zéro.");
    }
  }
}
