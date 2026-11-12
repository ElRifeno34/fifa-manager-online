/**
 * Event-driven match simulation. A match is a chain of possessions; each one goes through build-up
 * (midfield), the final third and, if it gets there, a shot. Every step is a draw weighted by the
 * players' attributes, their fit, fatigue and form, and both teams' tactics.
 */
import { isFlank, lineOf, positionFit, type Line } from "./positions.ts";
import { createRng, weightedIndex } from "./rng.ts";
import type {
  Attributes,
  EnginePlayer,
  Level,
  MatchEvent,
  MatchEventType,
  MatchResult,
  PlayerMatchLine,
  Position,
  Side,
  Style,
  TeamSheet,
  TeamStats,
} from "./types.ts";

/**
 * Engine parameters, fitted by `npm run tune` on football-data.co.uk: rates on the full 2025-26
 * season, club strengths on the 2026-27 odds;
 * `npm run benchmark` measures the gap. See docs/ARCHITECTURE.md.
 */
export const TUNING = {
  possessionSeconds: { possession: 47, balanced: 45, direct: 43 } as Record<Style, number>,
  /** Length factor of a possession lost in midfield, in the final third, or ending in a shot. */
  stageLength: [0.9, 1, 1.1],
  passesPerPossession: { possession: 7, balanced: 5, direct: 3.5 } as Record<Style, number>,
  /** Logit of getting through midfield, and of turning the final third into a chance. */
  midBase: 0,
  finalBase: -1.414,
  /** Logit points per attribute point of difference between the two units. */
  slope: 0.36,
  /** Beyond about this many attribute points, a wider gap barely matters more. */
  gapCap: 1.8,
  /** Home side plays with slightly better attributes. */
  homeBoost: 0.036,
  foulPerPossession: 0.184,
  yellowPerFoul: 0.168,
  redPerFoul: 0.0021,
  saveShare: 0.259,
  /** Multiplies every open-play and set-piece chance quality (penalties apart). */
  xgScale: 1.237,
  /** Share of attributes gained (or lost) per unit of familiarity above (or below) 0.7. */
  familiarityEffect: 0.08,
  /** Multiplies the chance of winning a corner. */
  cornerRate: 0.794,
  /** Logit shift from the score late in the match (see gameState). */
  gameState: 0.202,
  /** Attribute level of an average finisher and keeper in shot quality. */
  shotReference: 14.5,
  /** Weight of the shooter's and the keeper's level in the chance of scoring. */
  shotSlope: 0.035,
  fatiguePerMinute: 0.33,
  /** Share of performance lost at 100 % fatigue. */
  fatigueEffect: 0.3,
  xg: {
    through: 0.132,
    cross: 0.057,
    dribble: 0.084,
    longShot: 0.022,
    counter: 0.171,
    corner: 0.048,
    freeKick: 0.04,
    penalty: 0.76,
  } as Record<ChanceType, number>,
};

type ChanceType =
  "through" | "cross" | "dribble" | "longShot" | "counter" | "corner" | "freeKick" | "penalty";

const MAX_SUBS = 5;
const SUB_WINDOWS = [60, 72, 82];
const PRESS_FATIGUE: Record<Level, number> = { low: 0.9, medium: 1, high: 1.2 };

interface Live {
  player: EnginePlayer;
  side: Side;
  slot: Position;
  line: Line;
  fit: number;
  fatigue: number;
  form: number;
  on: boolean;
  used: boolean;
  minuteIn: number;
  minuteOut: number | null;
  yellow: number;
  red: boolean;
  goals: number;
  assists: number;
  shots: number;
  delta: number;
}

interface Team {
  side: Side;
  sheet: TeamSheet;
  home: boolean;
  players: Live[];
  subs: number;
  window: number;
  seconds: number;
  conceded: number;
  stats: TeamStats;
  /** Team profile, recomputed every few minutes (fatigue) and after any change on the pitch. */
  profile: Profile | null;
  profileAt: number;
}

interface Profile {
  build: number;
  resist: number;
  midDefence: number;
  attack: number;
  defence: number;
  attackPace: number;
  defencePace: number;
  crossing: number;
  aerial: number;
}

