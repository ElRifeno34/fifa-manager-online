import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Search, AlertTriangle } from "lucide-react";
import { type CareerPlayer } from "@/data/mock";
import { useCareer, findPlayers } from "./session";
import { Action, Confirm, Empty, Field, Flag, Go, Panel, Stat, money } from "./ui";
export function PlayerDetail({
  player,
  compact = false,
}: {
  player: CareerPlayer;
  compact?: boolean;
}) {
  const { update } = useCareer();
  return (
    <div className={`career-player-detail ${compact ? "compact" : ""}`}>
      <div className="career-player-heading">
        <div className="career-shirt">
          <span className="font-mono">{player.number}</span>
        </div>
        <div>
          <p className="caps text-ink-2">
            {player.position} · {player.age} ans <Flag nation={player.nation} />
          </p>
          <h2>{player.name}</h2>
          <span className="career-tag">{player.status}</span>
        </div>
        <strong className="career-rating font-mono">{player.rating}</strong>
      </div>
      <div className="career-stats">
        <Stat label="Forme" value={`${player.form}%`} />
        <Stat label="Fatigue" value={`${player.fatigue}%`} />
        <Stat label="Minutes" value={money(player.minutes)} />
      </div>
      <dl className="career-details">
        <div>
          <dt>Humeur</dt>
          <dd>{player.mood}</dd>
        </div>
        <div>
          <dt>Contrat</dt>
          <dd className="font-mono">{player.contract}</dd>
        </div>
        <div>
          <dt>Salaire / semaine</dt>
          <dd className="font-mono">{money(player.salary)} €</dd>
        </div>
        <div>
          <dt>Valeur fictive</dt>
          <dd className="font-mono">{money(player.value)} M€</dd>
        </div>
      </dl>
      <div className="career-actions">
        <Go to="/equipe/tactique">Composition</Go>
        <Link
          to="/gestion/discussions"
          className="career-action"
          onClick={() => update((s) => ({ ...s, selectedPlayer: player.id }))}
        >
          Discuter →
        </Link>
        <Go to="/gestion/transferts">Contrat</Go>
      </div>
      {player.fatigue > 70 && (
        <p className="warning-tag">Fatigue élevée · Le staff recommande du repos.</p>
      )}
    </div>
  );
}
export function RosterView() {
  const { state } = useCareer();
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("Tous");
  const [status, setStatus] = useState("Tous");
  const [sort, setSort] = useState("rating");
  const [selected, setSelected] = useState("p1");
  const [failed, setFailed] = useState(false);
  const players = findPlayers(state.squad, query, position, status, sort);
  const player = state.squad.find((p) => p.id === selected) ?? state.squad[0];
  return (
    <div className="career-roster">
      <aside className="career-roster-preview sheet">
        {player && <PlayerDetail player={player} compact />}
      </aside>
      <div className="career-roster-main">
        <div className="career-toolbar">
          <Field label="Recherche">
            <div className="career-search">
              <input
                aria-label="Rechercher un joueur"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nom du joueur"
              />
            </div>
          </Field>
          <Field label="Poste">
            <select value={position} onChange={(e) => setPosition(e.target.value)}>
              {["Tous", ...new Set(state.squad.map((p) => p.position))].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Statut">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {["Tous", "Titulaire", "Rotation", "Blessé", "Incertain"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Trier par">
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="rating">Niveau</option>
              <option value="name">Nom</option>
              <option value="age">Âge</option>
              <option value="fatigue">Fatigue</option>
              <option value="minutes">Minutes</option>
            </select>
          </Field>
        </div>
        <div className="career-roster-summary">
          <span>{players.length} joueurs · Saison 2026–27</span>
          <Action title="Tester l’état d’erreur de démonstration" onClick={() => setFailed(true)}>
            Tester une erreur
          </Action>
        </div>
        {failed ? (
          <div role="alert" className="career-error">
            <AlertTriangle size={20} />
            <p>Rapport indisponible dans ce scénario de test. Votre effectif est conservé.</p>
            <Action primary onClick={() => setFailed(false)}>
              Réessayer
            </Action>
          </div>
        ) : players.length === 0 ? (
          <Empty>
            Aucun joueur ne correspond à ces filtres.{" "}
            <Action
              onClick={() => {
                setQuery("");
                setPosition("Tous");
                setStatus("Tous");
              }}
            >
              Effacer les filtres
            </Action>
          </Empty>
        ) : (
          <div className="career-table-scroll">
            <table className="career-table">
              <thead>
                <tr>
                  <th>Joueur</th>
                  <th>Âge</th>
                  <th>Poste</th>
                  <th>Statut / humeur</th>
                  <th>Forme</th>
                  <th>Fatigue</th>
                  <th>Minutes</th>
                  <th>Contrat</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id} className={selected === p.id ? "selected" : ""} aria-selected={selected === p.id}>
                    <td>
                      <div className="career-player-cell">
                        <Flag nation={p.nation} />
                        <Link
                          to="/equipe/joueur/$id"
                          params={{ id: p.id }}
                          onClick={(e) => {
                            if (
                              window.matchMedia("(min-height: 501px) and (min-width: 1100px)")
                                .matches
                            ) {
                              e.preventDefault();
                              setSelected(p.id);
                            }
                          }}
                        >
                          {p.name}
                        </Link>
                        <span className="font-mono text-ink-3">{p.rating}</span>
                      </div>
                    </td>
                    <td>{p.age}</td>
                    <td>{p.position}</td>
                    <td>
                      <span>{p.status}</span>
                      <small>{p.mood}</small>
                    </td>
                    <td>{p.form}%</td>
                    <td className={p.fatigue > 70 ? "text-warning-paper" : ""}>{p.fatigue}%</td>
                    <td>{money(p.minutes)}</td>
                    <td>{p.contract}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
export function PlayerView({ id }: { id: string }) {
  const { state } = useCareer();
  const p = state.squad.find((p) => p.id === id);
  return p ? (
    <div className="career-two">
      <Panel title="Profil du joueur">
        <PlayerDetail player={p} />
      </Panel>
      <Panel title="Rapport du staff" index="02">
        <h3>Un rôle important dans le groupe</h3>
        <p className="text-ink-2">
          Profil fictif : {p.position}, {p.age} ans. Le staff recommande une utilisation adaptée à
          la fatigue actuelle.
        </p>
        <div className="career-stats">
          <Stat label="Technique" value={p.rating} />
          <Stat label="Mental" value={p.rating - 2} />
          <Stat label="Physique" value={p.form} />
        </div>
        <Go to="/equipe/entrainement">Programme individuel</Go>
        <Go to="/equipe/effectif">Retour à l’effectif</Go>
        <Link
          to="/equipe/joueur/$id"
          params={{
            id: state.squad[(state.squad.indexOf(p) + 1) % state.squad.length]?.id ?? "p1",
          }}
          className="career-action"
        >
          Joueur suivant →
        </Link>
      </Panel>
    </div>
  ) : (
    <Empty>
      Ce joueur n’existe pas dans la démo. <Go to="/equipe/effectif">Retour à l’effectif</Go>
    </Empty>
  );
}
export function TacticsView() {
  const { state, update, notify } = useCareer();
  const [slot, setSlot] = useState<number | null>(null);
  const [confirm, setConfirm] = useState(false);
  const change = (key: "formation" | "mentality" | "pressing", value: string) =>
    update((s) => ({ ...s, [key]: value, validated: false }));
  return (
    <div className="career-tactics">
      <Panel title="Onze de départ">
        <div className={`career-pitch formation-${state.formation}`}>
          <div className="pitch-half" />
          <div className="pitch-circle" />
          <div className="pitch-box" />
          {state.lineup.map((id, i) => {
            const p = state.squad.find((p) => p.id === id);
            return (
              <Action key={i} onClick={() => setSlot(i)} title={`Changer ${p?.name ?? "joueur"}`}>
                <span className="career-pitch-number">{p?.number}</span>
                <strong>{p?.name.split(" ").at(-1)}</strong>
                <small>
                  {p?.position} · {p?.fatigue}%
                </small>
              </Action>
            );
          })}
        </div>
        <p className="text-ink-2">
          {state.validated
            ? "Composition validée pour cette session."
            : "Sélectionnez un joueur pour changer le titulaire."}
        </p>
      </Panel>
      <div className="career-tactic-controls">
        <Panel title="Plan de jeu" index="02">
          <Field label="Formation">
            <select value={state.formation} onChange={(e) => change("formation", e.target.value)}>
              {["4-3-3", "4-4-2", "3-5-2"].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Mentalité">
            <select value={state.mentality} onChange={(e) => change("mentality", e.target.value)}>
              {["Prudente", "Équilibrée", "Offensive"].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Pressing">
            <select value={state.pressing} onChange={(e) => change("pressing", e.target.value)}>
              {["Bas", "Normal", "Haut"].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <div className="career-decision-zone" aria-label="Valider la préparation du match">
            <p className="warning-tag">2 titulaires fatigués · Aucun calcul de performance.</p>
            <Action primary onClick={() => setConfirm(true)}>
              <Check size={16} />
              Valider la composition
            </Action>
            <Go to="/match/avant">Avant-match</Go>
          </div>
        </Panel>
        <Panel title="Banc & disponibilité" index="03">
          <div className="career-bench">
            {state.squad
              .filter((p) => !state.lineup.includes(p.id))
              .map((p) => (
                <Link key={p.id} to="/equipe/joueur/$id" params={{ id: p.id }}>
                  <Flag nation={p.nation} />
                  <span>{p.name}</span>
                  <span className="font-mono">{p.position}</span>
                </Link>
              ))}
          </div>
        </Panel>
      </div>
      <Confirm
        open={slot !== null}
        onOpenChange={(v) => {
          if (!v) setSlot(null);
        }}
        title="Choisir un remplaçant"
        description="Changer le onze de départ, sans effet sur le scénario de résultat."
      >
        {state.squad
          .filter((p) => !state.lineup.includes(p.id))
          .map((p) => (
            <Action
              key={p.id}
              disabled={p.status === "Blessé"}
              onClick={() => {
                if (slot !== null)
                  update((s) => ({
                    ...s,
                    lineup: s.lineup.map((id, i) => (i === slot ? p.id : id)),
                    validated: false,
                  }));
                setSlot(null);
                notify("Titulaire remplacé pour cette session.");
              }}
            >
              {p.name} · {p.position}
            </Action>
          ))}
      </Confirm>
      <Confirm
        open={confirm}
        onOpenChange={setConfirm}
        title="Valider ce onze ?"
        description="Deux joueurs restent fatigués. Cette validation n’influence pas les résultats de démonstration."
      >
        <Action onClick={() => setConfirm(false)}>Annuler</Action>
        <Action
          primary
          onClick={() => {
            update((s) => ({ ...s, validated: true }));
            notify("Composition validée temporairement.");
            setConfirm(false);
          }}
        >
          Valider
        </Action>
      </Confirm>
    </div>
  );
}
export function TrainingView() {
  const { state, update, notify } = useCareer();
  const [individual, setIndividual] = useState("p17");
  return (
    <div className="career-two">
      <Panel title="Programme collectif">
        <Field label="Travail principal">
          <select
            value={state.training}
            onChange={(e) =>
              update((s) => ({ ...s, training: e.target.value, trainingDone: false }))
            }
          >
            {["Collectif", "Récupération", "Finition", "Organisation défensive"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Intensité">
          <select
            value={state.intensity}
            onChange={(e) =>
              update((s) => ({ ...s, intensity: e.target.value, trainingDone: false }))
            }
          >
            {["Légère", "Modérée", "Élevée"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <div className="career-week">
          {["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."].map((d, i) => (
            <div key={d}>
              <span className="caps">{d}</span>
              <strong>{i === 6 ? "Match" : i === 5 ? "Repos" : state.training}</strong>
            </div>
          ))}
        </div>
        <Action
          primary
          onClick={() => {
            update((s) => ({
              ...s,
              trainingDone: true,
              feed: [
                {
                  id: `training-${Date.now()}`,
                  title: "Programme d’entraînement confirmé",
                  body: `${s.training}, intensité ${s.intensity.toLowerCase()}. Aucune progression réelle calculée.`,
                  type: "Staff",
                  destination: "/equipe/entrainement",
                },
                ...s.feed,
              ],
            }));
            notify("Programme appliqué visuellement. Aucun attribut joueur recalculé.");
          }}
          disabled={state.trainingDone}
        >
          {state.trainingDone ? "Programme confirmé" : "Confirmer le programme"}
        </Action>
      </Panel>
      <Panel title="Travail individuel" index="02">
        <Field label="Joueur">
          <select value={individual} onChange={(e) => setIndividual(e.target.value)}>
            {state.squad.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Objectif">
          <select>
            <option>Technique</option>
            <option>Endurance</option>
            <option>Placement</option>
          </select>
        </Field>
        <Action
          onClick={() => notify("Travail individuel noté temporairement, sans gain d’attribut.")}
        >
          Noter l’objectif
        </Action>
        <Link to="/equipe/joueur/$id" params={{ id: individual }} className="career-action">
          Profil du joueur →
        </Link>
        <Go to="/equipe/tactique">Revoir la composition</Go>
      </Panel>
    </div>
  );
}
