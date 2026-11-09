/**
 * Plays a career in the terminal: advance the calendar, pick tactics and training, answer the
 * players, the assistant and the board, and do your transfers. A test bench before the app.
 * Usage: manager <league> <club> [--seed N] [--name "Your name"] | manager --load file.json
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import type { Pack } from "@fmo/data";
import { FORMATION_NAMES, type Tactics } from "@fmo/engine";
import {
  addDays,
  advance,
  ageOn,
  answerOffer,
  askAssistant,
  askingPrice,
  conditionOf,
  createCareer,
  isAvailable,
  isWindowOpen,
  leagueTable,
  loadCareer,
  moveTo,
  nextUserFixture,
  offerContract,
  offerFee,
  pending,
  playToday,
  releasePlayer,
  reply,
  saveCareer,
  searchPlayers,
  simulateToSeasonEnd,
  squadOf,
  startRenewal,
  startTransfer,
  talkToPlayer,
  worldOf,
  type Answer,
  type CareerPlayer,
  type CareerState,
  type Conversation,
  type Negotiation,
} from "../src/index.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false });
/* Lines are queued as they come: typed one by one, or piped all at once for a scripted test. */
const queue: string[] = [];
let waiting: ((line: string) => void) | null = null;
let closed = false;
rl.on("line", (line) => {
  if (waiting) {
    const resolve = waiting;
    waiting = null;
    resolve(line);
  } else queue.push(line);
});
rl.on("close", () => {
  closed = true;
  if (waiting) {
    console.log("");
    process.exit(0);
  }
});

async function ask(prompt: string): Promise<string> {
  process.stdout.write(prompt);
  const next = queue.shift();
  if (next !== undefined) {
    if (!process.stdin.isTTY)
      process.stdout.write(`${next}
`);
    return next.trim();
  }
  if (closed) {
    console.log("");
    process.exit(0);
  }
  const line = await new Promise<string>((resolve) => {
    waiting = resolve;
  });
  return line.trim();
}
async function askNumber(prompt: string): Promise<number | null> {
  const answer = (await ask(prompt)).replace(",", ".");
  if (answer === "" || answer.toLowerCase() === "q") return null;
  const n = Number(answer);
  return Number.isFinite(n) ? n : null;
}

const money = (x: number) =>
  Math.abs(x) >= 1_000_000 ? `${(x / 1_000_000).toFixed(1)} M€` : `${Math.round(x / 1000)} k€`;
const pad = (s: string | number, n: number) => String(s).padEnd(n).slice(0, n);
const padStart = (s: string | number, n: number) => String(s).padStart(n);
const line = () => console.log("-".repeat(78));
const club = (s: CareerState, id: string | null) => (id ? (s.clubs[id]?.name ?? id) : "libre");

/* ---------- start ---------- */

const args = process.argv.slice(2);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));

function start(): CareerState {
  const file = option("--load");
  if (file) return loadCareer(readFileSync(file, "utf8"));
  const [leagueId, query] = positional;
  if (!leagueId || !query) {
    console.log('Usage: npm run manager -- <championnat> <club> [--seed N] [--name "Nom"]');
    console.log("       npm run manager -- --load data/saves/<fichier>.json");
    process.exit(1);
  }
  const packs = worldOf(leagueId).map((id) => {
    const path = join(ROOT, `data/packs/${id}-2026-27.json`);
    if (!existsSync(path)) {
      console.error(`Pack absent : ${path}. Lancez npm run pack:fetch puis npm run pack:build.`);
      process.exit(1);
    }
    return JSON.parse(readFileSync(path, "utf8")) as Pack;
  });
  const plain = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const found = packs
    .flatMap((p) => p.clubs)
    .find((c) => c.id === query || plain(c.name).includes(plain(query)));
  if (!found) {
    console.error(`Club introuvable : ${query}`);
    process.exit(1);
  }
  return createCareer({
    packs,
    clubId: found.id,
    managerName: option("--name") ?? "Coach",
    seed: Number(option("--seed") ?? Date.now() % 100_000),
  });
}

const state = start();

/* ---------- screens ---------- */

