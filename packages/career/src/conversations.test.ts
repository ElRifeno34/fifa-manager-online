import { describe, expect, it } from "vitest";
import {
  addDays,
  advance,
  answerOffer,
  askAssistant,
  moveTo,
  objectiveFor,
  pending,
  playToday,
  reply,
  simulateToSeasonEnd,
  squadOf,
  talkToPlayer,
} from "./index.ts";
import { makePromise, reviewPromises } from "./player-talk.ts";
import { career, freshCareer } from "./test-world.ts";
import { seasonReview } from "./board.ts";
import type { CareerState } from "./types.ts";

const open = (state: CareerState, topic: string) => pending(state).find((c) => c.topic === topic)!;

describe("board", () => {
  it("opens the career with an objective meeting that stops the calendar", () => {
    const state = freshCareer();
    const meeting = open(state, "seasonObjective");
    expect(meeting.lines[0]!.text).toMatch(/place ou mieux/);
    expect(advance(state).stop).toBe("conversation");
    reply(state, meeting.id, "accept");
    expect(advance(state).stop).not.toBe("conversation");
  });

  it("sets objectives from the squad's standing", () => {
    const state = career();
    const top = ["a", "b", "c", "d"].map((id) => objectiveFor(state, id).kind);
    const second = ["e", "f", "g", "h"].map((id) => objectiveFor(state, id).kind);
    expect(top.filter((k) => k === "title")).toHaveLength(1);
    expect(second.filter((k) => k === "promotion")).toHaveLength(3);
  });

  it("grants more budget only once, and only with the board's trust", () => {
    const state = freshCareer();
    const budget = state.clubs.a!.finance.transferBudget;
    reply(state, open(state, "seasonObjective").id, "budget");
    expect(state.clubs.a!.finance.transferBudget).toBeGreaterThan(budget);
    expect(state.board.budgetAsked).toBe(true);
  });

  it("sacks a failing manager, who then takes one of the offers", () => {
    const state = career();
    simulateToSeasonEnd(state);
    state.board.confidence = 0;
    const records = state.history.slice(-2);
    seasonReview(state, records);
    const sacked = open(state, "sacked");
    expect(sacked.choices.length).toBeGreaterThan(0);
    const club = sacked.choices[0]!.id;
    reply(state, sacked.id, club);
    expect(state.manager.clubId).toBe(club);
    expect(state.board.confidence).toBe(55);
  });
});

describe("players", () => {
  it("praise lifts morale, unfair criticism hurts it", () => {
    const state = career();
    const p = squadOf(state, "a")[4]!;
    p.morale = 60;
    p.ratings = [7.5, 7.2, 7.4];
    talkToPlayer(state, p.id, "praise");
    expect(p.morale).toBe(66);
    talkToPlayer(state, p.id, "criticism");
    expect(p.morale).toBe(56);
  });

  it("a frustrated substitute asks for playing time, and a promise is judged later", () => {
    const state = career();
    const sub = squadOf(state, "a").sort((a, b) => a.overall - b.overall)[12]!;
    sub.personality.ambition = 16;
    sub.morale = 30;
    state.date = addDays(state.season.start, 40);
    moveTo(state, addDays(state.date, 8));
    const talk = pending(state).find(
      (c) => c.topic === "playingTime" || c.topic === "transferRequest",
    );
    expect(talk).toBeDefined();

    const p = squadOf(state, "a")[10]!;
    makePromise(state, p, "key");
    /* Eight club matches later he has started none. */
    state.promises.at(-1)!.matches0 -= 8;
    const before = p.morale;
    reviewPromises(state);
    expect(p.morale).toBe(Math.max(0, before - 20));
    expect(open(state, "brokenPromise").playerId).toBe(p.id);
  });

  it("a transfer request answered by listing puts him on the market cheaper", () => {
    const state = career();
    const p = squadOf(state, "a")[2]!;
    p.morale = 10;
    p.personality.ambition = 18;
    state.date = addDays(state.season.start, 40);
    moveTo(state, addDays(state.date, 8));
    const request = open(state, "transferRequest");
    expect(request.playerId).toBe(p.id);
    reply(state, request.id, "list");
    expect(p.listed).toBe(true);
  });

  it("refusing a bid from a bigger club upsets an ambitious player", () => {
    const state = career();
    const p = squadOf(state, "a")[3]!;
    p.personality.ambition = 17;
    state.clubs.d!.reputation = 5;
    state.clubs.a!.reputation = 2;
    const id = state.nextId++;
    state.offers.push({
      id,
      date: state.date,
      buyerId: "d",
      playerId: p.id,
      fee: 1e6,
      limit: 2e6,
      round: 0,
      status: "open",
    });
    const morale = p.morale;
    answerOffer(state, id, "reject");
    expect(p.morale).toBeLessThan(morale);
    expect(open(state, "blockedMove").playerId).toBe(p.id);
  });
});

describe("assistant", () => {
  it("reads the next match, proposes a plan and can take over training", () => {
    const state = career();
    advance(state);
    const talk = askAssistant(state);
    expect(talk.lines.some((l) => l.text.startsWith("Prochain match"))).toBe(true);
    reply(state, talk.id, "follow");
    expect(state.training).not.toBeNull();
    reply(state, askAssistant(state).id, "delegate");
    expect(state.training).toBeNull();
    expect(state.inbox.some((m) => m.kind === "advice")).toBe(true);
    playToday(state);
  });
});