const emptyStats = (): TeamStats => ({
  goals: 0,
  possession: 0,
  shots: 0,
  shotsOnTarget: 0,
  expectedGoals: 0,
  passes: 0,
  passesCompleted: 0,
  pressingSequences: 0,
  midfieldRegains: 0,
  counterAttacks: 0,
  corners: 0,
  fouls: 0,
  yellowCards: 0,
  redCards: 0,
});

const logistic = (x: number) => 1 / (1 + Math.exp(-x));
/** Level gap between two units, saturating: a big gap counts, but not without limit. */
const gap = (x: number) => TUNING.gapCap * Math.tanh(x / TUNING.gapCap);
const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));
const round1 = (x: number) => Math.round(x * 10) / 10;

function live(player: EnginePlayer, side: Side, slot: Position, sheet: TeamSheet): Live {
  const condition = sheet.condition?.[player.id];
  return {
    player,
    side,
    slot,
    line: lineOf(slot),
    fit: positionFit(player, slot),
    fatigue: condition?.fatigue ?? 0,
    form: condition?.form ?? 0,
    on: false,
    used: false,
    minuteIn: 0,
    minuteOut: null,
    yellow: 0,
    red: false,
    goals: 0,
    assists: 0,
    shots: 0,
    delta: 0,
  };
}

function validate(sheet: TeamSheet) {
  if (sheet.starters.length !== 11) {
    throw new Error(`${sheet.clubId}: ${sheet.starters.length} starters instead of 11`);
  }
  const ids = [...sheet.starters.map((s) => s.player.id), ...sheet.bench.map((p) => p.id)];
  if (new Set(ids).size !== ids.length)
    throw new Error(`${sheet.clubId}: a player is listed twice`);
}

function team(sheet: TeamSheet, side: Side): Team {
  validate(sheet);
  const starters = sheet.starters.map((s) => {
    const l = live(s.player, side, s.position, sheet);
    l.on = l.used = true;
    return l;
  });
  const bench = sheet.bench.map((p) => live(p, side, p.position, sheet));
  return {
    side,
    sheet,
    home: side === "home",
    players: [...starters, ...bench],
    subs: 0,
    window: 0,
    seconds: 0,
    conceded: 0,
    stats: emptyStats(),
    profile: null,
    profileAt: 0,
  };
}