function header(s: CareerState) {
  const mine = s.clubs[s.manager.clubId]!;
  const league = s.leagues.find((l) => l.id === mine.leagueId)!;
  const table = leagueTable(s, mine.leagueId);
  const row = table.findIndex((l) => l.clubId === mine.id);
  const position =
    row >= 0 && table[row]!.played > 0 ? `${row + 1}e (${table[row]!.points} pts)` : "-";
  const next = nextUserFixture(s);
  const opponent = next
    ? club(s, next.homeClubId === mine.id ? next.awayClubId : next.homeClubId)
    : "-";
  console.log("");
  line();
  console.log(
    `${s.manager.name} - ${mine.name} - ${league.name} - ${s.date} - saison ${s.season.label}`,
  );
  console.log(
    `Prochain match : ${next ? `${next.date} contre ${opponent} (${next.homeClubId === mine.id ? "dom." : "ext."})` : "-"}` +
      ` | Classement : ${position} | Confiance : ${s.board.confidence}`,
  );
  console.log(
    `Trésorerie : ${money(mine.finance.balance)} | Budget transferts : ${money(mine.finance.transferBudget)}` +
      ` | Mercato : ${isWindowOpen(s) ? "ouvert" : "fermé"}`,
  );
  const unread = s.inbox.filter((m) => !m.read).length;
  console.log(`Messages non lus : ${unread} | Discussions en attente : ${pending(s).length}`);
  line();
}

function menu() {
  console.log(" 1. Continuer          2. Boîte de réception   3. Discussions");
  console.log(" 4. Effectif           5. Classement           6. Tactique");
  console.log(" 7. Entraînement       8. Transferts           9. Parler (joueur, adjoint)");
  console.log("10. Finances          11. Simuler jusqu'à la fin de la saison");
  console.log(" s. Sauvegarder        q. Quitter");
}

function inbox(s: CareerState) {
  const messages = [...s.inbox].reverse().slice(0, 15);
  for (const m of messages) {
    console.log(`${m.read ? " " : "*"} [${m.date}] ${m.title}`);
    if (m.body) console.log(`    ${m.body}`);
    m.read = true;
  }
}

function showConversation(s: CareerState, c: Conversation) {
  const who = (speaker: string) =>
    speaker === "player"
      ? (s.players[c.playerId!]?.name ?? "Joueur")
      : speaker === "manager"
        ? "Vous"
        : speaker === "assistant"
          ? "Adjoint"
          : "Direction";
  for (const l of c.lines) console.log(`  ${who(l.speaker)} : ${l.text}`);
}

async function answerConversation(s: CareerState, c: Conversation) {
  showConversation(s, c);
  c.choices.forEach((choice, i) => console.log(`   ${i + 1}. ${choice.label}`));
  const n = await askNumber("Votre réponse : ");
  const choice = n ? c.choices[n - 1] : undefined;
  if (!choice) return;
  const before = c.lines.length;
  reply(s, c.id, choice.id);
  for (const l of c.lines.slice(before)) {
    console.log(
      `  ${l.speaker === "manager" ? "Vous" : l.speaker === "player" ? s.players[c.playerId!]?.name : l.speaker === "assistant" ? "Adjoint" : "Direction"} : ${l.text}`,
    );
  }
  const negotiationId = c.data.negotiationId;
  if (typeof negotiationId === "number") {
    const n2 = s.negotiations.find((x) => x.id === negotiationId);
    if (n2) await negotiate(s, n2);
  }
}

async function conversations(s: CareerState) {
  for (;;) {
    const open = pending(s);
    if (!open.length) {
      console.log("Aucune discussion en attente.");
      return;
    }
    if (open.length === 1) {
      await answerConversation(s, open[0]!);
      continue;
    }
    open.forEach((c, i) =>
      console.log(
        ` ${i + 1}. ${c.with === "player" ? s.players[c.playerId!]?.name : c.with === "board" ? "Direction" : "Adjoint"} - ${c.lines[0]?.text.slice(0, 60)}`,
      ),
    );
    const n = await askNumber("Laquelle (vide pour revenir) : ");
    if (!n || !open[n - 1]) return;
    await answerConversation(s, open[n - 1]!);
  }
}

