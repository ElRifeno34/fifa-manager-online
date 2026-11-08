/**
 * Plays with the engine in the terminal, on a real pack (data/packs, built by pack:build).
 *   play <league>                       a whole season: table, scorers, best players
 *   play <league> <home> <away>         one match: timeline, stats, ratings
 * Options: --seed N, --home-tactics / --away-tactics "4-3-3,possession,high,high"
 * Clubs can be given by id, initials or part of their name (psg, "saint-etienne", lyon).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  autoTeamSheet,
  createSeason,
  FORMATION_NAMES,
  playRound,
  rounds,
  seasonTable,
  simulateMatch,
  tierAgainst,
  type MatchEvent,
  type SeasonFixture,
  type SeasonPlayer,
  type Tactics,
} from "../src/index.ts";

interface Club {
  id: string;
  name: string;
  initials: string;
  reputation: number;
}
interface Pack {
  league: { id: string; name: string };
  clubs: Club[];
  players: (SeasonPlayer & { number: number | null })[];
  fixtures: SeasonFixture[];
}

const args = process.argv.slice(2);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const seed = Number(option("--seed") ?? Date.now() % 100_000);
const [leagueId, homeArg, awayArg] = positional;

const PACKS = join(dirname(fileURLToPath(import.meta.url)), "../../../data/packs");
if (!leagueId) {
  console.log(
    "Usage: npm run play -- <league> [home away] [--seed N] [--home-tactics 4-3-3,possession,high,high]",
  );
  process.exit(1);
}
const file = join(PACKS, `${leagueId}-2026-27.json`);
if (!existsSync(file)) {
  console.error(`No pack ${file}: run npm run pack:fetch and npm run pack:build first.`);
  process.exit(1);
}
const pack = JSON.parse(readFileSync(file, "utf8")) as Pack;
const playerById = new Map(pack.players.map((p) => [p.id, p]));
const name = (id?: string) => (id ? (playerById.get(id)?.name ?? id) : "");
const plain = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

function findClub(query: string): Club {
  const q = plain(query);
  const aliases: Record<string, string> = {
    psg: "paris saint-germain",
    om: "marseille",
    ol: "lyon",
  };
  const target = aliases[q] ?? q;
  /* Every word of the query starts a word of the name: "man city", "real", "st etienne". */
  const words = (text: string) =>
    plain(text)
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
  const byWords = (c: Club) =>
    words(target).every((w) => words(`${c.name} ${c.id}`).some((n) => n.startsWith(w)));
  const club =
    pack.clubs.find((c) => c.id === target || plain(c.initials) === target) ??
    pack.clubs.find(byWords);
  if (!club) {
    console.error(
      `No club "${query}" in ${pack.league.name}: ${pack.clubs.map((c) => c.id).join(", ")}`,
    );
    process.exit(1);
  }
  return club;
}

function tacticsOption(flag: string): Tactics | undefined {
  const value = option(flag);
  if (!value) return undefined;
  const [formation, style, pressing, line] = value.split(",");
  if (!FORMATION_NAMES.includes(formation as Tactics["formation"])) {
    console.error(`Unknown formation ${formation}: ${FORMATION_NAMES.join(", ")}`);
    process.exit(1);
  }
  return {
    formation: formation as Tactics["formation"],
    style: (style ?? "balanced") as Tactics["style"],
    pressing: (pressing ?? "medium") as Tactics["pressing"],
    line: (line ?? "medium") as Tactics["line"],
  };
}

const pad = (s: string | number, n: number) => String(s).padEnd(n);
const padStart = (s: string | number, n: number) => String(s).padStart(n);
const clock = (e: MatchEvent) => {
  const limit = e.half === 1 ? 45 : 90;
  return e.minute >= limit ? `${limit}+${e.minute - limit + 1}'` : `${e.minute + 1}'`;
};

