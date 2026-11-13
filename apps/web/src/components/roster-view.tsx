import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Search, UserRound } from "lucide-react";
import { Link } from "react-router";
import { initialMorale } from "@fmo/career";
import { autoTeamSheet, type Attributes, type Position } from "@fmo/engine";
import { useClubTheme } from "@/components/providers/hooks";
import fifaToIso2 from "@/lib/fifa-to-iso2.json";

interface PackClub {
  id: string;
  name: string;
  initials: string;
  primary: string;
  secondary: string;
  reputation: number;
}

interface PackPlayer {
  id: string;
  clubId: string;
  name: string;
  fictional?: boolean;
  nationality: string;
  birthDate: string | null;
  heightCm: number | null;
  number: number | null;
  squad: "first-team" | "reserve";
  position: Position;
  overall: number;
  marketValueEur: number | null;
  attributes: Attributes;
  lastSeason: {
    season: string;
    appearances: number;
    minutes: number;
    goals: number;
    assists: number;
  } | null;
  levelFromData: boolean;
}

interface RealPack {
  meta: { id: string; name: string; season: string; generatedAt: string; sources: string[] };
  league: { name: string; country: string; fixturesSource: string };
  clubs: PackClub[];
  players: PackPlayer[];
  fixtures: unknown[];
}

interface PackCatalogEntry {
  id: string;
  name: string;
  season: string;
  league: string;
  country: string;
  clubs: number;
  players: number;
  fixtures: number;
}

const POSITIONS: Record<Position, string> = {
  GB: "Gardien",
  DC: "Défenseur central",
  DG: "Latéral gauche",
  DD: "Latéral droit",
  MDC: "Milieu défensif",
  MC: "Milieu central",
  MOC: "Milieu offensif",
  MG: "Milieu gauche",
  MD: "Milieu droit",
  AG: "Ailier gauche",
  AD: "Ailier droit",
  BU: "Avant-centre",
};

const ATTRIBUTES: [keyof Attributes, string][] = [
  ["pace", "Vitesse"],
  ["stamina", "Endurance"],
  ["strength", "Puissance"],
  ["passing", "Passe"],
  ["vision", "Vision"],
  ["dribbling", "Dribble"],
  ["crossing", "Centre"],
  ["finishing", "Finition"],
  ["composure", "Sang-froid"],
  ["positioning", "Placement"],
  ["tackling", "Tacle"],
  ["marking", "Marquage"],
  ["reflexes", "Réflexes"],
  ["gkPositioning", "Placement gardien"],
  ["gkDistribution", "Relance gardien"],
];

const FIFA_TO_ISO2: Record<string, string> = fifaToIso2;
const NATIONALITY_NAMES: Record<string, string> = {
  ALG: "Algérie",
  CHI: "Chili",
  CIV: "Côte d’Ivoire",
  COD: "République démocratique du Congo",
  CPV: "Cap-Vert",
  ENG: "Angleterre",
  GAM: "Gambie",
  GLP: "Guadeloupe",
  GNB: "Guinée-Bissau",
  GUI: "Guinée",
  NED: "Pays-Bas",
  SCO: "Écosse",
  SUI: "Suisse",
};
const REGION_NAMES = new Intl.DisplayNames(["fr"], { type: "region" });
const DEMO_CAREER_SEED = 2026;
type SquadRole = "key" | "regular" | "rotation" | "backup";
const ROLE_LABELS: Record<SquadRole, string> = {
  key: "Indiscutable",
  regular: "Titulaire",
  rotation: "Rotation",
  backup: "Remplaçant",
};

function nationalityInfo(code: string) {
  const normalized = code.toUpperCase();
  const region = FIFA_TO_ISO2[normalized];
  const name =
    NATIONALITY_NAMES[normalized] ?? (region ? REGION_NAMES.of(region) : undefined) ?? normalized;
  return { region, name };
}

