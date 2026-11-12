import { useState } from "react";
import { ArrowLeft, Play } from "lucide-react";
import { Link } from "react-router";
import { autoTeamSheet, simulateMatch } from "@fmo/engine";
import type {
  Attributes,
  EnginePlayer,
  Formation,
  Level,
  MatchEvent,
  MatchResult,
  Position,
  Style,
  Tactics,
} from "@fmo/engine";

type PresetId = "control" | "pressing" | "counter";
type SelectOption<T extends string> = { value: T; label: string };

const PRESETS: Record<
  PresetId,
  {
    label: string;
    identity: string;
    level: number;
    bonuses: Partial<EnginePlayer["attributes"]>;
    tactics: Tactics;
  }
> = {
  control: {
    label: "Collectif technique",
    identity: "Circulation et maîtrise du ballon",
    level: 14,
    bonuses: { passing: 3, vision: 3, dribbling: 2, composure: 1 },
    tactics: { formation: "4-3-3", style: "possession", pressing: "medium", line: "high" },
  },
  pressing: {
    label: "Collectif intense",
    identity: "Pressing haut et récupération rapide",
    level: 14,
    bonuses: { stamina: 4, pace: 2, tackling: 2, positioning: 1 },
    tactics: { formation: "4-2-3-1", style: "balanced", pressing: "high", line: "high" },
  },
  counter: {
    label: "Collectif de transition",
    identity: "Bloc prudent et attaques directes",
    level: 13,
    bonuses: { pace: 3, strength: 2, finishing: 2, crossing: 1 },
    tactics: { formation: "4-4-2", style: "direct", pressing: "medium", line: "low" },
  },
};

const SQUAD_POSITIONS: Position[] = [
  "GB",
  "GB",
  "DC",
  "DC",
  "DC",
  "DG",
  "DD",
  "DG",
  "MDC",
  "MDC",
  "MC",
  "MC",
  "MC",
  "MOC",
  "MG",
  "MD",
  "AG",
  "AD",
  "BU",
  "BU",
];
const VARIATION = [0, 1, -1, 0, 2, -2, 1, 0, -1, 2, -2, 0, 1, -1, 0, 2, -2, 1, 0, -1];
const FORMATIONS: SelectOption<Formation>[] = [
  { value: "4-4-2", label: "4-4-2" },
  { value: "4-3-3", label: "4-3-3" },
  { value: "4-2-3-1", label: "4-2-3-1" },
  { value: "3-5-2", label: "3-5-2" },
  { value: "5-3-2", label: "5-3-2" },
];
const STYLES: SelectOption<Style>[] = [
  { value: "possession", label: "Possession" },
  { value: "balanced", label: "Équilibré" },
  { value: "direct", label: "Jeu direct" },
];
const LEVELS: SelectOption<Level>[] = [
  { value: "low", label: "Bas" },
  { value: "medium", label: "Moyen" },
  { value: "high", label: "Haut" },
];
const PRESET_OPTIONS: SelectOption<PresetId>[] = Object.entries(PRESETS).map(([value, preset]) => ({
  value: value as PresetId,
  label: preset.label,
}));

function bounded(value: number) {
  return Math.max(1, Math.min(20, Math.round(value)));
}