const ORDER = ["GB", "DD", "DC", "DG", "MDC", "MC", "MD", "MG", "MOC", "AD", "AG", "BU"];

function squadList(s: CareerState): CareerPlayer[] {
  return squadOf(s, s.manager.clubId).sort(
    (a, b) => ORDER.indexOf(a.position) - ORDER.indexOf(b.position) || b.overall - a.overall,
  );
}

function showSquad(s: CareerState) {
  const list = squadList(s);
  console.log(
    ` #  ${pad("Poste", 4)} ${pad("Joueur", 24)} Âge Niv Moral Fatigue Contrat  Salaire  État`,
  );
  list.forEach((p, i) => {
    const state =
      p.injury && p.injury.until > s.date
        ? `blessé (${p.injury.until})`
        : p.suspension > 0
          ? `suspendu (${p.suspension})`
          : p.listed
            ? "transférable"
            : "";
    console.log(
      `${padStart(i + 1, 2)}  ${pad(p.position, 4)} ${pad(p.name, 24)} ${padStart(ageOn(p.birthDate, s.date), 3)} ` +
        `${padStart(Math.round(p.overall), 3)} ${padStart(Math.round(p.morale), 5)} ${padStart(conditionOf(p, s.date).fatigue, 7)} ` +
        `${pad(p.contract?.until ?? "-", 8)} ${padStart(money(p.contract?.wage ?? 0) + "/s", 9)}  ${state}`,
    );
  });
  return list;
}

function showTables(s: CareerState) {
  for (const league of s.leagues) {
    console.log(`\n${league.name}`);
    console.log(`  #  ${pad("Club", 24)}  J   G   N   P   BP  BC  Pts`);
    leagueTable(s, league.id).forEach((r, i) => {
      const mark = r.clubId === s.manager.clubId ? ">" : " ";
      console.log(
        `${mark}${padStart(i + 1, 2)}  ${pad(club(s, r.clubId), 24)}` +
          [r.played, r.won, r.drawn, r.lost, r.goalsFor, r.goalsAgainst]
            .map((n) => padStart(n, 4))
            .join("") +
          padStart(r.points, 5),
      );
    });
  }
}

async function pickFrom<T>(
  label: string,
  options: readonly T[],
  show: (x: T) => string,
): Promise<T | null> {
  options.forEach((o, i) => console.log(`   ${i + 1}. ${show(o)}`));
  const n = await askNumber(`${label} : `);
  return n && options[n - 1] !== undefined ? options[n - 1]! : null;
}

async function tactics(s: CareerState) {
  const t = s.tactics;
  console.log(
    t
      ? `Tactique : ${t.formation}, ${t.style}, pressing ${t.pressing}, ligne ${t.line}`
      : "Tactique : l'adjoint choisit à chaque match.",
  );
  console.log(" 1. Définir ma tactique   2. Laisser l'adjoint choisir");
  const choice = await ask("> ");
  if (choice === "2") {
    s.tactics = null;
    return;
  }
  if (choice !== "1") return;
  const formation = await pickFrom("Formation", FORMATION_NAMES, (f) => f);
  const style = await pickFrom(
    "Style",
    ["possession", "balanced", "direct"] as const,
    (x) => ({ possession: "possession", balanced: "équilibré", direct: "direct" })[x],
  );
  const pressing = await pickFrom(
    "Pressing",
    ["low", "medium", "high"] as const,
    (x) => ({ low: "bas", medium: "moyen", high: "haut" })[x],
  );
  const lineH = await pickFrom(
    "Ligne défensive",
    ["low", "medium", "high"] as const,
    (x) => ({ low: "basse", medium: "moyenne", high: "haute" })[x],
  );
  if (formation && style && pressing && lineH) {
    s.tactics = { formation, style, pressing, line: lineH } satisfies Tactics;
    console.log("Tactique enregistrée.");
  }
}

