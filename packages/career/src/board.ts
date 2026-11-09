/**
 * The board: an objective each season from the squad's standing, a confidence that follows the
 * table and the accounts, warnings, the sack, and job offers from other clubs.
 */
import { createRng, deriveSeed, squadStrength } from "@fmo/engine";
import { daysBetween } from "./calendar.ts";
import { leagueTable } from "./play.ts";
import { clubsOf, squadOf, toEngine } from "./state.ts";
import { close, openConversation, say } from "./talk.ts";
import type { Board, CareerState, Conversation, ObjectiveKind, SeasonRecord } from "./types.ts";

const LABEL: Record<ObjectiveKind, string> = {
  title: "remporter le championnat",
  europe: "finir dans le top 4",
  topHalf: "finir dans la première moitié du classement",
  midTable: "assurer un milieu de tableau tranquille",
  survival: "assurer le maintien",
  promotion: "monter en division supérieure",
};

/** Rank of the manager's squad in its league, by the level of the best eleven. */
function squadRank(state: CareerState, clubId: string) {
  const league = state.clubs[clubId]!.leagueId;
  const ranked = clubsOf(state, league)
    .map((id) => ({
      id,
      level:
        squadStrength(squadOf(state, id).map(toEngine)) * (1 + state.clubs[id]!.levelAdjustment),
    }))
    .sort((a, b) => b.level - a.level);
  return { rank: ranked.findIndex((r) => r.id === clubId) + 1, size: ranked.length, league };
}

/** The board's target: what the squad's standing makes reasonable, with the position to reach. */
export function objectiveFor(state: CareerState, clubId: string): Board["objective"] {
  const { rank, size, league } = squadRank(state, clubId);
  const tier = state.leagues.find((l) => l.id === league)!.tier;
  const linked = state.links.some((l) => l.upper === league);
  const safe = linked ? size - 3 : size - 2;
  if (tier === 2) {
    if (rank <= 3) return { kind: "promotion", position: 3 };
    if (rank <= size / 2) return { kind: "topHalf", position: Math.floor(size / 2) };
    return { kind: "survival", position: size - 3 };
  }
  if (rank === 1) return { kind: "title", position: 1 };
  if (rank <= 4) return { kind: "europe", position: 4 };
  if (rank <= size / 2) return { kind: "topHalf", position: Math.floor(size / 2) };
  if (rank <= size - 5) return { kind: "midTable", position: size - 5 };
  return { kind: "survival", position: safe };
}

export function newBoard(state: CareerState): Board {
  return {
    objective: objectiveFor(state, state.manager.clubId),
    confidence: 60,
    lastReview: state.date,
    budgetAsked: false,
  };
}

/** The pre-season meeting: the board states its objective. */
export function seasonMeeting(state: CareerState) {
  state.board.objective = objectiveFor(state, state.manager.clubId);
  state.board.budgetAsked = false;
  const club = state.clubs[state.manager.clubId]!;
  openConversation(state, {
    with: "board",
    topic: "seasonObjective",
    title: "Réunion avec la direction",
    lines: [
      [
        "board",
        `Pour la saison ${state.season.label}, la direction de ${club.name} vous demande de ` +
          `${LABEL[state.board.objective.kind]} (${state.board.objective.position}e place ou mieux).`,
      ],
    ],
    choices: [
      { id: "accept", label: "Accepter l'objectif" },
      { id: "ambition", label: "Viser plus haut" },
      { id: "budget", label: "Demander un budget transferts plus important" },
    ],
  });
}

const clampConfidence = (x: number) => Math.max(0, Math.min(100, Math.round(x)));

/** Every four weeks in the season: the table against the objective, and the accounts. */
export function monthlyReview(state: CareerState) {
  const board = state.board;
  if (daysBetween(board.lastReview, state.date) < 28) return;
  board.lastReview = state.date;
  const clubId = state.manager.clubId;
  const league = state.clubs[clubId]!.leagueId;
  const table = leagueTable(state, league);
  const played = table.find((l) => l.clubId === clubId)?.played ?? 0;
  const total = (table.length - 1) * 2;
  if (played < 4) return;
  const progress = played / total;
  const position = table.findIndex((l) => l.clubId === clubId) + 1;
  const ahead = board.objective.position - position;
  let delta = Math.max(-8, Math.min(6, ahead * 1.5 * progress));
  if (state.clubs[clubId]!.finance.balance < 0) delta -= 3;
  board.confidence = clampConfidence(board.confidence + delta);
  if (board.confidence < 15 && progress >= 0.25)
    sack(state, "Les résultats sont trop loin de l'objectif.");
  else if (board.confidence < 35 && delta < 0) warning(state, position);
}

function warning(state: CareerState, position: number) {
  if (
    state.conversations.some((c) => c.topic === "warning" && daysBetween(c.date, state.date) < 56)
  ) {
    return;
  }
  openConversation(state, {
    with: "board",
    topic: "warning",
    title: "La direction s'inquiète",
    lines: [
      [
        "board",
        `${position}e : nous sommes loin de l'objectif. La direction attend une réaction rapide.`,
      ],
    ],
    choices: [
      { id: "confident", label: "Assurer que l'équipe va se redresser" },
      { id: "reinforce", label: "Demander des renforts" },
    ],
  });
}

