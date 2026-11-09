import { describe, expect, it } from "vitest";
import {
  addDays,
  answerOffer,
  askingPrice,
  isWindowOpen,
  marketWage,
  moveTo,
  offerContract,
  offerFee,
  releasePlayer,
  searchPlayers,
  simulateToSeasonEnd,
  squadOf,
  startRenewal,
  startTransfer,
  weeklyWages,
} from "./index.ts";
import { career } from "./test-world.ts";
import type { CareerState } from "./types.ts";

/** A good player of another club, and enough budget to afford him. */
function target(state: CareerState) {
  const p = squadOf(state, "d").sort((a, b) => b.overall - a.overall)[2]!;
  const club = state.clubs.a!.finance;
  club.transferBudget = askingPrice(state, p.id) * 3;
  club.wageBudget = weeklyWages(squadOf(state, "a")) + marketWage(5e7) * 2;
  return p;
}

describe("windows and prices", () => {
  it("opens in summer and mid-season only", () => {
    const state = career();
    expect(isWindowOpen(state)).toBe(true);
    state.date = addDays(state.season.start, 60);
    expect(isWindowOpen(state)).toBe(false);
    state.date = addDays(state.season.start, 150);
    expect(isWindowOpen(state)).toBe(true);
  });

  it("asks more for key players and less for expiring contracts", () => {
    const state = career();
    const squad = squadOf(state, "d").sort((a, b) => b.overall - a.overall);
    const star = squad[0]!;
    const before = askingPrice(state, star.id);
    star.contract!.until = state.season.label;
    expect(askingPrice(state, star.id)).toBeLessThan(before);
    expect(marketWage(1e8)).toBeGreaterThan(marketWage(1e6) * 20);
  });
});

describe("buying a player", () => {
  it("agrees a fee with the club, then a contract with the player", () => {
    const state = career();
    const p = target(state);
    const n = startTransfer(state, p.id);
    expect(n.stage).toBe("fee");
    const low = offerFee(state, n.id, Math.round(n.askingFee * 0.5));
    expect(low.status).toBe("countered");
    const fee = n.askingFee;
    expect(offerFee(state, n.id, fee).status).toBe("accepted");
    expect(n.stage).toBe("contract");
    const balance = state.clubs.a!.finance.balance;
    const answer = offerContract(state, n.id, { wage: n.demandWage, years: 3, promise: "regular" });
    expect(answer.status).toBe("accepted");
    expect(p.clubId).toBe("a");
    expect(p.contract!.wage).toBe(n.demandWage);
    expect(state.clubs.a!.finance.balance).toBe(balance - fee);
    expect(state.transfers.at(-1)).toMatchObject({ playerId: p.id, fromId: "d", toId: "a", fee });
    expect(state.promises.at(-1)).toMatchObject({ playerId: p.id, role: "regular" });
  });

  it("meets halfway, then breaks off after three rounds", () => {
    const state = career();
    const p = target(state);
    const n = startTransfer(state, p.id);
    const asked = n.askingFee;
    const first = offerFee(state, n.id, Math.round(asked * 0.8));
    expect(first).toMatchObject({ status: "countered" });
    expect((first as { counter: number }).counter).toBeLessThan(asked);
    offerFee(state, n.id, Math.round(asked * 0.8));
    expect(offerFee(state, n.id, Math.round(asked * 0.8)).status).toBe("rejected");
    expect(n.stage).toBe("failed");
    expect(() => startTransfer(state, p.id)).toThrow(/recently/);
  });

  it("keeps to the board's budgets and the windows", () => {
    const state = career();
    const p = target(state);
    state.clubs.a!.finance.transferBudget = 0;
    const n = startTransfer(state, p.id);
    expect(offerFee(state, n.id, n.askingFee).status).toBe("rejected");
    state.date = addDays(state.season.start, 60);
    expect(() => startTransfer(state, squadOf(state, "c")[3]!.id)).toThrow(/closed/);
  });

  it("signs a free agent at any time", () => {
    const state = career();
    const p = squadOf(state, "e")[5]!;
    p.clubId = null;
    p.contract = null;
    state.date = addDays(state.season.start, 60);
    state.clubs.a!.finance.wageBudget += 1e6;
    const n = startTransfer(state, p.id);
    expect(n.stage).toBe("contract");
    expect(offerContract(state, n.id, { wage: n.demandWage, years: 2 }).status).toBe("accepted");
    expect(p.clubId).toBe("a");
  });
});

describe("own players", () => {
  it("renews a contract by negotiation", () => {
    const state = career();
    const p = squadOf(state, "a")[4]!;
    state.clubs.a!.finance.wageBudget += 1e6;
    const n = startRenewal(state, p.id);
    expect(offerContract(state, n.id, { wage: n.demandWage, years: 4 }).status).toBe("accepted");
    expect(p.contract!.until > state.season.label).toBe(true);
  });

  it("lets expiring players go unless the manager renewed them", () => {
    const state = career();
    const p = squadOf(state, "a")[6]!;
    p.contract!.until = state.season.label;
    simulateToSeasonEnd(state);
    expect(p.clubId).toBeNull();
  });

  it("releases a player against a payoff", () => {
    const state = career();
    const p = squadOf(state, "a")[7]!;
    const balance = state.clubs.a!.finance.balance;
    const cost = releasePlayer(state, p.id);
    expect(p.clubId).toBeNull();
    expect(state.clubs.a!.finance.balance).toBe(balance - cost);
  });

  it("handles bids from other clubs", () => {
    const state = career();
    const p = squadOf(state, "a")[3]!;
    const offer = {
      id: state.nextId++,
      date: state.date,
      buyerId: "c",
      playerId: p.id,
      fee: 5_000_000,
      limit: 7_000_000,
      round: 0,
      status: "open" as const,
    };
    state.offers.push(offer);
    const counter = answerOffer(state, offer.id, { counter: 9_000_000 });
    expect(counter.status).toBe("countered");
    expect(answerOffer(state, offer.id, { counter: 6_500_000 }).status).toBe("accepted");
    expect(p.clubId).toBe("c");
    expect(state.transfers.at(-1)!.fee).toBe(6_500_000);
  });
});

describe("club AI mercato", () => {
  it("buys players in the windows and keeps squads and budgets sane", () => {
    const state = career();
    for (const club of Object.values(state.clubs)) club.finance.transferBudget *= 4;
    /* A club short of forwards will shop for one. */
    for (const p of squadOf(state, "c").filter((x) => x.position === "BU")) {
      p.clubId = null;
      p.contract = null;
    }
    moveTo(state, addDays(state.date, 28));
    expect(state.transfers.some((t) => t.toId === "c")).toBe(true);
    for (const club of Object.values(state.clubs)) {
      expect(club.finance.transferBudget).toBeGreaterThanOrEqual(0);
      expect(squadOf(state, club.id).length).toBeGreaterThanOrEqual(18);
    }
  });

  it("lists the market for the manager", () => {
    const state = career();
    const list = searchPlayers(state, { position: "BU", minOverall: 60 });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((x) => x.player.position === "BU" && x.player.clubId !== "a")).toBe(true);
  });
});