async function training(s: CareerState) {
  const plan = s.training ?? s.assistantPlan;
  console.log(
    `${s.training ? "Votre plan" : "Plan de l'adjoint"} : ${plan ? `${plan.theme}, intensité ${plan.intensity}` : "pas encore défini"}`,
  );
  console.log(
    " 1. Définir le plan de la semaine   2. Laisser l'adjoint   3. Axe individuel d'un joueur",
  );
  const choice = await ask("> ");
  if (choice === "2") s.training = null;
  if (choice === "1") {
    const theme = await pickFrom(
      "Thème",
      ["physical", "technical", "tactical", "setPieces", "recovery"] as const,
      (x) =>
        ({
          physical: "physique",
          technical: "technique",
          tactical: "tactique",
          setPieces: "coups de pied arrêtés",
          recovery: "récupération",
        })[x],
    );
    const intensity = await pickFrom(
      "Intensité",
      ["light", "normal", "high"] as const,
      (x) => ({ light: "légère", normal: "normale", high: "forte" })[x],
    );
    if (theme && intensity) s.training = { theme, intensity };
  }
  if (choice === "3") {
    const list = showSquad(s);
    const n = await askNumber("Joueur (numéro) : ");
    const p = n ? list[n - 1] : undefined;
    if (!p) return;
    const focus = await pickFrom(
      "Axe",
      ["aucun", "attack", "defence", "physical", "technique", "mental", "goalkeeping"] as const,
      (x) =>
        ({
          aucun: "aucun (équilibré)",
          attack: "attaque",
          defence: "défense",
          physical: "physique",
          technique: "technique",
          mental: "mental",
          goalkeeping: "gardien",
        })[x],
    );
    if (focus) p.trainingFocus = focus === "aucun" ? null : focus;
  }
}

function printAnswer(a: Answer, unit: (x: number) => string) {
  if (a.status === "accepted") console.log("  Accepté !");
  else if (a.status === "countered") console.log(`  Contre-proposition : ${unit(a.counter)}`);
  else console.log(`  Refusé : ${a.reason}`);
}

async function negotiate(s: CareerState, n: Negotiation) {
  const p = s.players[n.playerId]!;
  while (n.stage === "fee") {
    console.log(`Le club ${club(s, n.sellerId)} demande ${money(n.askingFee)} pour ${p.name}.`);
    const fee = await askNumber("Votre offre en M€ (vide pour abandonner) : ");
    if (fee === null) return;
    printAnswer(offerFee(s, n.id, Math.round(fee * 1_000_000)), money);
  }
  while (n.stage === "contract") {
    console.log(`${p.name} demande ${money(n.demandWage)} par semaine.`);
    const wage = await askNumber("Salaire proposé en k€/semaine (vide pour abandonner) : ");
    if (wage === null) return;
    const years = (await askNumber("Durée en saisons (1-5) : ")) ?? 3;
    const promise = await pickFrom(
      "Promesse de temps de jeu",
      ["aucune", "rotation", "regular", "key"] as const,
      (x) =>
        ({
          aucune: "aucune",
          rotation: "remplaçant régulier",
          regular: "titulaire",
          key: "joueur clé",
        })[x],
    );
    printAnswer(
      offerContract(s, n.id, {
        wage: Math.round(wage * 1000),
        years: Math.max(1, Math.min(5, Math.round(years))),
        promise: !promise || promise === "aucune" ? null : promise,
      }),
      money,
    );
  }
  if (n.stage === "done") console.log("Affaire conclue.");
  if (n.stage === "failed") console.log("Les discussions sont terminées.");
}