/**
 * End of season: confidence moves with the gap to the objective; far below it with a weak
 * confidence, the manager is sacked. Far above it, a bigger club may call.
 */
export function seasonReview(state: CareerState, records: SeasonRecord[]) {
  const clubId = state.manager.clubId;
  const record = records.find((r) => r.table.some((l) => l.clubId === clubId))!;
  const position = record.table.findIndex((l) => l.clubId === clubId) + 1;
  const ahead = state.board.objective.position - position;
  state.board.confidence = clampConfidence(
    state.board.confidence + Math.max(-30, Math.min(20, ahead * 5)),
  );
  if (record.relegated.includes(clubId) && state.board.objective.kind !== "survival") {
    state.board.confidence = clampConfidence(state.board.confidence - 20);
  }
  if (state.board.confidence < 25) {
    sack(state, `${position}e place : l'objectif n'est pas atteint.`);
    return;
  }
  if (ahead >= 3) jobOffer(state);
}

function sack(state: CareerState, reason: string) {
  if (state.conversations.some((c) => c.topic === "sacked" && c.status === "open")) return;
  const rng = createRng(deriveSeed(state.seed, "jobs", state.date));
  const current = state.clubs[state.manager.clubId]!;
  /* Smaller clubs are willing to give him a new chance. */
  const options = Object.values(state.clubs)
    .filter((c) => c.id !== current.id && c.reputation <= current.reputation)
    .sort(() => rng.next() - 0.5)
    .slice(0, 3);
  const fallback = Object.values(state.clubs).find((c) => c.id !== current.id)!;
  const offers = options.length ? options : [fallback];
  openConversation(state, {
    with: "board",
    topic: "sacked",
    title: "Vous êtes licencié",
    lines: [
      [
        "board",
        `${reason} La direction de ${current.name} a décidé de mettre fin à votre contrat.`,
      ],
      ["assistant", `Des clubs vous ont déjà contacté : ${offers.map((c) => c.name).join(", ")}.`],
    ],
    choices: offers.map((c) => ({ id: c.id, label: `Rejoindre ${c.name}` })),
  });
}

function jobOffer(state: CareerState) {
  const rng = createRng(deriveSeed(state.seed, "job-offer", state.date));
  const current = state.clubs[state.manager.clubId]!;
  const bigger = Object.values(state.clubs).filter((c) => c.reputation > current.reputation);
  if (!bigger.length) return;
  const club = bigger[rng.int(0, bigger.length - 1)]!;
  openConversation(state, {
    with: "board",
    topic: "jobOffer",
    title: `${club.name} veut vous recruter`,
    lines: [["board", `Après votre saison, ${club.name} vous propose de devenir son entraîneur.`]],
    choices: [
      { id: "accept", label: `Rejoindre ${club.name}` },
      { id: "stay", label: `Rester à ${current.name}` },
    ],
    data: { clubId: club.id },
  });
}

/** Takes over another club: the slate is wiped clean with a new board. */
export function takeJob(state: CareerState, clubId: string) {
  state.manager.clubId = clubId;
  state.tactics = null;
  state.training = null;
  state.promises = [];
  for (const n of state.negotiations)
    if (n.stage === "fee" || n.stage === "contract") n.stage = "failed";
  for (const o of state.offers) if (o.status === "open") o.status = "withdrawn";
  state.board = newBoard(state);
  state.board.confidence = 55;
}

export function answerBoard(state: CareerState, c: Conversation, choice: string) {
  const board = state.board;
  const finance = state.clubs[state.manager.clubId]!.finance;
  switch (c.topic) {
    case "seasonObjective":
      if (choice === "ambition") {
        board.objective.position = Math.max(1, board.objective.position - 2);
        board.confidence = clampConfidence(board.confidence + 5);
        say(c, "board", `Nous prenons note : ${board.objective.position}e place ou mieux.`);
      } else if (choice === "budget") {
        if (board.confidence >= 60 && !board.budgetAsked) {
          finance.transferBudget = Math.round(finance.transferBudget * 1.15);
          board.budgetAsked = true;
          board.confidence = clampConfidence(board.confidence - 5);
          say(c, "board", "D'accord pour un effort, mais nous attendons des résultats.");
        } else {
          say(c, "board", "Ce n'est pas possible pour le moment. Faites avec le budget prévu.");
        }
      } else say(c, "board", "Parfait. Bonne saison.");
      break;
    case "warning":
      if (choice === "reinforce" && !board.budgetAsked) {
        finance.transferBudget += Math.round(finance.revenue * 0.03);
        board.budgetAsked = true;
        board.confidence = clampConfidence(board.confidence - 3);
        say(c, "board", "Un petit effort est consenti. C'est le dernier.");
      } else say(c, "board", "Nous jugerons sur les résultats.");
      break;
    case "sacked":
      takeJob(state, choice);
      say(c, "board", `Bienvenue à ${state.clubs[choice]!.name}.`);
      break;
    case "jobOffer":
      if (choice === "accept") {
        takeJob(state, String(c.data.clubId));
        say(c, "board", `Bienvenue à ${state.clubs[String(c.data.clubId)]!.name}.`);
      } else {
        board.confidence = clampConfidence(board.confidence + 5);
        say(c, "board", "La direction apprécie votre fidélité.");
      }
      break;
    default:
      throw new Error(`Unknown board topic ${c.topic}`);
  }
  close(c);
}
