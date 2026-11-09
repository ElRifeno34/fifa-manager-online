/** Conversation plumbing shared by players, the assistant and the board. */
import { createRng, deriveSeed } from "@fmo/engine";
import type {
  CareerPlayer,
  CareerState,
  Conversation,
  ConversationChoice,
  ConversationTopic,
  Speaker,
} from "./types.ts";

export function openConversation(
  state: CareerState,
  options: {
    with: Conversation["with"];
    topic: ConversationTopic;
    playerId?: string | null;
    lines: [Speaker, string][];
    choices: ConversationChoice[];
    data?: Conversation["data"];
    /** Inbox title; the conversation is not announced without one. */
    title?: string;
  },
): Conversation {
  const conversation: Conversation = {
    id: state.nextId++,
    date: state.date,
    with: options.with,
    playerId: options.playerId ?? null,
    topic: options.topic,
    lines: options.lines.map(([speaker, text]) => ({ speaker, text })),
    choices: options.choices,
    status: options.choices.length ? "open" : "closed",
    data: options.data ?? {},
  };
  state.conversations.push(conversation);
  if (options.title) {
    state.inbox.push({
      id: state.nextId++,
      date: state.date,
      kind: "conversation",
      title: options.title,
      body: conversation.lines[0]?.text ?? "",
      read: false,
      conversationId: conversation.id,
    });
  }
  return conversation;
}

export function say(c: Conversation, speaker: Speaker, text: string) {
  c.lines.push({ speaker, text });
}

export function close(c: Conversation) {
  c.choices = [];
  c.status = "closed";
}

/** Conversations waiting for the manager's answer. */
export const pending = (state: CareerState) =>
  state.conversations.filter((c) => c.status === "open");

/** One of several phrasings, the same each time for a given conversation. */
export function pick(state: CareerState, key: string | number, options: string[]): string {
  const rng = createRng(deriveSeed(state.seed, "line", key));
  return options[rng.int(0, options.length - 1)]!;
}

export type Voice = "blunt" | "calm" | "plain";

/** How a player speaks: a short temper makes him blunt, a calm one polite. */
export const voiceOf = (p: CareerPlayer): Voice =>
  p.personality.temperament >= 14 ? "blunt" : p.personality.temperament <= 7 ? "calm" : "plain";

export const first = (p: CareerPlayer) => p.name.split(" ")[0] ?? p.name;

export const clampMorale = (x: number) => Math.max(0, Math.min(100, x));
