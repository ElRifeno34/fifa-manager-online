/**
 * Talks with players: they come with their worries (playing time, contract, a wish to leave), the
 * manager answers, and the rules decide the effect on morale, promises and the market. Players are
 * real people with invented in-game personalities: their lines stay within the game's world.
 */
import { daysBetween } from "./calendar.ts";
import { rolesOf } from "./people.ts";
import { squadOf } from "./state.ts";
import { clampMorale, close, first, openConversation, pick, say, voiceOf } from "./talk.ts";
import { startRenewal } from "./transfers.ts";
import type { CareerPlayer, CareerState, Conversation, PlayingTimePromise } from "./types.ts";

/** Matches a club has played this season. */
export const clubMatches = (state: CareerState, clubId: string) =>
  state.fixtures.filter((f) => f.result && (f.homeClubId === clubId || f.awayClubId === clubId))
    .length;

const recentlyTalked = (state: CareerState, playerId: string, days: number) =>
  state.conversations.some(
    (c) => c.playerId === playerId && daysBetween(c.date, state.date) < days,
  );

/** Share of the club's matches a promised role means starting. */
const PROMISED_STARTS: Record<PlayingTimePromise["role"], number> = {
  key: 0.7,
  regular: 0.5,
  rotation: 0.25,
};

export function makePromise(state: CareerState, p: CareerPlayer, role: PlayingTimePromise["role"]) {
  const broken = state.promises.find((x) => x.playerId === p.id)?.broken ?? 0;
  state.promises = state.promises.filter((x) => x.playerId !== p.id);
  state.promises.push({
    playerId: p.id,
    role,
    date: state.date,
    starts0: p.season.starts,
    matches0: clubMatches(state, state.manager.clubId),
    broken,
  });
}

/** Judges promises after eight club matches: kept, they lift morale; broken, they hurt badly. */
export function reviewPromises(state: CareerState) {
  const clubId = state.manager.clubId;
  const played = clubMatches(state, clubId);
  for (const promise of [...state.promises]) {
    const p = state.players[promise.playerId];
    if (!p || p.clubId !== clubId) {
      state.promises = state.promises.filter((x) => x !== promise);
      continue;
    }
    const matches = played - promise.matches0;
    if (matches < 8) continue;
    const share = (p.season.starts - promise.starts0) / matches;
    state.promises = state.promises.filter((x) => x !== promise);
    if (share >= PROMISED_STARTS[promise.role] || p.injury) {
      p.morale = clampMorale(p.morale + 5);
      continue;
    }
    p.morale = clampMorale(p.morale - 20);
    openConversation(state, {
      with: "player",
      topic: "brokenPromise",
      playerId: p.id,
      title: `${p.name} vous rappelle votre promesse`,
      lines: [
        [
          "player",
          voiceOf(p) === "blunt"
            ? `Vous m'aviez promis du temps de jeu. Je ne joue pas. Je veux des explications.`
            : `Coach, vous m'aviez promis plus de temps de jeu. Je suis déçu, je ne vais pas mentir.`,
        ],
      ],
      choices: [
        { id: "apologise", label: "Reconnaître l'erreur et s'excuser" },
        { id: "again", label: "Renouveler la promesse" },
        { id: "blame", label: "Lui dire de mériter sa place" },
      ],
      data: { broken: promise.broken + 1, role: promise.role },
    });
  }
}

/**
 * Once a week, at most one player of the manager's squad asks to talk: about playing time when
 * he is unhappy on the bench, about his contract in its last season, or to leave when he is
 * miserable and ambitious.
 */
export function playerRequests(state: CareerState) {
  const squad = squadOf(state, state.manager.clubId);
  if (squad.length < 11) return;
  const roles = rolesOf(squad);
  const day = daysBetween(state.season.start, state.date);
  for (const p of [...squad].sort((a, b) => a.morale - b.morale)) {
    if (recentlyTalked(state, p.id, 30)) continue;
    const role = roles.get(p.id)!;
    const important = role === "key" || role === "regular";
    const askedThisSeason = (topic: Conversation["topic"]) =>
      state.conversations.some(
        (c) => c.playerId === p.id && c.topic === topic && c.date >= state.season.start,
      );
    if (p.morale < 25 && p.personality.ambition >= 12 && !p.listed) {
      if (askedThisSeason("transferRequest")) continue;
      transferRequest(state, p);
      return;
    }
    if (p.morale < 46 && p.personality.ambition >= 9 && role !== "backup" && day >= 30) {
      playingTime(state, p);
      return;
    }
    if (important && p.contract?.until === state.season.label && day >= 90) {
      if (state.negotiations.some((n) => n.playerId === p.id && n.stage !== "failed")) continue;
      /* He raises it once a season; after that it is up to the manager. */
      if (askedThisSeason("contract")) continue;
      contractTalk(state, p);
      return;
    }
  }
}

