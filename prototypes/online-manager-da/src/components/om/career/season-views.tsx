import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, FastForward } from "lucide-react";
import { CAREER_FIXTURES, CAREER_TABLE } from "@/data/mock";
import { useClubTheme } from "@/components/om/club-theme-provider";
import { useCareer } from "./session";
import { Action, Confirm, Empty, Field, Go, Panel, Stat, dateLabel } from "./ui";
export function CalendarView() {
  const { state, update } = useCareer();
  const { club } = useClubTheme();
  const navigate = useNavigate();
  const current = CAREER_FIXTURES[Math.min(state.current, 37)];
  const [month, setMonth] = useState(current?.date.slice(0, 7) ?? "2026-11");
  const [filter, setFilter] = useState("Tous");
  const [selected, setSelected] = useState<string | null>(null);
  const months = [...new Set(CAREER_FIXTURES.map((f) => f.date.slice(0, 7)))];
  const rows = CAREER_FIXTURES.filter(
    (f, i) =>
      f.date.startsWith(month) &&
      (filter === "Tous" ||
        (filter === "À venir" && i >= state.current) ||
        (filter === "Terminés" && i < state.current)),
  );
  const fixture = CAREER_FIXTURES.find((f) => f.id === selected);
  const opponent = (name: string) =>
    name === "Rival" ? (club.id === "barcelone" ? "Real Madrid" : "FC Barcelone") : name;
  return (
    <div>
      <div className="career-toolbar">
        <Action
          aria-label="Mois précédent"
          disabled={months.indexOf(month) === 0}
          onClick={() => setMonth(months[Math.max(0, months.indexOf(month) - 1)] ?? month)}
        >
          <ChevronLeft size={20} />
        </Action>
        <Field label="Mois">
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.map((m) => (
              <option key={m} value={m}>
                {new Intl.DateTimeFormat("fr-FR", {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(m + "-01T12:00:00Z"))}
              </option>
            ))}
          </select>
        </Field>
        <Action
          aria-label="Mois suivant"
          disabled={months.indexOf(month) === months.length - 1}
          onClick={() =>
            setMonth(months[Math.min(months.length - 1, months.indexOf(month) + 1)] ?? month)
          }
        >
          <ChevronRight size={20} />
        </Action>
        <Field label="Rencontres">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {["Tous", "À venir", "Terminés"].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Go to="/saison/classement">Classement</Go>
        <Go to="/saison/simulation">Simulation rapide</Go>
      </div>
      <Panel title="Rencontres de la saison">
        {rows.length === 0 ? (
          <Empty>Aucune rencontre pour ces filtres.</Empty>
        ) : (
          <div className="career-calendar-rows">
            {rows.map((f) => {
              const index = CAREER_FIXTURES.indexOf(f);
              return (
                <div
                  className={`career-calendar-row ${index === state.current ? "current" : ""}`}
                  key={f.id}
                >
                  <span className="font-mono">J{f.day}</span>
                  <span>{dateLabel(f.date)}</span>
                  <span className="career-tag">{f.home ? "DOM." : "EXT."}</span>
                  <strong>{opponent(f.opponent)}</strong>
                  <span className="font-mono">
                    {index < state.current
                      ? state.completed.includes(f.id)
                        ? "2–1"
                        : f.result
                      : "21:00"}
                  </span>
                  <Action onClick={() => setSelected(f.id)}>Détails</Action>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
      <Confirm
        open={selected !== null}
        onOpenChange={(v) => {
          if (!v) setSelected(null);
        }}
        title={fixture ? `${club.name} · ${opponent(fixture.opponent)}` : "Rencontre"}
        description={
          fixture
            ? `${dateLabel(fixture.date)} · Journée ${fixture.day} · ${fixture.day - 1 < state.current ? "Résultat fictif : " + (state.completed.includes(fixture.id) ? "2–1" : fixture.result) : "Rencontre à venir"}`
            : ""
        }
      >
        <Action onClick={() => setSelected(null)}>Fermer</Action>
        {fixture && fixture.day - 1 === state.current ? (
          <Go to="/match/avant">Préparer le match</Go>
        ) : fixture && fixture.day - 1 > state.current ? (
          <Go to="/saison/simulation">Simuler jusqu’à cette période</Go>
        ) : (
          <Go to="/saison/classement">Voir le classement</Go>
        )}
      </Confirm>
    </div>
  );
}
export function StandingsView() {
  const { state } = useCareer();
  const { club } = useClubTheme();
  const [sort, setSort] = useState("points");
  const [scope, setScope] = useState("Tous");
  const table = CAREER_TABLE.map((r, i) => {
    const ours =
      r.name === club.name || (club.id !== "barcelone" && club.id !== "real-madrid" && i === 1);
    return {
      ...r,
      name: ours ? club.name : r.name,
      points: r.points + (ours ? state.completed.length * 3 : 0),
      played: r.played + (ours ? state.completed.length : 0),
      won: r.won + (ours ? state.completed.length : 0),
      ours,
    };
  }).sort((a, b) => (sort === "goals" ? b.gf - a.gf : b.points - a.points));
  const rows = table.filter((r) => scope === "Tous" || r.ours);
  return (
    <div>
      <div className="career-toolbar">
        <Field label="Afficher">
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option>Tous</option>
            <option>Mon club</option>
          </select>
        </Field>
        <Field label="Trier par">
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="points">Points</option>
            <option value="goals">Buts marqués</option>
          </select>
        </Field>
        <Go to="/saison/calendrier">Calendrier</Go>
        <Go to="/saison/simulation">Simuler</Go>
      </div>
      <Panel title={`${club.competition} · Tableau fictif`}>
        <div className="career-table-scroll">
          <table className="career-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Club</th>
                <th>J</th>
                <th>V</th>
                <th>N</th>
                <th>D</th>
                <th>BP</th>
                <th>BC</th>
                <th>Diff.</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className={r.ours ? "selected" : ""}>
                  <td>{table.indexOf(r) + 1}</td>
                  <td>{r.name}</td>
                  <td>{r.played}</td>
                  <td>{r.won}</td>
                  <td>{r.drawn}</td>
                  <td>{r.lost}</td>
                  <td>{r.gf + (r.ours ? state.completed.length * 2 : 0)}</td>
                  <td>{r.ga + (r.ours ? state.completed.length : 0)}</td>
                  <td>{r.gf - r.ga + (r.ours ? state.completed.length : 0)}</td>
                  <td>
                    <strong>{r.points}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-ink-2">
          Tableau d’exemple : seules les rencontres jouées en démo ajoutent leur résultat. Les
          autres clubs ne sont pas recalculés.
        </p>
      </Panel>
    </div>
  );
}
export function SimulationView() {
  const { state, update, notify } = useCareer();
  const [target, setTarget] = useState("3");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const fixtures = state.simulation
    .map((id) => CAREER_FIXTURES.find((f) => f.id === id))
    .filter((f) => f !== undefined);
  const run = () => {
    setConfirm(false);
    setBusy(true);
    setTimeout(() => {
      update((s) => {
        const end = target === "end" ? 38 : Math.min(s.current + Number(target), 38);
        const simulated = CAREER_FIXTURES.slice(s.current, end);
        return {
          ...s,
          current: end,
          simulation: simulated.map((f) => f.id),
          validated: false,
          matchStep: 0,
          feed: [
            {
              id: `simulation-${Date.now()}`,
              title: `${simulated.length} rencontres simulées`,
              body: "Résultats prédéfinis, aucune simulation sportive réelle.",
              type: "Saison",
              destination: "/saison/calendrier",
            },
            ...s.feed,
          ],
        };
      });
      notify("Simulation fictive terminée. Calendrier avancé pour cette session.");
      setBusy(false);
    }, 600);
  };
  return (
    <div className="career-two">
      <Panel title="Avancer dans la saison">
        <p className="text-ink-2">
          Les rencontres reprennent des scores prédéfinis. Aucune tactique, finance ni promesse
          n’est recalculée.
        </p>
        <Field label="Période">
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="1">Une rencontre</option>
            <option value="3">Trois rencontres</option>
            <option value="end">Jusqu’à la fin de saison</option>
          </select>
        </Field>
        <p className="warning-tag">La date de carrière change uniquement dans cette session.</p>
        <Action primary disabled={busy || state.current >= 38} onClick={() => setConfirm(true)}>
          <FastForward size={16} />
          {busy ? "Préparation du récapitulatif…" : "Simuler la période"}
        </Action>
        {busy && (
          <div role="status" className="skeleton h-12">
            Chargement…
          </div>
        )}
        {state.current >= 38 && (
          <Go to="/saison/bilan" primary>
            Voir la fin de saison
          </Go>
        )}
      </Panel>
      <Panel title="Récapitulatif" index="02">
        {fixtures.length === 0 ? (
          <Empty>Aucune période simulée dans cette session.</Empty>
        ) : (
          <>
            <div className="career-stats">
              <Stat label="Rencontres" value={fixtures.length} />
              <Stat
                label="Victoires"
                value={
                  fixtures.filter((f) => ["2–0", "3–1", "2–1", "1–0"].includes(f.result)).length
                }
              />
              <Stat
                label="Date atteinte"
                value={
                  state.current >= 38
                    ? "30/05/27"
                    : CAREER_FIXTURES[state.current]?.date.slice(5).split("-").reverse().join("/")
                }
              />
            </div>
            <div className="career-sim-results">
              {fixtures.map((f) => (
                <div className="career-list-row" key={f.id}>
                  <span className="font-mono">J{f.day}</span>
                  <span className="flex-1">{f.opponent === "Rival" ? "Rival" : f.opponent}</span>
                  <strong className="font-mono">{f.result}</strong>
                </div>
              ))}
            </div>
            <Go to="/saison/calendrier">Voir le calendrier</Go>
            <Go to="/saison/bilan">Bilan de saison</Go>
          </>
        )}
      </Panel>
      <Confirm
        open={confirm}
        onOpenChange={setConfirm}
        title="Simuler cette période ?"
        description="Les dates avanceront et les résultats fictifs apparaîtront dans le calendrier. Cette action est temporaire, sans moteur de jeu."
      >
        <Action onClick={() => setConfirm(false)}>Annuler</Action>
        <Action primary onClick={run}>
          Confirmer la simulation
        </Action>
      </Confirm>
    </div>
  );
}
export function SeasonEndView() {
  const { state, reset, notify } = useCareer();
  const [confirm, setConfirm] = useState(false);
  const navigate = useNavigate();
  if (state.current < 38)
    return (
      <Empty>
        Le bilan de saison sera disponible après la dernière journée.{" "}
        <Go to="/saison/simulation">Simuler jusqu’à la fin de saison</Go>
        <Go to="/saison/calendrier">Retour au calendrier</Go>
      </Empty>
    );
  return (
    <div className="career-two">
      <Panel title="Saison 2026–27 · Terminée">
        <h2 className="career-section-title">Une saison à retenir</h2>
        <div className="career-stats">
          <Stat label="Classement fictif" value="2e" />
          <Stat label="Points fictifs" value="82" />
          <Stat label="Objectif" value="Top 4 atteint" />
        </div>
        <p className="text-ink-2">
          Ce bilan est un exemple scénarisé, pas le calcul des rencontres de cette session.
        </p>
        <Go to="/carriere/coach">Carrière coach</Go>
        <Go to="/gestion/finances">Bilan financier</Go>
        <Action primary onClick={() => setConfirm(true)}>
          Recommencer une carrière V1
        </Action>
      </Panel>
      <Panel title="Récompenses & décisions" index="02">
        <ul className="career-notes">
          <li>Joueur de la saison : Gabriel Costa</li>
          <li>Révélation : Yanis El Amrani</li>
          <li>Qualification européenne confirmée (fictive)</li>
          <li>Renouvellements à examiner dans les contrats</li>
        </ul>
        <Go to="/gestion/transferts">Examiner les contrats</Go>
        <Go to="/gestion/discussions">Bilan des promesses</Go>
      </Panel>
      <Confirm
        open={confirm}
        onOpenChange={setConfirm}
        title="Recommencer la démo ?"
        description="La V1 couvre uniquement 2026–27. Vos changements temporaires seront effacés ; une nouvelle saison 2027–28 n’est pas simulée."
      >
        <Action onClick={() => setConfirm(false)}>Annuler</Action>
        <Action
          primary
          onClick={() => {
            reset(0, state.coach);
            navigate({ to: "/hub" });
          }}
        >
          Recommencer en août 2026
        </Action>
      </Confirm>
    </div>
  );
}