export function simulateMatch(input: {
  seed: number;
  home: TeamSheet;
  away: TeamSheet;
}): MatchResult {
  const rng = createRng(input.seed);
  const teams: Record<Side, Team> = {
    home: team(input.home, "home"),
    away: team(input.away, "away"),
  };
  const events: MatchEvent[] = [];
  const T = TUNING;

  let half: 1 | 2 = 1;
  let clock = 0;
  let duration = 0;
  /** How far the current possession went: 0 lost in midfield, 1 final third, 2 shot. */
  let stage = 0;
  /** Events of the possession being played, timed once its length is known. */
  let pending: { event: MatchEvent; at: number }[] | null = null;

  const other = (side: Side): Side => (side === "home" ? "away" : "home");
  const onPitch = (t: Team) => t.players.filter((l) => l.on);
  const keeperOf = (t: Team) => t.players.find((l) => l.on && l.slot === "GB");

  function attr(l: Live, key: keyof Attributes): number {
    const t = teams[l.side];
    return (
      l.player.attributes[key] *
      l.fit *
      (1 - (l.fatigue / 100) * T.fatigueEffect) *
      (1 + l.form * 0.04) *
      (1 + (t.sheet.levelAdjustment ?? 0)) *
      (1 + ((t.sheet.familiarity ?? 0.7) - 0.7) * T.familiarityEffect) *
      (t.home ? 1 + T.homeBoost : 1)
    );
  }

  /** Weighted average of a value over the outfield players, shrunk when a team is down to ten. */
  function unit(t: Team, weight: (l: Live) => number, value: (l: Live) => number): number {
    let total = 0;
    let weights = 0;
    let count = 0;
    for (const l of t.players) {
      if (!l.on) continue;
      count++;
      if (l.line === "goal") continue;
      const w = weight(l);
      total += w * value(l);
      weights += w;
    }
    const manpower = 0.6 + (0.4 * count) / 11;
    return (weights > 0 ? total / weights : 8) * manpower;
  }

  function profile(t: Team): Profile {
    if (t.profile && clock - t.profileAt < 300) return t.profile;
    t.profileAt = clock;
    t.profile = computeProfile(t);
    return t.profile;
  }

  function computeProfile(t: Team): Profile {
    const press = t.sheet.tactics.pressing;
    const byLine = (d: number, m: number, a: number) => (l: Live) =>
      l.line === "defence" ? d : l.line === "midfield" ? m : a;
    return {
      build: unit(
        t,
        byLine(0.5, 1, 0.4),
        (l) =>
          0.4 * attr(l, "passing") +
          0.25 * attr(l, "vision") +
          0.15 * attr(l, "dribbling") +
          0.2 * attr(l, "composure"),
      ),
      resist: unit(
        t,
        byLine(0.5, 1, 0.4),
        (l) => 0.35 * attr(l, "passing") + 0.35 * attr(l, "dribbling") + 0.3 * attr(l, "composure"),
      ),
      midDefence: unit(
        t,
        byLine(0.4, 1, press === "high" ? 0.8 : 0.4),
        (l) =>
          0.35 * attr(l, "tackling") +
          0.25 * attr(l, "marking") +
          0.25 * attr(l, "positioning") +
          0.15 * attr(l, "stamina"),
      ),
      attack: unit(
        t,
        (l) => (l.slot === "MOC" ? 1 : byLine(0.15, 0.6, 1)(l)),
        (l) =>
          0.2 * attr(l, "finishing") +
          0.25 * attr(l, "dribbling") +
          0.2 * attr(l, "vision") +
          0.2 * attr(l, "positioning") +
          0.15 * attr(l, "pace"),
      ),
      defence: unit(
        t,
        (l) => (l.slot === "MDC" ? 0.7 : byLine(1, 0.3, 0.1)(l)),
        (l) =>
          0.3 * attr(l, "marking") +
          0.3 * attr(l, "tackling") +
          0.3 * attr(l, "positioning") +
          0.1 * attr(l, "strength"),
      ),
      attackPace: unit(
        t,
        (l) => (l.line === "attack" || l.slot === "MOC" ? 1 : 0),
        (l) => attr(l, "pace"),
      ),
      defencePace: unit(
        t,
        (l) => (l.line === "defence" ? 1 : 0),
        (l) => attr(l, "pace"),
      ),
      crossing: unit(
        t,
        (l) => (isFlank(l.slot) ? 1 : 0),
        (l) => attr(l, "crossing"),
      ),
      aerial: unit(
        t,
        (l) => (l.slot === "DC" ? 1 : 0.2),
        (l) => attr(l, "strength"),
      ),
    };
  }

  function pick(t: Team, weight: (l: Live) => number, exclude?: Live): Live {
    const candidates = onPitch(t).filter((l) => l !== exclude);
    const weights = candidates.map((l) => Math.max(weight(l), 0.001));
    return candidates[weightedIndex(rng, weights)]!;
  }

  function emit(
    type: MatchEventType,
    side: Side | null,
    attacking: Side,
    progress: number,
    extra: Partial<Pick<MatchEvent, "playerId" | "otherPlayerId" | "detail">> & {
      at?: number;
      y?: number;
    } = {},
  ) {
    const x = attacking === "home" ? progress : 100 - progress;
    const event: MatchEvent = {
      half,
      minute: Math.floor(clock / 60),
      second: Math.floor(clock % 60),
      type,
      side,
      ball: { x: round1(clamp(x, 0, 100)), y: round1(extra.y ?? 20 + rng.next() * 60) },
    };
    if (extra.playerId) event.playerId = extra.playerId;
    if (extra.otherPlayerId) event.otherPlayerId = extra.otherPlayerId;
    if (extra.detail) event.detail = extra.detail;
    events.push(event);
    pending?.push({ event, at: extra.at ?? 0 });
  }

  function timePending() {
    for (const { event, at } of pending ?? []) {
      const seconds = clock + duration * at;
      event.minute = Math.floor(seconds / 60);
      event.second = Math.floor(seconds % 60);
    }
    pending = null;
  }

  const minuteNow = () => Math.floor(clock / 60);

  function sendOff(l: Live) {
    const t = teams[l.side];
    l.on = false;
    l.red = true;
    t.profile = null;
    l.minuteOut = minuteNow();
    t.stats.redCards++;
    l.delta -= 1.5;
    if (l.slot !== "GB") return;
    /* A keeper sent off: the bench keeper comes on for an outfield player, or someone goes in goal. */
    const spare = t.players.find((p) => !p.used && p.player.position === "GB");
    const outfield = onPitch(t).sort((a, b) => a.player.overall * a.fit - b.player.overall * b.fit);
    if (spare && t.subs < MAX_SUBS && outfield.length > 0) {
      const off = outfield[0]!;
      off.on = false;
      off.minuteOut = minuteNow();
      bringOn(t, spare, "GB", off);
    } else if (outfield.length > 0) {
      const keeper = outfield[0]!;
      keeper.slot = "GB";
      keeper.line = "goal";
      keeper.fit = positionFit(keeper.player, "GB");
    }
  }

  function bringOn(t: Team, l: Live, slot: Position, off: Live) {
    l.on = l.used = true;
    l.slot = slot;
    l.line = lineOf(slot);
    l.fit = positionFit(l.player, slot);
    l.minuteIn = minuteNow();
    t.subs++;
    t.profile = null;
    emit("substitution", t.side, t.side, 50, {
      playerId: off.player.id,
      otherPlayerId: l.player.id,
      y: 0,
    });
  }

  function foul(defending: Team, attacking: Team, progress: number) {
    const fouler = pick(defending, (l) =>
      l.line === "attack" ? 0.5 : 1 + (12 - l.player.attributes.tackling) * 0.05,
    );
    const victim = pick(attacking, (l) => (l.line === "goal" ? 0 : 1));
    defending.stats.fouls++;
    fouler.delta -= 0.05;
    emit("foul", defending.side, attacking.side, progress, {
      playerId: fouler.player.id,
      otherPlayerId: victim.player.id,
    });
    const pressing = defending.sheet.tactics.pressing === "high" ? 1.15 : 1;
    if (rng.chance(T.redPerFoul)) {
      emit("red", defending.side, attacking.side, progress, { playerId: fouler.player.id });
      sendOff(fouler);
    } else if (
      /* A booked player goes into challenges more carefully. */
      rng.chance(T.yellowPerFoul * pressing * (fouler.yellow === 1 ? 0.4 : 1))
    ) {
      fouler.yellow++;
      defending.stats.yellowCards++;
      fouler.delta -= 0.4;
      emit("yellow", defending.side, attacking.side, progress, { playerId: fouler.player.id });
      if (fouler.yellow === 2) {
        emit("red", defending.side, attacking.side, progress, {
          playerId: fouler.player.id,
          detail: "second yellow",
        });
        sendOff(fouler);
      }
    }
    return fouler;
  }

  const SHOOTER: Record<Position, number> = {
    GB: 0,
    DC: 0.25,
    DG: 0.3,
    DD: 0.3,
    MDC: 0.4,
    MC: 0.7,
    MG: 1,
    MD: 1,
    MOC: 1.4,
    AG: 1.4,
    AD: 1.4,
    BU: 1.3,
  };
  const CREATOR: Record<Position, number> = {
    GB: 0,
    DC: 0.3,
    DG: 0.7,
    DD: 0.7,
    MDC: 1,
    MC: 2,
    MG: 1.5,
    MD: 1.5,
    MOC: 3,
    AG: 2,
    AD: 2,
    BU: 1,
  };

  function shooterFor(t: Team, type: ChanceType): Live {
    if (type === "penalty" || type === "freeKick") {
      return onPitch(t)
        .filter((l) => l.line !== "goal")
        .sort(
          (a, b) =>
            b.player.attributes.finishing +
            b.player.attributes.composure -
            (a.player.attributes.finishing + a.player.attributes.composure),
        )[0]!;
    }
    if (type === "cross" || type === "corner") {
      return pick(t, (l) => {
        const base =
          l.slot === "BU"
            ? 2
            : l.slot === "DC"
              ? type === "corner"
                ? 1.2
                : 0.1
              : l.line === "attack" || l.slot === "MOC"
                ? 1
                : l.line === "midfield"
                  ? 0.6
                  : l.line === "goal"
                    ? 0
                    : 0.15;
        return (base * attr(l, "strength")) / 12;
      });
    }
    if (type === "longShot") {
      return pick(t, (l) => {
        const base = l.slot === "MC" || l.slot === "MOC" ? 2 : l.line === "defence" ? 0.3 : 1;
        return base * (l.line === "goal" ? 0 : 1) * (attr(l, "finishing") / 12);
      });
    }
    /* Position decides most of who shoots; finishing tilts it without making strikers take all. */
    return pick(
      t,
      (l) => SHOOTER[l.slot] * (0.5 + (attr(l, "finishing") + attr(l, "positioning")) / 40),
    );
  }

  function assistFor(t: Team, type: ChanceType, shooter: Live): Live | null {
    if (type === "penalty" || type === "freeKick") return null;
    if ((type === "dribble" && rng.chance(0.5)) || (type === "longShot" && rng.chance(0.6))) {
      return null;
    }
    if (type === "cross" || type === "corner") {
      return pick(
        t,
        (l) => (isFlank(l.slot) ? 1.5 : type === "corner" ? 0.5 : 0.05) * attr(l, "crossing") ** 2,
        shooter,
      );
    }
    return pick(
      t,
      (l) => (CREATOR[l.slot] * (attr(l, "vision") + attr(l, "passing"))) / 20,
      shooter,
    );
  }

  /** Returns true on a goal. */
  function shot(
    attacking: Team,
    defending: Team,
    type: ChanceType,
    defenceProfile: Profile,
    at: number,
  ): boolean {
    const shooter = shooterFor(attacking, type);
    const assist = assistFor(attacking, type, shooter);
    const keeper = keeperOf(defending);
    const reflexes = keeper ? attr(keeper, "reflexes") : 3;
    const placing = keeper ? attr(keeper, "gkPositioning") : 3;

    let quality = T.xg[type] * (type === "penalty" ? 1 : T.xgScale);
    if (type === "cross" || type === "corner") {
      quality *= clamp(1 + (attr(shooter, "strength") - defenceProfile.aerial) * 0.04, 0.6, 1.5);
    }
    const finishing = attr(shooter, "finishing") * 0.65 + attr(shooter, "composure") * 0.35;
    const stopping = reflexes * 0.6 + placing * 0.4;
    const pGoal =
      type === "penalty"
        ? clamp(quality + (finishing - stopping) * 0.01, 0.5, 0.92)
        : clamp(
            (quality * (1 + (finishing - T.shotReference) * T.shotSlope)) /
              (1 + (stopping - T.shotReference) * T.shotSlope),
            0.005,
            0.9,
          );

    stage = 2;
    attacking.stats.shots++;
    attacking.stats.expectedGoals += pGoal;
    shooter.shots++;
    const progress = type === "longShot" ? 75 : type === "penalty" ? 89 : 88;
    emit("shot", attacking.side, attacking.side, progress, {
      playerId: shooter.player.id,
      detail: type,
      at,
    });

    if (rng.chance(pGoal)) {
      attacking.stats.goals++;
      attacking.stats.shotsOnTarget++;
      defending.conceded++;
      shooter.goals++;
      shooter.delta += 1;
      if (assist) {
        assist.assists++;
        assist.delta += 0.6;
      }
      emit("goal", attacking.side, attacking.side, 100, {
        playerId: shooter.player.id,
        ...(assist ? { otherPlayerId: assist.player.id } : {}),
        detail: type,
        at,
        y: 50,
      });
      return true;
    }
    if (rng.chance(T.saveShare)) {
      attacking.stats.shotsOnTarget++;
      shooter.delta += 0.1;
      if (keeper) {
        keeper.delta += 0.25;
        emit("save", defending.side, attacking.side, 98, { playerId: keeper.player.id, at, y: 50 });
      }
      if (rng.chance(0.3 * T.cornerRate)) corner(attacking, defending, defenceProfile, at);
      return false;
    }
    shooter.delta -= 0.05;
    if (rng.chance(0.15 * T.cornerRate)) corner(attacking, defending, defenceProfile, at);
    return false;
  }

  function corner(attacking: Team, defending: Team, defenceProfile: Profile, at: number) {
    attacking.stats.corners++;
    emit("corner", attacking.side, attacking.side, 100, { at, y: rng.chance(0.5) ? 0 : 100 });
    if (rng.chance(0.35)) shot(attacking, defending, "corner", defenceProfile, at);
  }

  function averageFatigue(t: Team): number {
    const outfield = t.players.filter((l) => l.on && l.line !== "goal");
    return outfield.reduce((s, l) => s + l.fatigue, 0) / Math.max(outfield.length, 1);
  }

  /**
   * Late in a match the score changes behaviour: a side protecting a narrow lead stops taking risks
   * and the trailing side pushes, while level teams turn cautious.
   */
  function gameState(attacking: Team, defending: Team): number {
    const minute = minuteNow();
    if (minute < 65) return 0;
    const lead = attacking.stats.goals - defending.stats.goals;
    if (lead === 0) return minute >= 80 ? -T.gameState : -T.gameState / 2;
    if (lead === -1) return T.gameState;
    if (lead === 1) return -T.gameState;
    return 0;
  }

  /** Plays one possession; returns who has the ball next and whether it is a counter-attack. */
  function possession(
    attacking: Team,
    defending: Team,
    counter: boolean,
  ): {
    next: Side;
    counter: boolean;
  } {
    const style = attacking.sheet.tactics.style;
    const defend = defending.sheet.tactics;
    const a = profile(attacking);
    const d = profile(defending);
    const lose = (chanceOfCounter: number, progress: number, at: number) => {
      const winner = pick(defending, (l) =>
        l.line === "goal" ? 0 : attr(l, "tackling") + attr(l, "positioning"),
      );
      winner.delta += 0.08;
      emit("turnover", defending.side, attacking.side, progress, {
        playerId: winner.player.id,
        at,
      });
      return { next: defending.side, counter: rng.chance(chanceOfCounter) };
    };

    const passes = Math.max(1, Math.round(T.passesPerPossession[style] * (0.5 + rng.next())));
    attacking.stats.passes += passes;
    attacking.stats.passesCompleted += passes;
    if (counter) attacking.stats.counterAttacks++;
    const passer = pick(attacking, (l) =>
      l.line === "goal" ? 0.2 : (l.line === "midfield" ? 2 : 1) * attr(l, "passing"),
    );
    emit("pass", attacking.side, attacking.side, counter ? 45 : 25, {
      playerId: passer.player.id,
    });

    /* Fouls stop play wherever the ball is. */
    let beatPress = false;
    let skipMidfield = counter;
    if (!skipMidfield && defend.pressing === "high") defending.stats.pressingSequences++;
    if (
      rng.chance(
        T.foulPerPossession *
          (defend.pressing === "high" ? 1.1 : defend.pressing === "low" ? 0.95 : 1),
      )
    ) {
      const zone = weightedIndex(rng, [0.72, 0.265, 0.015]);
      if (zone === 0) {
        foul(defending, attacking, 45);
        skipMidfield = true;
      } else if (zone === 1) {
        foul(defending, attacking, 75);
        attacking.stats.passes++;
        emit("freeKick", attacking.side, attacking.side, 75, { at: 0.5 });
        if (rng.chance(0.3)) {
          shot(attacking, defending, "freeKick", d, 0.6);
          return { next: defending.side, counter: false };
        }
        if (rng.chance(0.3)) {
          shot(attacking, defending, "cross", d, 0.6);
          return { next: defending.side, counter: false };
        }
        return lose(0.05, 85, 0.6);
      } else {
        const fouler = foul(defending, attacking, 92);
        fouler.delta -= 0.5;
        emit("penalty", attacking.side, attacking.side, 89, { at: 0.5 });
        shot(attacking, defending, "penalty", d, 0.7);
        return { next: defending.side, counter: false };
      }
    }

    if (!skipMidfield) {
      let logit =
        T.midBase +
        T.slope * gap(a.build - d.midDefence) +
        (style === "possession" ? 0.15 : style === "direct" ? -0.2 : 0);
      /* A press only bites while the pressers still have legs. */
      if (defend.pressing === "high") {
        logit += (-0.45 + 0.06 * (a.resist - 12)) * (1 - averageFatigue(defending) / 60);
      }
      if (defend.pressing === "low") logit += 0.3;
      if (defend.line === "high") logit -= 0.08;
      if (defend.line === "low") logit += 0.08;
      if (!rng.chance(logistic(logit))) {
        attacking.stats.passesCompleted--;
        defending.stats.midfieldRegains++;
        const counterChance = { low: 0.05, medium: 0.09, high: 0.2 }[defend.pressing];
        return lose(counterChance, 40, 0.4);
      }
      beatPress = defend.pressing === "high";
      passer.delta += 0.03;
      stage = 1;
    }
    const carrier = pick(attacking, (l) =>
      l.line === "attack" || l.slot === "MOC" ? 2 : l.line === "midfield" ? 1 : 0.2,
    );
    emit("pass", attacking.side, attacking.side, 62, { playerId: carrier.player.id, at: 0.5 });

    let logit =
      T.finalBase +
      T.slope * gap(a.attack - d.defence) +
      (style === "direct" ? 0.1 : style === "possession" ? 0.08 : 0);
    if (beatPress) logit += 0.15;
    if (defend.line === "high") logit += 0.05 + 0.08 * (a.attackPace - d.defencePace);
    if (defend.line === "low") logit -= 0.05 + (style === "direct" ? 0.2 : 0);
    /* A deep line starts attacks far from goal; a high one keeps the team close to it. */
    const ownLine = attacking.sheet.tactics.line;
    if (ownLine === "low") logit -= 0.12;
    if (ownLine === "high") logit += 0.05;
    if (counter) logit += 0.5;
    logit += gameState(attacking, defending);
    if (!rng.chance(logistic(logit))) {
      if (rng.chance(0.12 * T.cornerRate)) {
        corner(attacking, defending, d, 0.8);
        return { next: defending.side, counter: false };
      }
      attacking.stats.passesCompleted--;
      return lose(0.07, 72, 0.7);
    }

    let type: ChanceType;
    if (counter) type = "counter";
    else {
      const kinds: ChanceType[] = ["through", "cross", "dribble", "longShot"];
      type =
        kinds[
          weightedIndex(rng, [
            Math.max(
              0.2,
              1 +
                0.15 * (a.attackPace - d.defencePace) +
                (defend.line === "high" ? 0.8 : defend.line === "low" ? -0.5 : 0) +
                (style === "direct" ? 0.4 : 0),
            ),
            a.crossing / 12 + (style === "direct" ? 0.3 : 0),
            a.attack / 12,
            0.6 + (defend.line === "low" ? 0.4 : 0),
          ])
        ]!;
    }
    emit(type === "dribble" ? "dribble" : "pass", attacking.side, attacking.side, 80, {
      playerId: carrier.player.id,
      at: 0.8,
    });
    carrier.delta += 0.05;
    shot(attacking, defending, type, d, 0.9);
    return { next: defending.side, counter: false };
  }

  function tire(t: Team, seconds: number) {
    const pressing = t.sheet.tactics.pressing;
    for (const l of t.players) {
      if (!l.on) continue;
      const stamina = l.player.attributes.stamina;
      /* Pressing costs the most to those who lack the legs for it. */
      const press =
        PRESS_FATIGUE[pressing] + (pressing === "high" ? Math.max(0, 12 - stamina) * 0.06 : 0);
      const rate =
        T.fatiguePerMinute * press * (1.45 - 0.045 * stamina) * (l.line === "goal" ? 0.3 : 1);
      l.fatigue = Math.min(100, l.fatigue + (seconds / 60) * rate);
    }
  }

  /** The assistant replaces tired players by fresher ones from the bench. */
  function substitutions(t: Team) {
    const minute = minuteNow();
    while (t.window < SUB_WINDOWS.length && minute >= SUB_WINDOWS[t.window]!) {
      t.window++;
      const tired = onPitch(t)
        .filter((l) => l.line !== "goal" && l.fatigue >= 10)
        .sort((a, b) => b.fatigue - a.fatigue)
        .slice(0, 2);
      for (const off of tired) {
        if (t.subs >= MAX_SUBS) return;
        const value = (l: Live, slot: Position) =>
          l.player.overall * positionFit(l.player, slot) * (1 - (l.fatigue / 100) * 0.5);
        const current = value(off, off.slot);
        const options = t.players
          .filter((l) => !l.used && l.player.position !== "GB")
          .sort((a, b) => value(b, off.slot) - value(a, off.slot));
        const best = options[0];
        /* Fresh legs are worth a small drop in level. */
        if (!best || value(best, off.slot) < current * 0.92) continue;
        off.on = false;
        off.minuteOut = minute;
        bringOn(t, best, off.slot, off);
      }
    }
  }

  let possessor: Side = "home";
  let counter = false;
  for (const h of [1, 2] as const) {
    half = h;
    clock = h === 1 ? 0 : 45 * 60;
    duration = 0;
    const end = (h === 1 ? 45 + rng.int(1, 4) : 90 + rng.int(2, 6)) * 60;
    possessor = h === 1 ? "home" : "away";
    counter = false;
    emit("kickoff", possessor, possessor, 50, { y: 50 });
    while (clock < end) {
      if (h === 2) {
        substitutions(teams.home);
        substitutions(teams.away);
      }
      const attacking = teams[possessor];
      const defending = teams[other(possessor)];
      const goalsBefore = attacking.stats.goals;
      stage = 0;
      pending = [];
      const outcome = possession(attacking, defending, counter);
      /* Possession time follows the play: a ball lost in midfield is short, an attack lasts. */
      duration =
        T.possessionSeconds[attacking.sheet.tactics.style] *
        T.stageLength[stage]! *
        (0.7 + rng.next() * 0.6);
      timePending();
      attacking.seconds += duration;
      tire(attacking, duration);
      tire(defending, duration);
      clock += duration;
      possessor = outcome.next;
      counter = outcome.counter;
      if (attacking.stats.goals > goalsBefore) {
        duration = 0;
        emit("kickoff", possessor, possessor, 50, { y: 50 });
      }
    }
    duration = 0;
    emit(h === 1 ? "halfTime" : "fullTime", null, "home", 50, { y: 50 });
  }

  return finish(teams, events);
}