function playingTime(state: CareerState, p: CareerPlayer) {
  const voice = voiceOf(p);
  openConversation(state, {
    with: "player",
    topic: "playingTime",
    playerId: p.id,
    title: `${p.name} veut vous parler`,
    lines: [
      [
        "player",
        pick(
          state,
          `pt-${p.id}-${state.date}`,
          {
            blunt: [
              "Je ne suis pas venu ici pour regarder les matchs depuis le banc.",
              "Ça ne peut pas durer. Je veux jouer, et vite.",
            ],
            calm: [
              "Coach, je voulais vous demander ce que je dois faire pour jouer davantage.",
              "Je respecte vos choix, mais j'aimerais avoir plus de temps de jeu.",
            ],
            plain: [
              "Je ne joue pas assez à mon goût. Qu'est-ce que vous attendez de moi ?",
              "J'ai besoin de temps de jeu pour progresser. Où est-ce que j'en suis ?",
            ],
          }[voice],
        ),
      ],
    ],
    choices: [
      { id: "promise", label: "Lui promettre plus de temps de jeu" },
      { id: "explain", label: "Lui expliquer la concurrence et le pousser à travailler" },
      { id: "refuse", label: "Lui dire que la décision ne lui appartient pas" },
    ],
  });
}

function contractTalk(state: CareerState, p: CareerPlayer) {
  openConversation(state, {
    with: "player",
    topic: "contract",
    playerId: p.id,
    title: `${p.name} parle de son contrat`,
    lines: [
      [
        "player",
        voiceOf(p) === "blunt"
          ? "Mon contrat se termine en fin de saison. Si le club veut me garder, il faut le montrer maintenant."
          : "Mon contrat arrive à son terme. J'aimerais savoir si le club compte sur moi pour la suite.",
      ],
    ],
    choices: [
      { id: "open", label: "Ouvrir des discussions de prolongation" },
      { id: "later", label: "En reparler plus tard dans la saison" },
      { id: "no", label: "Lui dire qu'il ne sera pas prolongé" },
    ],
  });
}

function transferRequest(state: CareerState, p: CareerPlayer) {
  openConversation(state, {
    with: "player",
    topic: "transferRequest",
    playerId: p.id,
    title: `${p.name} demande à partir`,
    lines: [
      [
        "player",
        voiceOf(p) === "calm"
          ? "J'ai beaucoup réfléchi. Je pense qu'il est temps pour moi de changer d'air."
          : "Je veux partir. Mettez-moi sur la liste des transferts.",
      ],
    ],
    choices: [
      { id: "list", label: "Accepter et le placer sur la liste des transferts" },
      { id: "convince", label: "Lui promettre un rôle de titulaire pour le retenir" },
      { id: "refuse", label: "Refuser : il est sous contrat" },
    ],
  });
}

/** After a refused bid from a bigger club, an ambitious player may come and complain. */
export function blockedMove(state: CareerState, p: CareerPlayer, buyerId: string) {
  const buyer = state.clubs[buyerId]!;
  const own = state.clubs[p.clubId!]!;
  if (buyer.reputation <= own.reputation || p.personality.ambition < 12) return;
  p.morale = clampMorale(p.morale - 8);
  openConversation(state, {
    with: "player",
    topic: "blockedMove",
    playerId: p.id,
    title: `${p.name} est contrarié`,
    lines: [
      [
        "player",
        `${buyer.name} voulait de moi et vous avez dit non. C'était peut-être la chance de ma carrière.`,
      ],
    ],
    choices: [
      { id: "essential", label: "Lui dire qu'il est essentiel et lui promettre d'être titulaire" },
      { id: "firm", label: "Lui rappeler qu'il est sous contrat" },
    ],
    data: { buyerId },
  });
}

/** Manager-initiated talks: praise or criticism, judged against the player's recent form. */
export function talkToPlayer(state: CareerState, playerId: string, topic: "praise" | "criticism") {
  const p = state.players[playerId];
  if (!p || p.clubId !== state.manager.clubId) throw new Error("Not a player of the club");
  const average = p.ratings.length ? p.ratings.reduce((s, r) => s + r, 0) / p.ratings.length : 6.5;
  const good = average >= 6.8;
  const poor = average < 6.3;
  const c = openConversation(state, {
    with: "player",
    topic,
    playerId,
    lines: [
      [
        "manager",
        topic === "praise"
          ? `${first(p)}, je voulais te dire que je suis content de ce que tu fais.`
          : `${first(p)}, j'attends beaucoup plus de toi en ce moment.`,
      ],
    ],
    choices: [],
  });
  if (topic === "praise") {
    const delta = good ? 6 : poor ? 1 : 3;
    p.morale = clampMorale(p.morale + delta);
    say(
      c,
      "player",
      good
        ? "Merci coach, ça fait du bien. Je vais continuer comme ça."
        : "Merci. Je sais que je peux faire mieux.",
    );
  } else {
    const professional = p.personality.professionalism >= 12;
    const delta = !poor ? -10 : professional ? 2 : p.personality.temperament >= 14 ? -8 : -3;
    p.morale = clampMorale(p.morale + delta);
    say(
      c,
      "player",
      !poor
        ? "Je ne comprends pas. Je fais ce qu'on me demande, je trouve ça injuste."
        : professional
          ? "Vous avez raison. Je vais travailler pour revenir à mon niveau."
          : voiceOf(p) === "blunt"
            ? "Je n'ai pas besoin qu'on me fasse la leçon."
            : "D'accord, j'ai compris le message.",
    );
  }
  return c;
}

