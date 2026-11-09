/**
 * Plays whole careers in the terminal, the assistant running the club, to check the rules over
 * several seasons. Usage: career <league> <club> [--seasons N] [--seed N] [--save file]
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Pack } from "@fmo/data";
import {
  ageOn,
  createCareer,
  leagueTable,
  saveCareer,
  simulateToSeasonEnd,
  squadOf,
  worldOf,
  type CareerState,
} from "../src/index.ts";

const args = process.argv.slice(2);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const [leagueId, clubQuery] = args.filter(
  (a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"),
);
if (!leagueId || !clubQuery) {
  console.log("Usage: npm run career -- <league> <club> [--seasons N] [--seed N] [--save file]");
  process.exit(1);
}
const SEASONS = Number(option("--seasons") ?? 3);
const SEED = Number(option("--seed") ?? 1);

const PACKS = join(dirname(fileURLToPath(import.meta.url)), "../../../data/packs");
const packs = worldOf(leagueId).map((id) => {
  const file = join(PACKS, `${id}-2026-27.json`);
  if (!existsSync(file)) {
    console.error(`No pack ${file}: run npm run pack:fetch and npm run pack:build first.`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(file, "utf8")) as Pack;
});
const plain = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
const club = packs
  .flatMap((p) => p.clubs)
  .find((c) => c.id === clubQuery || plain(c.name).includes(plain(clubQuery)));
if (!club) {
  console.error(`No club "${clubQuery}" in ${worldOf(leagueId).join(", ")}`);
  process.exit(1);
}

const state: CareerState = createCareer({
  packs,
  clubId: club.id,
  managerName: "Coach",
  seed: SEED,
});
const name = (id: string) => state.clubs[id]?.name ?? id;
const averageLevel = (leagueIdOf: string) => {
  const players = Object.values(state.clubs)
    .filter((c) => c.leagueId === leagueIdOf)
    .flatMap((c) =>
      squadOf(state, c.id)
        .map((p) => p.overall)
        .sort((a, b) => b - a)
        .slice(0, 11),
    );
  return players.reduce((s, o) => s + o, 0) / players.length;
};

console.log(
  `Career with ${club.name}, ${state.leagues.map((l) => l.name).join(" + ")}, seed ${SEED}`,
);
for (let s = 0; s < SEASONS; s++) {
  const label = state.season.label;
  const levels = state.leagues.map((l) => `${l.name} ${averageLevel(l.id).toFixed(1)}`).join(", ");
  const started = performance.now();
  const before = Object.keys(state.players).length;
  const tables = new Map<string, ReturnType<typeof leagueTable>>();
  const playerCountBefore = Object.values(state.players).filter((p) => p.clubId).length;
  simulateToSeasonEnd(state);
  const ms = performance.now() - started;
  const records = state.history.filter((r) => r.season === label);
  console.log(`\n${label} (${(ms / 1000).toFixed(1)} s) - best-XI level at the start: ${levels}`);
  for (const r of records) {
    tables.set(r.leagueId, r.table);
    const league = state.leagues.find((l) => l.id === r.leagueId)!;
    const mine = r.table.findIndex((l) => l.clubId === club.id);
    console.log(
      `  ${league.name}: champion ${name(r.table[0]!.clubId)} (${r.table[0]!.points} pts), ` +
        `last ${name(r.table.at(-1)!.clubId)} (${r.table.at(-1)!.points} pts)` +
        (mine >= 0 ? `, ${club.name} ${mine + 1}e (${r.table[mine]!.points} pts)` : ""),
    );
    if (r.promoted.length) console.log(`    up: ${r.promoted.map(name).join(", ")}`);
    if (r.relegated.length) console.log(`    down: ${r.relegated.map(name).join(", ")}`);
  }
  const lines = Object.values(state.players)
    .map((p) => ({ p, line: p.history.find((h) => h.season === label) }))
    .filter((x) => x.line);
  const top = lines.sort((a, b) => b.line!.goals - a.line!.goals)[0]!;
  const retired = Object.values(state.players).filter(
    (p) => !p.clubId && p.history.at(-1)?.season === label,
  ).length;
  const created = Object.keys(state.players).length - before;
  console.log(
    `  top scorer ${top.p.name} (${name(top.line!.clubId)}) ${top.line!.goals} goals | ` +
      `retired ${retired}, academy ${created}, active players ${playerCountBefore} -> ` +
      `${Object.values(state.players).filter((p) => p.clubId).length}`,
  );
  const mySquad = squadOf(state, club.id);
  const young = mySquad
    .filter((p) => ageOn(p.birthDate, state.season.start) <= 21)
    .sort((a, b) => b.potential - a.potential)[0];
  if (young) {
    console.log(
      `  best prospect at ${club.name}: ${young.name}, ${young.overall} (potential ${young.potential})`,
    );
  }
}
const inbox = state.inbox.slice(-6).map((m) => `  [${m.date}] ${m.title}`);
console.log(`\nLast inbox messages:\n${inbox.join("\n")}`);
const text = saveCareer(state);
console.log(`\nSave size: ${(text.length / 1024 / 1024).toFixed(2)} MB`);
const out = option("--save");
if (out) writeFileSync(out, text);