function finish(teams: Record<Side, Team>, events: MatchEvent[]): MatchResult {
  const home = teams.home;
  const away = teams.away;
  /* Possession is based on simulated time on the ball, not a proxy such as completed passes. */
  const total = home.seconds + away.seconds || 1;
  home.stats.possession = Math.round((home.seconds / total) * 100);
  away.stats.possession = 100 - home.stats.possession;
  for (const t of [home, away]) t.stats.expectedGoals = round1(t.stats.expectedGoals);

  const players: PlayerMatchLine[] = [];
  for (const t of [home, away]) {
    const goalsFor = t.stats.goals;
    const goalsAgainst = t.conceded;
    const result = Math.sign(goalsFor - goalsAgainst);
    for (const l of t.players) {
      if (!l.used) continue;
      const minutes = (l.minuteOut ?? 90) - l.minuteIn;
      let delta = l.delta + result * 0.3;
      const slot = l.slot;
      if (slot === "GB") delta -= 0.3 * goalsAgainst;
      else if (l.line === "defence") delta -= 0.12 * goalsAgainst;
      if (goalsAgainst === 0 && minutes >= 60) {
        delta += slot === "GB" ? 0.6 : l.line === "defence" ? 0.35 : slot === "MDC" ? 0.15 : 0;
      }
      if (minutes < 20) delta *= 0.5;
      players.push({
        playerId: l.player.id,
        side: t.side,
        position: slot,
        minutes: Math.max(0, minutes),
        rating: round1(clamp(6 + delta, 3, 10)),
        goals: l.goals,
        assists: l.assists,
        shots: l.shots,
        yellowCards: l.yellow,
        redCard: l.red,
        fatigue: Math.round(l.fatigue),
      });
    }
  }
  const winner = Math.sign(home.stats.goals - away.stats.goals);
  const motm = [...players].sort(
    (a, b) =>
      b.rating - a.rating ||
      (b.side === "home" ? winner : -winner) - (a.side === "home" ? winner : -winner) ||
      b.goals - a.goals,
  )[0]!;

  return {
    score: { home: home.stats.goals, away: away.stats.goals },
    stats: { home: home.stats, away: away.stats },
    players,
    manOfTheMatch: motm.playerId,
    events,
  };
}