/** Applies the manager's answer to a player conversation. */
export function answerPlayer(state: CareerState, c: Conversation, choice: string) {
  const p = state.players[c.playerId!]!;
  const blunt = voiceOf(p) === "blunt";
  switch (`${c.topic}:${choice}`) {
    case "playingTime:promise":
      makePromise(state, p, "regular");
      p.morale = clampMorale(p.morale + 10);
      say(c, "player", "C'est tout ce que je demande. Je vais vous le rendre sur le terrain.");
      break;
    case "playingTime:explain":
      p.morale = clampMorale(p.morale + (p.personality.professionalism >= 12 ? 4 : -3));
      say(
        c,
        "player",
        p.personality.professionalism >= 12
          ? "Compris. Je vais bosser pour gagner ma place."
          : "On verra bien. Je ne vais pas attendre éternellement.",
      );
      break;
    case "playingTime:refuse":
      p.morale = clampMorale(p.morale - 8);
      say(
        c,
        "player",
        blunt
          ? "Très bien. Alors ne vous étonnez pas si je cherche ailleurs."
          : "Je vois. C'est dommage.",
      );
      break;
    case "contract:open": {
      const n = startRenewal(state, p.id);
      c.data.negotiationId = n.id;
      p.morale = clampMorale(p.morale + 4);
      say(c, "player", "Parfait. Mon agent attend votre proposition.");
      break;
    }
    case "contract:later":
      p.morale = clampMorale(p.morale - 4);
      say(c, "player", "D'accord, mais je ne vais pas attendre indéfiniment.");
      break;
    case "contract:no":
      p.morale = clampMorale(p.morale - 10);
      p.listed = true;
      say(c, "player", "Au moins c'est clair. Je vais préparer la suite.");
      break;
    case "transferRequest:list":
      p.listed = true;
      p.morale = clampMorale(p.morale + 5);
      say(c, "player", "Merci de ne pas me retenir. Je donnerai tout jusqu'à mon départ.");
      break;
    case "transferRequest:convince":
      makePromise(state, p, "key");
      p.morale = clampMorale(p.morale + 12);
      say(
        c,
        "player",
        "Si vous me faites vraiment confiance, je reste. Mais je jugerai sur les actes.",
      );
      break;
    case "transferRequest:refuse":
      p.morale = clampMorale(p.morale - 10);
      say(
        c,
        "player",
        blunt ? "Vous le regretterez." : "Je respecte mon contrat, mais je ne suis pas heureux.",
      );
      break;
    case "brokenPromise:apologise":
      p.morale = clampMorale(p.morale + 3);
      say(c, "player", "Merci de le reconnaître. Mais j'attends des actes maintenant.");
      break;
    case "brokenPromise:again": {
      const broken = Number(c.data.broken ?? 1);
      if (broken >= 2) {
        p.listed = true;
        p.morale = clampMorale(p.morale - 5);
        say(c, "player", "Vous m'avez déjà dit ça. Je veux partir.");
      } else {
        makePromise(state, p, (c.data.role as PlayingTimePromise["role"]) ?? "regular");
        const promise = state.promises.find((x) => x.playerId === p.id);
        if (promise) promise.broken = broken;
        p.morale = clampMorale(p.morale + 5);
        say(c, "player", "Dernière chance, coach.");
      }
      break;
    }
    case "brokenPromise:blame":
      p.morale = clampMorale(p.morale - 10);
      if (p.personality.ambition >= 12) p.listed = true;
      say(
        c,
        "player",
        blunt ? "Je ne vais pas rester pour être traité comme ça." : "Si c'est comme ça...",
      );
      break;
    case "blockedMove:essential":
      makePromise(state, p, "key");
      p.morale = clampMorale(p.morale + 8);
      say(c, "player", "Alors montrez-le-moi. Je veux être au centre du projet.");
      break;
    case "blockedMove:firm":
      p.morale = clampMorale(p.morale - 5);
      say(c, "player", "Je ferai mon travail. Mais je n'oublierai pas.");
      break;
    default:
      throw new Error(`Unknown answer ${choice} to ${c.topic}`);
  }
  close(c);
}
