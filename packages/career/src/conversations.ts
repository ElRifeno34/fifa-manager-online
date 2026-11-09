/** Answering conversations, and the weekly round of players asking to talk. */
import { answerAssistant } from "./assistant.ts";
import { answerBoard } from "./board.ts";
import { addDays, daysBetween } from "./calendar.ts";
import { answerPlayer, playerRequests } from "./player-talk.ts";
import { pending } from "./talk.ts";
import type { CareerState, Conversation } from "./types.ts";

/** The manager's answer to a conversation. */
export function reply(state: CareerState, conversationId: number, choiceId: string): Conversation {
  const c = state.conversations.find((x) => x.id === conversationId);
  if (!c || c.status !== "open") throw new Error("No such open conversation");
  if (!c.choices.some((x) => x.id === choiceId))
    throw new Error(`Not a possible answer: ${choiceId}`);
  if (c.with === "player") answerPlayer(state, c, choiceId);
  else if (c.with === "board") answerBoard(state, c, choiceId);
  else answerAssistant(state, c, choiceId);
  for (const m of state.inbox) if (m.conversationId === c.id) m.read = true;
  return c;
}

/** What the assistant answers when the manager lets him run things (quick simulation). */
const DEFAULT_ANSWER: Partial<Record<Conversation["topic"], string>> = {
  playingTime: "explain",
  contract: "later",
  transferRequest: "refuse",
  brokenPromise: "apologise",
  blockedMove: "firm",
  advice: "thanks",
  seasonObjective: "accept",
  warning: "confident",
  jobOffer: "stay",
};

export function autoReply(state: CareerState) {
  for (const c of pending(state)) {
    const answer = DEFAULT_ANSWER[c.topic] ?? c.choices[0]!.id;
    reply(state, c.id, answer);
  }
}

/** Weekly: at most one player of the squad comes to talk. */
export function weeklyTalks(state: CareerState) {
  while (daysBetween(state.talkDay, state.date) >= 7) {
    state.talkDay = addDays(state.talkDay, 7);
    playerRequests(state);
  }
}