function NationalityFlag({ code, name }: { code: string; name: string }) {
  const region = FIFA_TO_ISO2[code.toUpperCase()];
  if (!region) return null;

  return (
    <img
      className="inline-block h-3 w-4 shrink-0 rounded-sm object-cover"
      src={`/flags/${region.toLowerCase()}.svg`}
      alt={`Drapeau : ${name}`}
      loading="lazy"
    />
  );
}

function moraleInfo(morale: number) {
  if (morale >= 66) return { label: "Confiant", color: "text-success" };
  if (morale >= 57) return { label: "Neutre", color: "text-ink-2" };
  return { label: "Mitigé", color: "text-warning" };
}

const money = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function validPack(value: unknown): value is RealPack {
  if (!value || typeof value !== "object") return false;
  const pack = value as Partial<RealPack>;
  return Boolean(
    pack.meta?.id &&
    pack.meta?.season &&
    pack.league?.name &&
    Array.isArray(pack.clubs) &&
    Array.isArray(pack.players) &&
    Array.isArray(pack.fixtures),
  );
}

function ageAtSeasonStart(birthDate: string | null, season: string) {
  if (!birthDate) return null;
  const startYear = Number(season.slice(0, 4));
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);
  const startMonth = 8;
  const startDay = 15;
  return (
    startYear -
    birthYear! -
    (startMonth < birthMonth! || (startMonth === birthMonth! && startDay < birthDay!) ? 1 : 0)
  );
}

function AttributeBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-28 shrink-0 text-ink-2">{label}</span>
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised"
        role="meter"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={20}
        aria-valuenow={value}
      >
        <div className="h-full rounded-full bg-club" style={{ width: `${(value / 20) * 100}%` }} />
      </div>
      <span className="w-5 text-right font-mono font-bold text-ink">{value}</span>
    </div>
  );
}

function Info({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg bg-raised px-3 py-2">
      <dt className="text-[0.6875rem] font-medium text-ink-3">{label}</dt>
      <dd className={`mt-0.5 truncate text-sm font-semibold text-ink ${valueClassName ?? ""}`}>
        {value}
      </dd>
    </div>
  );
}