function buildSquad(id: PresetId): EnginePlayer[] {
  const preset = PRESETS[id];
  return SQUAD_POSITIONS.map((position, index) => {
    const level = bounded(preset.level + VARIATION[index]!);
    const goalkeeper = position === "GB";
    const defender = ["DC", "DG", "DD"].includes(position);
    const midfielder = ["MDC", "MC", "MOC", "MG", "MD"].includes(position);
    const attacker = ["AG", "AD", "BU"].includes(position);
    const skill = (key: keyof Attributes, roleBonus = 0, goalkeeperSkill = false) =>
      bounded(
        (goalkeeperSkill ? (goalkeeper ? level : 3) : level) +
          (preset.bonuses[key] ?? 0) +
          roleBonus +
          (goalkeeper && key.startsWith("gk") ? 2 : 0),
      );
    const attributes: Attributes = {
      passing: skill("passing", midfielder ? 1 : 0),
      dribbling: skill("dribbling"),
      finishing: skill("finishing", attacker ? 1 : 0),
      crossing: skill("crossing", attacker ? 1 : 0),
      pace: skill("pace", attacker ? 1 : 0),
      stamina: skill("stamina"),
      strength: skill("strength", defender ? 1 : 0),
      vision: skill("vision", midfielder ? 1 : 0),
      positioning: skill("positioning", defender ? 1 : midfielder ? 1 : 0),
      composure: skill("composure", attacker ? 1 : 0),
      tackling: skill("tackling", defender ? 1 : 0),
      marking: skill("marking", defender ? 1 : 0),
      reflexes: skill("reflexes", 0, true),
      gkPositioning: skill("gkPositioning", 0, true),
      gkDistribution: skill("gkDistribution", 0, true),
    };

    const role =
      position === "GB" ? "Gardien" : defender ? "Défenseur" : midfielder ? "Milieu" : "Attaquant";
    const number = SQUAD_POSITIONS.slice(0, index + 1).filter((item) => item === position).length;
    return {
      id: `${id}-${index + 1}`,
      name: `${role} ${number}`,
      position,
      overall: Math.round(level * 5),
      attributes,
    };
  });
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-ink-2">
      {label}
      <select
        className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-club"
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TacticControls({
  title,
  tactics,
  onChange,
}: {
  title: string;
  tactics: Tactics;
  onChange: (tactics: Tactics) => void;
}) {
  return (
    <fieldset className="grid min-w-0 grid-cols-2 gap-3 border-t border-line pt-3">
      <legend className="col-span-2 mb-1 font-display text-sm font-bold uppercase tracking-wide text-ink">
        {title}
      </legend>
      <SelectField
        label="Formation"
        value={tactics.formation}
        options={FORMATIONS}
        onChange={(formation) => onChange({ ...tactics, formation })}
      />
      <SelectField
        label="Style"
        value={tactics.style}
        options={STYLES}
        onChange={(style) => onChange({ ...tactics, style })}
      />
      <SelectField
        label="Pressing"
        value={tactics.pressing}
        options={LEVELS}
        onChange={(pressing) => onChange({ ...tactics, pressing })}
      />
      <SelectField
        label="Hauteur du bloc"
        value={tactics.line}
        options={LEVELS}
        onChange={(line) => onChange({ ...tactics, line })}
      />
    </fieldset>
  );
}

function eventText(event: MatchEvent, names: Map<string, string>) {
  const minute = `${event.minute}'`;
  const player = event.playerId ? names.get(event.playerId) : undefined;
  if (event.type === "goal") return `${minute} · BUT · ${player ?? "Buteur"}`;
  if (event.type === "yellow") return `${minute} · Carton jaune · ${player ?? "Joueur"}`;
  if (event.type === "red") return `${minute} · Carton rouge · ${player ?? "Joueur"}`;
  if (event.type === "halfTime") return `${minute} · Mi-temps`;
  if (event.type === "fullTime") return `${minute} · Coup de sifflet final`;
  if (event.type === "shot") return `${minute} · Tir ${event.detail ? `(${event.detail})` : ""}`;
  if (event.type === "turnover") return `${minute} · Perte de balle`;
  return `${minute} · ${event.type}`;
}

function Stat({ label, home, away }: { label: string; home: string; away: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-line py-2 text-sm">
      <span className="font-mono font-semibold text-ink">{home}</span>
      <span className="text-center text-xs text-ink-3">{label}</span>
      <span className="text-right font-mono font-semibold text-ink">{away}</span>
    </div>
  );
}

export function MatchLab() {
  const [homePreset, setHomePreset] = useState<PresetId>("control");
  const [awayPreset, setAwayPreset] = useState<PresetId>("pressing");
  const [homeTactics, setHomeTactics] = useState<Tactics>(PRESETS.control.tactics);
  const [awayTactics, setAwayTactics] = useState<Tactics>(PRESETS.pressing.tactics);
  const [seedInput, setSeedInput] = useState(2026);
  const [result, setResult] = useState<MatchResult | null>(null);

  const simulate = () => {
    const seed = Number.isSafeInteger(seedInput) ? Math.max(0, seedInput) : 2026;
    const homeSquad = buildSquad(homePreset);
    const awaySquad = buildSquad(awayPreset);
    const home = autoTeamSheet({
      clubId: "home",
      squad: homeSquad,
      reputation: 4,
      tactics: homeTactics,
    });
    const away = autoTeamSheet({
      clubId: "away",
      squad: awaySquad,
      reputation: 3,
      tactics: awayTactics,
    });
    setResult(simulateMatch({ seed, home, away }));
  };

  const playerNames = new Map(
    [...buildSquad(homePreset), ...buildSquad(awayPreset)].map((player) => [
      player.id,
      player.name,
    ]),
  );
  const events = result?.events.filter((event) =>
    ["goal", "yellow", "red", "halfTime", "fullTime", "shot", "turnover"].includes(event.type),
  );
  const eventLabels: Record<string, string> = { home: "Domicile", away: "Extérieur" };

  return (
    <main className="min-h-dvh bg-base px-4 py-5 text-ink sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <p className="caps text-club-ink">Mode expérimental · moteur réel</p>
            <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Banc d’essai tactique
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-ink-2">
              Modifie les consignes, lance le moteur et observe leur effet sur le match. Les équipes
              sont des profils de test synthétiques, pas des clubs licenciés.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line-strong px-3 text-sm font-semibold text-ink transition-colors hover:bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-ink"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Retour au hub
          </Link>
        </header>

        <form
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_15rem]"
          onSubmit={(event) => {
            event.preventDefault();
            simulate();
          }}
        >
          {(
            [
              ["Domicile", homePreset, setHomePreset, homeTactics, setHomeTactics],
              ["Extérieur", awayPreset, setAwayPreset, awayTactics, setAwayTactics],
            ] as const
          ).map(([side, presetId, setPreset, tactics, setTactics]) => {
            const preset = PRESETS[presetId];
            return (
              <section key={side} className="paper flex flex-col gap-3 p-4 sm:p-5">
                <div>
                  <p className="caps text-ink-3">Équipe {side.toLowerCase()}</p>
                  <h2 className="font-display text-xl font-bold uppercase text-ink">
                    {preset.label}
                  </h2>
                  <p className="text-xs text-ink-2">{preset.identity}</p>
                </div>
                <SelectField
                  label="Profil d’équipe"
                  value={presetId}
                  options={PRESET_OPTIONS}
                  onChange={(value) => {
                    setPreset(value);
                    setTactics(PRESETS[value].tactics);
                  }}
                />
                <TacticControls title="Consignes" tactics={tactics} onChange={setTactics} />
              </section>
            );
          })}

          <section className="paper flex flex-col justify-between gap-4 p-4 sm:p-5">
            <div>
              <p className="caps text-ink-3">Simulation reproductible</p>
              <label className="mt-3 flex flex-col gap-1.5 text-xs font-semibold text-ink-2">
                Graine du match
                <input
                  className="h-10 rounded-lg border border-line bg-surface px-3 font-mono text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-club"
                  type="number"
                  min={0}
                  step={1}
                  value={seedInput}
                  onChange={(event) => setSeedInput(Number(event.target.value))}
                />
              </label>
              <p className="mt-2 text-xs leading-relaxed text-ink-3">
                Même graine et mêmes tactiques = même résultat. Change une consigne à la fois pour
                comparer son impact.
              </p>
            </div>
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-club px-4 font-display text-base font-bold uppercase tracking-wide text-club-on shadow-sm transition-colors hover:bg-[color-mix(in_oklab,var(--club-primary)_88%,black)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-ink"
              type="submit"
            >
              <Play className="size-4" fill="currentColor" aria-hidden />
              Lancer le match
            </button>
          </section>
        </form>

        {result ? (
          <section
            aria-live="polite"
            className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]"
          >
            <div className="paper p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                <div>
                  <p className="caps text-ink-3">Résultat · graine {seedInput}</p>
                  <div className="mt-1 flex items-baseline gap-3 font-display text-3xl font-bold uppercase sm:text-4xl">
                    <span>{PRESETS[homePreset].label}</span>
                    <span className="text-club-ink">
                      {result.score.home} – {result.score.away}
                    </span>
                    <span>{PRESETS[awayPreset].label}</span>
                  </div>
                </div>
                <p className="text-sm text-ink-2">
                  Homme du match :{" "}
                  <strong className="text-ink">
                    {playerNames.get(result.manOfTheMatch) ?? "—"}
                  </strong>
                </p>
              </div>

              <div className="mt-3">
                <Stat
                  label="Possession"
                  home={`${result.stats.home.possession}%`}
                  away={`${result.stats.away.possession}%`}
                />
                <Stat
                  label="Tirs (cadrés)"
                  home={`${result.stats.home.shots} (${result.stats.home.shotsOnTarget})`}
                  away={`${result.stats.away.shots} (${result.stats.away.shotsOnTarget})`}
                />
                <Stat
                  label="Buts attendus"
                  home={result.stats.home.expectedGoals.toFixed(2)}
                  away={result.stats.away.expectedGoals.toFixed(2)}
                />
                <Stat
                  label="Passes réussies"
                  home={`${result.stats.home.passesCompleted}/${result.stats.home.passes}`}
                  away={`${result.stats.away.passesCompleted}/${result.stats.away.passes}`}
                />
                <Stat
                  label="Séquences sous pressing"
                  home={String(result.stats.home.pressingSequences)}
                  away={String(result.stats.away.pressingSequences)}
                />
                <Stat
                  label="Récupérations au milieu"
                  home={String(result.stats.home.midfieldRegains)}
                  away={String(result.stats.away.midfieldRegains)}
                />
                <Stat
                  label="Contres"
                  home={String(result.stats.home.counterAttacks)}
                  away={String(result.stats.away.counterAttacks)}
                />
              </div>
            </div>

            <div className="paper p-4 sm:p-6">
              <h2 className="font-display text-lg font-bold uppercase">Temps forts</h2>
              <ol className="mt-3 flex max-h-[28rem] flex-col gap-2 overflow-y-auto border-t border-line pt-3 text-sm">
                {events?.length ? (
                  events.map((event, index) => (
                    <li
                      key={`${event.half}-${event.minute}-${event.second}-${event.type}-${index}`}
                      className="flex gap-3 border-b border-line pb-2 last:border-0"
                    >
                      <span className="w-7 shrink-0 font-mono text-xs font-bold text-club-ink">
                        {event.minute}’
                      </span>
                      <span className="min-w-0 flex-1 text-ink-2">
                        {event.side ? `${eventLabels[event.side]} · ` : ""}
                        {eventText(event, playerNames).replace(/^\d+' · /, "")}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-ink-3">Pas d’action marquante dans cette simulation.</li>
                )}
              </ol>
            </div>
          </section>
        ) : (
          <p className="rounded-lg border border-dashed border-line-strong p-5 text-center text-sm text-ink-3">
            Lance une simulation pour voir le score, les statistiques tactiques et les temps forts.
          </p>
        )}
      </div>
    </main>
  );
}