async function transfers(s: CareerState) {
  console.log(" 1. Chercher un joueur   2. Offres reçues   3. Prolonger un joueur");
  console.log(" 4. Libérer un joueur    5. Derniers transferts");
  const choice = await ask("> ");
  try {
    if (choice === "1") {
      const position = (
        await ask("Poste (GB, DC, DG, DD, MDC, MC, MOC, MG, MD, AG, AD, BU ; vide = tous) : ")
      ).toUpperCase();
      const maxAge = (await askNumber("Âge maximum (vide = tous) : ")) ?? undefined;
      const minOverall = (await askNumber("Niveau minimum (vide = tous) : ")) ?? undefined;
      const free = (await ask("Joueurs libres seulement ? (o/n) : ")).toLowerCase() === "o";
      const results = searchPlayers(
        s,
        {
          ...(position ? { position: position as CareerPlayer["position"] } : {}),
          ...(maxAge ? { maxAge } : {}),
          ...(minOverall ? { minOverall } : {}),
          freeOnly: free,
        },
        15,
      );
      results.forEach((r, i) =>
        console.log(
          `${padStart(i + 1, 2)}. ${pad(r.player.name, 24)} ${pad(r.player.position, 4)} ${padStart(r.age, 2)} ans ` +
            `niv ${padStart(Math.round(r.player.overall), 2)}  ${pad(club(s, r.player.clubId), 22)} valeur ${money(r.value)}` +
            (r.player.clubId ? ` demande ${money(askingPrice(s, r.player.id))}` : ""),
        ),
      );
      const n = await askNumber("Négocier avec (numéro, vide pour revenir) : ");
      const target = n ? results[n - 1] : undefined;
      if (target) await negotiate(s, startTransfer(s, target.player.id));
    }
    if (choice === "2") {
      const open = s.offers.filter((o) => o.status === "open");
      if (!open.length) console.log("Aucune offre.");
      const offer = await pickFrom(
        "Offre",
        open,
        (o) => `${club(s, o.buyerId)} : ${money(o.fee)} pour ${s.players[o.playerId]!.name}`,
      );
      if (!offer) return;
      console.log(" 1. Accepter   2. Refuser   3. Demander plus");
      const a = await ask("> ");
      if (a === "1") printAnswer(answerOffer(s, offer.id, "accept"), money);
      if (a === "2") printAnswer(answerOffer(s, offer.id, "reject"), money);
      if (a === "3") {
        const fee = await askNumber("Montant demandé en M€ : ");
        if (fee)
          printAnswer(answerOffer(s, offer.id, { counter: Math.round(fee * 1_000_000) }), money);
      }
    }
    if (choice === "3") {
      const list = showSquad(s);
      const n = await askNumber("Joueur à prolonger (numéro) : ");
      const p = n ? list[n - 1] : undefined;
      if (p) await negotiate(s, startRenewal(s, p.id));
    }
    if (choice === "4") {
      const list = showSquad(s);
      const n = await askNumber("Joueur à libérer (numéro) : ");
      const p = n ? list[n - 1] : undefined;
      if (p && (await ask(`Libérer ${p.name} ? (o/n) : `)).toLowerCase() === "o") {
        console.log(`Indemnité payée : ${money(releasePlayer(s, p.id))}`);
      }
    }
    if (choice === "5") {
      for (const t of [...s.transfers].reverse().slice(0, 15)) {
        console.log(
          `[${t.date}] ${s.players[t.playerId]!.name} : ${club(s, t.fromId)} -> ${club(s, t.toId)} (${t.fee ? money(t.fee) : "libre"})`,
        );
      }
    }
  } catch (error) {
    console.log(`Impossible : ${(error as Error).message}`);
  }
}

async function talk(s: CareerState) {
  console.log(" 1. Demander conseil à l'adjoint   2. Féliciter un joueur   3. Recadrer un joueur");
  const choice = await ask("> ");
  if (choice === "1") await answerConversation(s, askAssistant(s));
  if (choice === "2" || choice === "3") {
    const list = showSquad(s);
    const n = await askNumber("Joueur (numéro) : ");
    const p = n ? list[n - 1] : undefined;
    if (p) showConversation(s, talkToPlayer(s, p.id, choice === "2" ? "praise" : "criticism"));
  }
}

function finances(s: CareerState) {
  const f = s.clubs[s.manager.clubId]!.finance;
  const wages = squadOf(s, s.manager.clubId).reduce((t, p) => t + (p.contract?.wage ?? 0), 0);
  console.log(`Trésorerie            ${money(f.balance)}`);
  console.log(`Revenus attendus      ${money(f.revenue)} par saison`);
  console.log(`Masse salariale       ${money(wages)} par semaine (budget ${money(f.wageBudget)})`);
  console.log(`Budget transferts     ${money(f.transferBudget)}`);
  console.log(
    `Cette saison          recettes ${money(f.income)}, salaires ${money(f.wages)}, transferts ${money(f.transfers)}`,
  );
}