function playMatch(home: Club, away: Club) {
  const squad = (c: Club) => pack.players.filter((p) => p.clubId === c.id);
  /* Same club AI as in a season: style from the league rank, adapted to the opponent. */
  const league = createSeason({ seed, clubs: pack.clubs, players: pack.players, fixtures: [] });
  const tier = (c: Club, o: Club) =>
    tierAgainst(league.tiers.get(c.id)!, league.strength.get(c.id)!, league.strength.get(o.id)!);
  const homeSheet = autoTeamSheet({
    clubId: home.id,
    squad: squad(home),
    reputation: tier(home, away),
    tactics: tacticsOption("--home-tactics"),
  });
  const awaySheet = autoTeamSheet({
    clubId: away.id,
    squad: squad(away),
    reputation: tier(away, home),
    tactics: tacticsOption("--away-tactics"),
  });
  const r = simulateMatch({ seed, home: homeSheet, away: awaySheet });
  const clubOf = (side: string | null) => (side === "home" ? home : away);

  console.log(
    `\n  ${home.name}  ${r.score.home} - ${r.score.away}  ${away.name}    (seed ${seed})\n`,
  );
  for (const [club, sheet] of [
    [home, homeSheet],
    [away, awaySheet],
  ] as const) {
    const t = sheet.tactics;
    console.log(
      `  ${pad(club.name, 24)} ${t.formation}, ${t.style}, pressing ${t.pressing}, line ${t.line}`,
    );
  }

  console.log("\n  Highlights");
  for (const e of r.events) {
    const who = `${pad(clubOf(e.side).initials, 4)}`;
    if (e.type === "goal") {
      const assist = e.otherPlayerId ? `, assist ${name(e.otherPlayerId)}` : "";
      console.log(
        `  ${padStart(clock(e), 6)}  GOAL  ${who} ${name(e.playerId)} (${e.detail}${assist})`,
      );
    } else if (e.type === "yellow" || e.type === "red") {
      console.log(
        `  ${padStart(clock(e), 6)}  ${e.type === "red" ? "RED " : "YEL "}  ${who} ${name(e.playerId)}`,
      );
    } else if (e.type === "penalty") {
      console.log(`  ${padStart(clock(e), 6)}  PEN   ${who}`);
    } else if (e.type === "substitution") {
      console.log(
        `  ${padStart(clock(e), 6)}  SUB   ${who} ${name(e.otherPlayerId)} for ${name(e.playerId)}`,
      );
    } else if (e.type === "halfTime") {
      console.log("          --- half-time ---");
    }
  }

  const h = r.stats.home;
  const a = r.stats.away;
  console.log("\n  Stats");
  const rows: [string, number | string, number | string][] = [
    ["Possession", `${h.possession}%`, `${a.possession}%`],
    ["Shots", h.shots, a.shots],
    ["On target", h.shotsOnTarget, a.shotsOnTarget],
    ["Expected goals", h.expectedGoals, a.expectedGoals],
    ["Passes completed", `${h.passesCompleted}/${h.passes}`, `${a.passesCompleted}/${a.passes}`],
    ["Corners", h.corners, a.corners],
    ["Fouls", h.fouls, a.fouls],
    ["Yellow / red", `${h.yellowCards}/${h.redCards}`, `${a.yellowCards}/${a.redCards}`],
  ];
  for (const [label, x, y] of rows)
    console.log(`  ${pad(label, 18)} ${padStart(x, 8)}  ${padStart(y, 8)}`);

  for (const side of ["home", "away"] as const) {
    console.log(`\n  ${clubOf(side).name}`);
    for (const p of r.players.filter((l) => l.side === side)) {
      const extras = [
        p.goals ? `${p.goals} goal${p.goals > 1 ? "s" : ""}` : "",
        p.assists ? `${p.assists} assist${p.assists > 1 ? "s" : ""}` : "",
        p.redCard ? "sent off" : "",
        p.playerId === r.manOfTheMatch ? "MAN OF THE MATCH" : "",
      ].filter(Boolean);
      const player = playerById.get(p.playerId);
      console.log(
        `  ${pad(p.position, 4)} ${pad(name(p.playerId), 26)} ${padStart(player?.overall ?? "", 3)}  ` +
          `${padStart(p.rating.toFixed(1), 4)}  ${padStart(p.minutes, 2)}'  ${extras.join(", ")}`,
      );
    }
  }
}

function playSeason() {
  const season = createSeason({
    seed,
    clubs: pack.clubs,
    players: pack.players,
    fixtures: pack.fixtures,
  });
  const started = performance.now();
  for (const round of rounds(season)) playRound(season, round);
  const ms = performance.now() - started;
  const table = seasonTable(season);
  const club = (id: string) => pack.clubs.find((c) => c.id === id)!;

  console.log(`\n  ${pack.league.name} 2026-27, simulated in ${ms.toFixed(0)} ms (seed ${seed})\n`);
  console.log(`   #  ${pad("Club", 26)}  P   W   D   L   GF  GA   GD  Pts  Form`);
  table.forEach((r, i) => {
    console.log(
      `  ${padStart(i + 1, 2)}  ${pad(club(r.clubId).name, 26)}` +
        [r.played, r.won, r.drawn, r.lost, r.goalsFor, r.goalsAgainst]
          .map((n) => padStart(n, 3))
          .join(" ") +
        `  ${padStart((r.goalDifference > 0 ? "+" : "") + r.goalDifference, 3)}  ${padStart(r.points, 3)}  ${r.form.join("")}`,
    );
  });

  const totals = new Map<string, { goals: number; assists: number; ratings: number[] }>();
  for (const { result } of season.results) {
    for (const p of result.players) {
      const t = totals.get(p.playerId) ?? { goals: 0, assists: 0, ratings: [] };
      t.goals += p.goals;
      t.assists += p.assists;
      if (p.minutes >= 45) t.ratings.push(p.rating);
      totals.set(p.playerId, t);
    }
  }
  const label = (id: string) =>
    `${pad(name(id), 26)} ${pad(club(playerById.get(id)!.clubId).initials, 5)}`;
  console.log("\n  Top scorers");
  [...totals]
    .sort((a, b) => b[1].goals - a[1].goals || b[1].assists - a[1].assists)
    .slice(0, 10)
    .forEach(([id, t]) =>
      console.log(
        `  ${label(id)} ${padStart(t.goals, 3)} goals  ${padStart(t.assists, 2)} assists`,
      ),
    );
  const minGames = Math.floor(rounds(season).length / 2);
  console.log(`\n  Best average rating (${minGames}+ matches)`);
  [...totals]
    .filter(([, t]) => t.ratings.length >= minGames)
    .map(
      ([id, t]) =>
        [id, t.ratings.reduce((s, x) => s + x, 0) / t.ratings.length, t.ratings.length] as const,
    )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([id, avg, n]) => console.log(`  ${label(id)} ${avg.toFixed(2)}  (${n} matches)`));
}

if (homeArg && awayArg) playMatch(findClub(homeArg), findClub(awayArg));
else playSeason();
