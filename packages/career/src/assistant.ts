/**
 * The assistant's advice, read from the data: the opponent, tired or unavailable players, the
 * training plan, prospects, players worth selling and contracts running out.
 */
import { squadStrength } from "@fmo/engine";
import { isAvailable } from "./availability.ts";
import { ageOn } from "./calendar.ts";
import { valueOf } from "./people.ts";
import { leagueTable, nextUserFixture } from "./play.ts";
import { conditionOf, post, squadOf, toEngine } from "./state.ts";
import { close, openConversation, say } from "./talk.ts";
import { suggestTraining } from "./training.ts";
import { money } from "./transfers.ts";
import type { CareerState, Conversation } from "./types.ts";

const THEMES: Record<string, string> = {
  physical: "physique",
  technical: "technique",
  tactical: "tactique",
  setPieces: "coups de pied arrêtés",
  recovery: "récupération",
};
const INTENSITIES: Record<string, string> = { light: "légère", normal: "normale", high: "forte" };

/** What the assistant says before the next match. */
export function preMatchAdvice(state: CareerState): string[] {
  const fixture = nextUserFixture(state);
  if (!fixture) return [];
  const mine = state.manager.clubId;
  const opponentId = fixture.homeClubId === mine ? fixture.awayClubId : fixture.homeClubId;
  const opponent = state.clubs[opponentId]!;
  const ours = squadStrength(squadOf(state, mine).map(toEngine));
  const theirs = squadStrength(squadOf(state, opponentId).map(toEngine));
  const table = leagueTable(state, opponent.leagueId);
  const row = table.findIndex((l) => l.clubId === opponentId);
  const standing = row >= 0 && table[row]!.played > 0 ? ` (${row + 1}e)` : "";
  const lines = [
    `Prochain match : ${opponent.name}${standing}, ${fixture.homeClubId === mine ? "à domicile" : "à l'extérieur"}.`,
  ];
  const gap = theirs - ours;
  if (gap >= 4)
    lines.push("Ils sont nettement plus forts : un bloc bas et des contres me semblent plus sûrs.");
  else if (gap <= -4)
    lines.push("Nous sommes au-dessus : on peut prendre le jeu à notre compte et presser haut.");
  else lines.push("Le match s'annonce équilibré : la fraîcheur peut faire la différence.");
  const tired = squadOf(state, mine)
    .filter((p) => conditionOf(p, fixture.date).fatigue >= 35)
    .map((p) => p.name);
  if (tired.length)
    lines.push(`Fatigués : ${tired.slice(0, 4).join(", ")}. Je les ferais souffler.`);
  const out = squadOf(state, mine).filter((p) => !isAvailable(p, fixture.date));
  if (out.length) lines.push(`Indisponibles : ${out.map((p) => p.name).join(", ")}.`);
  return lines;
}

/** Posts the pre-match advice in the inbox, once per match. */
export function postPreMatchAdvice(state: CareerState) {
  const fixture = nextUserFixture(state);
  if (!fixture || fixture.date !== state.date) return;
  if (state.inbox.some((m) => m.kind === "advice" && m.date === state.date)) return;
  const lines = preMatchAdvice(state);
  if (lines.length) post(state, "advice", "Conseils d'avant-match", lines.join(" "));
}

/** A talk with the assistant: his reading of the squad and his training plan. */
export function askAssistant(state: CareerState): Conversation {
  const mine = state.manager.clubId;
  const squad = squadOf(state, mine);
  const plan = suggestTraining(state, mine, squad);
  const lines: string[] = [...preMatchAdvice(state)];
  lines.push(
    `Pour l'entraînement, je propose une semaine ${THEMES[plan.theme]} en intensité ${INTENSITIES[plan.intensity]}.`,
  );
  const prospects = squad
    .filter((p) => ageOn(p.birthDate, state.date) <= 21 && p.potential - p.overall >= 10)
    .sort((a, b) => b.potential - a.potential)
    .slice(0, 2);
  if (prospects.length) {
    lines.push(
      `À suivre : ${prospects.map((p) => `${p.name} (${Math.round(p.overall)})`).join(", ")}, ils ont une belle marge.`,
    );
  }
  const sellable = squad
    .filter((p) => ageOn(p.birthDate, state.date) >= 30 && (p.contract?.wage ?? 0) > 0)
    .sort((a, b) => (b.contract?.wage ?? 0) - (a.contract?.wage ?? 0))
    .slice(0, 2);
  if (sellable.length) {
    lines.push(
      `À vendre tant qu'ils ont de la valeur : ${sellable.map((p) => `${p.name} (${money(valueOf(p, state.date))})`).join(", ")}.`,
    );
  }
  const ending = squad.filter((p) => p.contract?.until === state.season.label).map((p) => p.name);
  if (ending.length) lines.push(`Contrats qui se terminent : ${ending.join(", ")}.`);
  return openConversation(state, {
    with: "assistant",
    topic: "advice",
    lines: lines.map((text) => ["assistant", text] as ["assistant", string]),
    choices: [
      { id: "delegate", label: "Te laisser gérer l'entraînement" },
      { id: "follow", label: "Appliquer ce plan cette semaine et les suivantes" },
      { id: "thanks", label: "Merci, je m'en occupe" },
    ],
    data: { intensity: plan.intensity, theme: plan.theme },
  });
}

export function answerAssistant(state: CareerState, c: Conversation, choice: string) {
  if (choice === "delegate") {
    state.training = null;
    say(c, "assistant", "Entendu, je m'occupe des séances chaque semaine.");
  } else if (choice === "follow") {
    state.training = {
      intensity: c.data.intensity as "light" | "normal" | "high",
      theme: c.data.theme as "physical" | "technical" | "tactical" | "setPieces" | "recovery",
    };
    say(c, "assistant", "C'est noté, on garde ce programme.");
  } else say(c, "assistant", "Très bien, coach.");
  close(c);
}