function matchReport(
  s: CareerState,
  result: NonNullable<ReturnType<typeof playToday>["userMatch"]>,
  fixtureId: number,
) {
  const f = s.fixtures.find((x) => x.id === fixtureId)!;
  const r = f.result!;
  console.log(`\n  ${club(s, f.homeClubId)} ${r.home} - ${r.away} ${club(s, f.awayClubId)}`);
  for (const g of r.goals) {
    const assist = g.assistId ? `, passe de ${s.players[g.assistId]?.name}` : "";
    console.log(
      `   ${padStart(g.minute, 3)}'  ${club(s, g.side === "home" ? f.homeClubId : f.awayClubId)} : ${s.players[g.playerId]?.name}${assist}`,
    );
  }
  const side = f.homeClubId === s.manager.clubId ? "home" : "away";
  const st = result.stats;
  console.log(
    `  Possession ${st.home.possession}%-${st.away.possession}%, tirs ${st.home.shots}-${st.away.shots}, cadrés ${st.home.shotsOnTarget}-${st.away.shotsOnTarget}`,
  );
  console.log(`  Homme du match : ${s.players[result.manOfTheMatch]?.name}`);
  const ours = result.players.filter((p) => p.side === side).sort((a, b) => b.rating - a.rating);
  console.log(
    `  Notes : ${ours.map((p) => `${s.players[p.playerId]?.name.split(" ").at(-1)} ${p.rating.toFixed(1)}`).join(", ")}`,
  );
}

async function proceed(s: CareerState) {
  const { stop } = advance(s);
  if (stop === "conversation") {
    console.log("Quelqu'un attend votre réponse.");
    await conversations(s);
    return;
  }
  if (stop === "seasonEnd") {
    const summary = [...s.inbox].reverse().find((m) => m.kind === "season");
    console.log(`\nFin de saison. ${summary ? `${summary.title}. ${summary.body}` : ""}`);
    return;
  }
  const advice = [...s.inbox].reverse().find((m) => m.kind === "advice" && m.date === s.date);
  if (advice) console.log(`\nAdjoint : ${advice.body}`);
  const fixture = nextUserFixture(s)!;
  const unavailable = squadOf(s, s.manager.clubId).filter((p) => !isAvailable(p, s.date)).length;
  console.log(`\nJour de match. ${unavailable ? `${unavailable} joueur(s) indisponible(s).` : ""}`);
  console.log(" 1. Jouer le match   2. Changer la tactique d'abord   3. Revenir au menu");
  const choice = await ask("> ");
  if (choice === "2") await tactics(s);
  if (choice === "3") return;
  const { userMatch } = playToday(s);
  if (userMatch) matchReport(s, userMatch, fixture.id);
  moveTo(s, addDays(s.date, 1));
}

function save(s: CareerState) {
  const dir = join(ROOT, "data/saves");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${s.manager.clubId}-${s.season.label}.json`);
  writeFileSync(file, saveCareer(s));
  console.log(`Partie sauvegardée : ${file}`);
}

/* ---------- loop ---------- */

console.log(`Bienvenue ! Vous dirigez ${state.clubs[state.manager.clubId]!.name}.`);
for (;;) {
  header(state);
  menu();
  const choice = (await ask("> ")).toLowerCase();
  try {
    if (choice === "1") await proceed(state);
    else if (choice === "2") inbox(state);
    else if (choice === "3") await conversations(state);
    else if (choice === "4") showSquad(state);
    else if (choice === "5") showTables(state);
    else if (choice === "6") await tactics(state);
    else if (choice === "7") await training(state);
    else if (choice === "8") await transfers(state);
    else if (choice === "9") await talk(state);
    else if (choice === "10") finances(state);
    else if (choice === "11") {
      simulateToSeasonEnd(state);
      const summary = [...state.inbox].reverse().find((m) => m.kind === "season");
      console.log(`Saison simulée. ${summary ? `${summary.title}. ${summary.body}` : ""}`);
    } else if (choice === "s") save(state);
    else if (choice === "q") {
      const answer = (await ask("Sauvegarder avant de quitter ? (o/n) : ")).toLowerCase();
      if (answer === "o") save(state);
      rl.close();
      process.exit(0);
    }
  } catch (error) {
    console.log(`Erreur : ${(error as Error).message}`);
  }
}