export function RosterView() {
  const { club } = useClubTheme();
  const [catalog, setCatalog] = useState<PackCatalogEntry[]>([]);
  const [packId, setPackId] = useState("laliga-2026-27");
  const [pack, setPack] = useState<RealPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [clubId, setClubId] = useState("real-madrid");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [squadFilter, setSquadFilter] = useState<"first-team" | "reserve">("first-team");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/packs/${packId}.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Le pack ${packId} est introuvable.`);
        return response.json() as Promise<unknown>;
      })
      .then((data) => {
        if (!validPack(data)) throw new Error("Le fichier reçu n'est pas un pack valide.");
        setPack(data);
        setClubId(
          data.clubs.some((team) => team.id === club.id) ? club.id : (data.clubs[0]?.id ?? ""),
        );
        setPlayerId(null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(error instanceof Error ? error.message : "Impossible de charger le pack.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [club.id, packId]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/packs/catalog.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Le catalogue de championnats est introuvable.");
        return response.json() as Promise<unknown>;
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Le catalogue de championnats est invalide.");
        setCatalog(data as PackCatalogEntry[]);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(
          error instanceof Error ? error.message : "Impossible de charger le catalogue.",
        );
      });
    return () => controller.abort();
  }, []);

  const selectedClub = pack?.clubs.find((team) => team.id === clubId) ?? pack?.clubs[0];
  const fictionalCount =
    pack?.players.filter((player) => player.clubId === selectedClub?.id && player.fictional).length ??
    0;
  const roster = useMemo(() => {
    if (!pack || !selectedClub) return [];
    return pack.players
      .filter(
        (player) =>
          player.clubId === selectedClub.id &&
          player.squad === squadFilter &&
          player.name.toLocaleLowerCase("fr").includes(query.trim().toLocaleLowerCase("fr")),
      )
      .sort((a, b) => (a.number ?? 100) - (b.number ?? 100) || a.name.localeCompare(b.name, "fr"));
  }, [pack, query, selectedClub, squadFilter]);
  const selectedPlayer = roster.find((player) => player.id === playerId) ?? roster[0];
  const roleByPlayer = useMemo(() => {
    const players =
      pack?.players.filter(
        (player) => player.clubId === selectedClub?.id && player.squad === "first-team",
      ) ?? [];
    const roles = new Map<string, SquadRole>();
    players.forEach((player) => roles.set(player.id, "backup"));
    if (players.length < 11 || !selectedClub) return roles;

    const sheet = autoTeamSheet({
      clubId: selectedClub.id,
      squad: players,
      reputation: selectedClub.reputation,
    });
    const starters = sheet.starters
      .map((starter) => starter.player)
      .toSorted((a, b) => b.overall - a.overall);
    starters.forEach((player, index) => roles.set(player.id, index < 5 ? "key" : "regular"));
    sheet.bench.slice(0, 7).forEach((player) => roles.set(player.id, "rotation"));
    return roles;
  }, [pack, selectedClub]);
  const playerNationality = selectedPlayer ? nationalityInfo(selectedPlayer.nationality) : null;
  const playerRole = selectedPlayer
    ? selectedPlayer.squad === "reserve"
      ? "Réserve"
      : ROLE_LABELS[roleByPlayer.get(selectedPlayer.id) ?? "backup"]
    : "—";
  const playerMorale = selectedPlayer ? initialMorale(DEMO_CAREER_SEED, selectedPlayer.id) : null;
  const playerMood = playerMorale === null ? null : moraleInfo(playerMorale);

  return (
    <main className="min-h-dvh bg-base px-4 py-5 text-ink sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <p className="caps text-club-ink">Packs de données · Saison 2026-27</p>
            <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Effectif et fiche joueur
            </h1>
            <p className="mt-1 text-sm text-ink-2">
              Choisis une compétition et un club pour consulter tous les joueurs du pack local.
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

        {loading ? (
          <p role="status" className="paper p-6 text-center text-sm text-ink-2">
            Chargement de l’effectif 2026-27…
          </p>
        ) : loadError ? (
          <section role="alert" className="paper flex flex-col gap-3 p-6">
            <h2 className="font-display text-xl font-bold uppercase">
              Pack de données indisponible
            </h2>
            <p className="text-sm text-ink-2">{loadError}</p>
            <p className="rounded-lg bg-raised p-3 font-mono text-xs text-ink-2">
              npm run pack:build -- laliga
            </p>
            <p className="text-xs text-ink-3">
              Le pack généré reste local et n’est pas ajouté au dépôt.
            </p>
          </section>
        ) : pack && selectedClub ? (
          <>
            <section className="paper flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex flex-wrap items-end gap-4">
                <label className="flex min-w-56 flex-col gap-1.5 text-xs font-semibold text-ink-2">
                  Championnat
                  <select
                    className="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-club"
                    value={pack.meta.id}
                    onChange={(event) => {
                      setLoading(true);
                      setLoadError(null);
                      setPack(null);
                      setPackId(event.target.value);
                    }}
                  >
                    {catalog.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.country} · {entry.league}
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <p className="caps text-ink-3">
                    {pack.meta.name} ·{" "}
                    {pack.league.fixturesSource === "openfootball"
                      ? "calendrier OpenFootball"
                      : "calendrier généré"}
                  </p>
                  <p className="mt-1 text-sm text-ink-2">
                    {pack.clubs.length} clubs · {pack.players.length} joueurs ·{" "}
                    {pack.fixtures.length} matchs · pack actualisé le{" "}
                    {pack.meta.generatedAt.slice(0, 10)}
                  </p>
                </div>
              </div>
              <label className="flex min-w-56 flex-col gap-1.5 text-xs font-semibold text-ink-2">
                Club
                <select
                  className="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-club"
                  value={selectedClub.id}
                  onChange={(event) => {
                    setClubId(event.target.value);
                    setPlayerId(null);
                  }}
                >
                  {pack.clubs
                    .toSorted((a, b) => a.name.localeCompare(b.name, "fr"))
                    .map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                </select>
              </label>
            </section>

            {fictionalCount > 0 ? (
              <aside
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-ink-2"
                role="note"
              >
                Effectif de démonstration : les {fictionalCount} joueurs de ce club sont fictifs.
                Leurs notes et attributs sont des estimations pour le jeu.
              </aside>
            ) : null}

            <div className="grid min-h-[34rem] gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.85fr)]">
              <section className="paper order-2 flex min-h-0 flex-col p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-bold uppercase">
                      {selectedClub.name}
                    </h2>
                    <p className="text-xs text-ink-3">
                      {roster.length} joueur{roster.length > 1 ? "s" : ""} dans cette vue
                    </p>
                  </div>
                  <div
                    className="flex rounded-lg border border-line p-0.5"
                    role="group"
                    aria-label="Filtrer par type d'effectif"
                  >
                    {(
                      [
                        ["first-team", "Équipe A"],
                        ["reserve", "Réserve"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={squadFilter === value}
                        onClick={() => {
                          setSquadFilter(value);
                          setPlayerId(null);
                        }}
                        className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${squadFilter === value ? "bg-club text-club-on" : "text-ink-2 hover:bg-raised"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="relative mt-4 block">
                  <Search
                    className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
                    aria-hidden
                  />
                  <span className="sr-only">Rechercher un joueur</span>
                  <input
                    className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-club"
                    placeholder="Rechercher un joueur…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>

                <ul className="mt-3 flex min-h-0 flex-col gap-1 overflow-y-auto">
                  {roster.map((player) => (
                    <li key={player.id}>
                      <button
                        type="button"
                        aria-current={selectedPlayer?.id === player.id ? "true" : undefined}
                        onClick={() => setPlayerId(player.id)}
                        className={`flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-club-ink ${selectedPlayer?.id === player.id ? "bg-club/10 ring-1 ring-club" : "hover:bg-raised"}`}
                      >
                        <span className="w-7 shrink-0 text-right font-mono text-xs text-ink-3">
                          {player.number ?? "—"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">
                            {player.name}
                          </span>
                          <span className="flex items-center gap-1.5 truncate text-xs text-ink-3">
                            <NationalityFlag
                              code={player.nationality}
                              name={nationalityInfo(player.nationality).name}
                            />
                            {POSITIONS[player.position]}
                            {player.fictional ? (
                              <span className="rounded border border-amber-500/50 px-1 text-[0.625rem] font-semibold uppercase text-amber-800">
                                Fictif
                              </span>
                            ) : null}
                          </span>
                        </span>
                        <span className="font-display text-lg font-bold text-club-ink">
                          {player.overall}
                        </span>
                      </button>
                    </li>
                  ))}
                  {roster.length === 0 ? (
                    <li className="p-4 text-center text-sm text-ink-3">
                      Aucun joueur ne correspond à cette recherche.
                    </li>
                  ) : null}
                </ul>
              </section>

              {selectedPlayer ? (
                <section
                  className="paper order-1 flex flex-col gap-5 p-4 sm:p-6"
                  aria-live="polite"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-14 items-center justify-center rounded-xl font-display text-xl font-bold"
                        style={{
                          backgroundColor: `${selectedClub.primary}18`,
                          color: selectedClub.primary,
                        }}
                        aria-hidden
                      >
                        {selectedClub.initials}
                      </span>
                      <div>
                        <p className="caps flex items-center gap-1.5 text-ink-3">
                          {playerNationality ? (
                            <NationalityFlag
                              code={selectedPlayer.nationality}
                              name={playerNationality.name}
                            />
                          ) : null}
                          <span>{playerNationality?.name}</span>
                          <span aria-hidden>·</span>
                          <span>{POSITIONS[selectedPlayer.position]}</span>
                        </p>
                        <h2 className="font-display text-2xl font-bold uppercase sm:text-3xl">
                          {selectedPlayer.name}
                        </h2>
                        {selectedPlayer.fictional ? (
                          <span className="mt-1 inline-flex rounded border border-amber-500/50 bg-amber-500/10 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-amber-900">
                            Joueur fictif · notes estimées
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="rounded-xl bg-club px-4 py-2 text-center text-club-on">
                      <span className="block font-mono text-xs uppercase opacity-80">Général</span>
                      <span className="font-display text-3xl font-bold">
                        {selectedPlayer.overall}
                      </span>
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
                    <Info
                      label="Âge au début de saison"
                      value={
                        ageAtSeasonStart(selectedPlayer.birthDate, pack.meta.season)?.toString() ??
                        "—"
                      }
                    />
                    <Info
                      label="Taille"
                      value={selectedPlayer.heightCm ? `${selectedPlayer.heightCm} cm` : "—"}
                    />
                    <Info
                      label="Valeur estimée"
                      value={
                        selectedPlayer.marketValueEur
                          ? money.format(selectedPlayer.marketValueEur)
                          : "Non disponible"
                      }
                    />
                    <Info
                      label="Nationalité"
                      value={
                        <span className="inline-flex items-center gap-2">
                          {playerNationality ? (
                            <NationalityFlag
                              code={selectedPlayer.nationality}
                              name={playerNationality.name}
                            />
                          ) : null}
                          <span>{playerNationality?.name}</span>
                        </span>
                      }
                    />
                    <Info label="Statut dans l’équipe" value={playerRole} />
                    <Info
                      label="Humeur simulée"
                      value={playerMood ? `${playerMood.label} · ${playerMorale}/100` : "—"}
                      valueClassName={playerMood?.color}
                    />
                  </dl>

                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
                    <div>
                      <h3 className="mb-3 font-display text-base font-bold uppercase">
                        Attributs · /20
                      </h3>
                      <div className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
                        {ATTRIBUTES.map(([key, label]) => (
                          <AttributeBar
                            key={key}
                            label={label}
                            value={selectedPlayer.attributes[key] ?? 1}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-3 font-display text-base font-bold uppercase">
                        Saison précédente
                      </h3>
                      {selectedPlayer.lastSeason ? (
                        <>
                          <p className="mb-3 text-xs text-ink-3">
                            {selectedPlayer.lastSeason.season} · toutes compétitions
                          </p>
                          <dl className="grid grid-cols-2 gap-2">
                            <Info
                              label="Matchs"
                              value={String(selectedPlayer.lastSeason.appearances)}
                            />
                            <Info
                              label="Minutes"
                              value={selectedPlayer.lastSeason.minutes.toLocaleString("fr-FR")}
                            />
                            <Info label="Buts" value={String(selectedPlayer.lastSeason.goals)} />
                            <Info
                              label="Passes décisives"
                              value={String(selectedPlayer.lastSeason.assists)}
                            />
                          </dl>
                        </>
                      ) : (
                        <p className="rounded-lg bg-raised p-3 text-sm text-ink-3">
                          Pas de statistiques historiques disponibles pour ce joueur.
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="mt-auto border-t border-line pt-3 text-xs text-ink-3">
                    Sources : {pack.meta.sources.join(" · ")}. Notes et valeurs estimées par le jeu,
                    pas des évaluations officielles. Le statut vient du onze automatique et l’humeur
                    est un moral de départ simulé (graine de démonstration), pas une information
                    réelle sur le joueur.
                  </p>
                </section>
              ) : (
                <section className="paper order-1 flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-center">
                  <UserRound className="size-8 text-ink-3" aria-hidden />
                  <p className="font-display text-lg font-bold uppercase">
                    Aucun joueur dans cette vue
                  </p>
                  <p className="max-w-sm text-sm text-ink-3">
                    Choisis l’équipe A ou la réserve, ou sélectionne un autre club.
                  </p>
                </section>
              )}
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
