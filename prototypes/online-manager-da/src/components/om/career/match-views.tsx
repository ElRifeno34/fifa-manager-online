import { useEffect, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Play, Pause, SkipForward, RefreshCw } from "lucide-react";
import { CAREER_FIXTURES, MATCH_SCRIPT } from "@/data/mock";
import { useClubTheme } from "@/components/om/club-theme-provider";
import { Crest } from "@/components/om/crest";
import { useCareer } from "./session";
import { Action, Confirm, Empty, Go, Panel, Stat, dateLabel } from "./ui";
export function useFixture() {
  const { state } = useCareer();
  const { club } = useClubTheme();
  const fixture = CAREER_FIXTURES[Math.min(state.current, 37)];
  const opponent =
    fixture?.opponent === "Rival"
      ? club.id === "barcelone"
        ? "Real Madrid"
        : "FC Barcelone"
      : (fixture?.opponent ?? "Valence");
  return { fixture, opponent, club };
}
export function BeforeMatchView() {
  const { state, update, notify } = useCareer();
  const { fixture, opponent, club } = useFixture();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  if (state.current >= 38)
    return (
      <Empty>
        La saison est terminée. <Go to="/saison/bilan">Voir le bilan</Go>
      </Empty>
    );
  const start = () => {
    update((s) => ({ ...s, matchStep: 0, substitutions: [] }));
    notify("Match scénarisé ouvert : le résultat ne dépend pas de la tactique.");
    navigate({ to: "/match/direct" });
  };
  return (
    <div className="career-two">
      <Panel title="Affiche du match">
        <div className="career-match-banner">
          <p className="caps text-ink-2">
            {fixture && dateLabel(fixture.date)} · J{fixture?.day} · 21:00
          </p>
          <div className="career-versus">
            <Crest initials={club.initials} className="size-14" />
            <h2>
              {club.name}
              <small>contre</small>
              {opponent}
            </h2>
            <div className="career-opponent">{opponent.substring(0, 3).toUpperCase()}</div>
          </div>
          <p>
            {fixture?.home ? "Domicile" : "Extérieur"} · {club.competition} · Temps sec, 16 °C
            (fictif)
          </p>
        </div>
        <Action primary onClick={() => setConfirm(true)}>
          <Play size={16} />
          Lancer le match texte
        </Action>
        <Go to="/equipe/tactique">Voir la composition</Go>
      </Panel>
      <Panel title="Derniers préparatifs" index="02">
        <div className="career-stats">
          <Stat label="Formation" value={state.formation} />
          <Stat label="Mentalité" value={state.mentality} />
          <Stat label="Pressing" value={state.pressing} />
        </div>
        <p className="warning-tag">2 titulaires fatigués</p>
        <p>{state.validated ? "Composition validée" : "Composition non validée"}</p>
        <p className="text-ink-2">
          Le match utilise un scénario fixe. Les choix sont visibles, sans calcul sportif.
        </p>
        <Go to="/equipe/entrainement">Préparer le groupe</Go>
        <Go to="/gestion/presse">Parler à la presse</Go>
      </Panel>
      <Confirm
        open={confirm}
        onOpenChange={setConfirm}
        title="Continuer malgré les avertissements ?"
        description="Deux titulaires sont fatigués. Le scénario de démonstration reste identique, quelle que soit la composition."
      >
        <Action onClick={() => setConfirm(false)}>Annuler</Action>
        <Go to="/equipe/tactique">Voir la compo</Go>
        <Action primary onClick={start}>
          Continuer quand même
        </Action>
      </Confirm>
    </div>
  );
}
export function LiveMatchView() {
  const { state, update, notify } = useCareer();
  const { fixture, opponent, club } = useFixture();
  const [playing, setPlaying] = useState(false);
  const [sub, setSub] = useState(false);
  const [out, setOut] = useState(state.lineup[0] ?? "p1");
  const [inside, setInside] = useState(
    state.squad.find((p) => !state.lineup.includes(p.id))?.id ?? "p12",
  );
  const [exit, setExit] = useState(false);
  const navigate = useNavigate();
  const step = MATCH_SCRIPT[Math.min(state.matchStep, MATCH_SCRIPT.length - 1)] ?? MATCH_SCRIPT[0];
  const ended = state.matchStep >= MATCH_SCRIPT.length - 1;
  useEffect(() => {
    if (!playing || ended) return;
    const t = setTimeout(
      () => update((s) => ({ ...s, matchStep: Math.min(s.matchStep + 1, 6) })),
      1600,
    );
    return () => clearTimeout(t);
  }, [playing, state.matchStep, ended, update]);
  if (state.current >= 38)
    return (
      <Empty>
        Saison terminée. <Go to="/saison/bilan">Bilan de saison</Go>
      </Empty>
    );
  return (
    <div className="career-live">
      <Panel title="Tableau d’affichage">
        <div className="career-score">
          <span>{club.name}</span>
          <strong className="font-mono">
            {step?.home} – {step?.away}
          </strong>
          <span>{opponent}</span>
        </div>
        <div className="career-live-minute font-mono">
          {step?.minute}′ <span>{ended ? "Terminé" : playing ? "En cours" : "En pause"}</span>
        </div>
        <div className="career-match-progress">
          <progress value={step?.minute} max={90} aria-label="Progression du match" />
        </div>
        <div className="career-actions">
          <Action primary disabled={ended} onClick={() => setPlaying((v) => !v)}>
            {playing ? <Pause size={16} /> : <Play size={16} />} {playing ? "Pause" : "Lecture"}
          </Action>
          <Action
            disabled={ended}
            onClick={() => {
              setPlaying(false);
              update((s) => ({ ...s, matchStep: Math.min(s.matchStep + 1, 6) }));
            }}
          >
            <SkipForward size={16} />
            Prochain temps fort
          </Action>
          <Action
            disabled={ended}
            onClick={() => {
              setPlaying(false);
              update((s) => ({ ...s, matchStep: 6 }));
            }}
          >
            Aller à la fin
          </Action>
        </div>
        {ended && (
          <Go to="/match/resume" primary>
            Voir le résumé
          </Go>
        )}
        <div className="career-stats">
          <Stat label="Possession" value={state.matchStep > 3 ? "56 %" : "52 %"} />
          <Stat label="Tirs" value={state.matchStep > 3 ? "12 / 7" : "5 / 3"} />
          <Stat label="Formation" value={state.formation} />
        </div>
        <Action
          disabled={ended}
          onClick={() => {
            setPlaying(false);
            setSub(true);
          }}
        >
          Faire un changement
        </Action>
        <Action
          onClick={() => {
            setPlaying(false);
            setExit(true);
          }}
        >
          Quitter la rencontre
        </Action>
      </Panel>
      <Panel title="Commentaires en direct" index="02">
        <ol className="career-commentary" aria-live="polite">
          {MATCH_SCRIPT.slice(0, state.matchStep + 1)
            .sort((a, b) => b.minute - a.minute)
            .map((event) => (
              <li key={event.minute}>
                <span className="font-mono">{event.minute}′</span>
                <p>{event.text}</p>
              </li>
            ))}
        </ol>
        {state.substitutions.map((text, i) => (
          <p className="career-tag" key={i}>
            {text}
          </p>
        ))}
        <p className="text-ink-2">
          Chronologie et statistiques fictives, identiques à chaque démonstration.
        </p>
      </Panel>
      <Confirm
        open={sub}
        onOpenChange={setSub}
        title="Changement de démonstration"
        description="Le changement apparaît dans le journal, mais ne modifie pas le scénario."
      >
        <label className="career-field">
          <span>Sortant</span>
          <select value={out} onChange={(e) => setOut(e.target.value)}>
            {state.lineup.map((id) => {
              const p = state.squad.find((p) => p.id === id);
              return (
                <option key={id} value={id}>
                  {p?.name}
                </option>
              );
            })}
          </select>
        </label>
        <label className="career-field">
          <span>Entrant</span>
          <select value={inside} onChange={(e) => setInside(e.target.value)}>
            {state.squad
              .filter((p) => !state.lineup.includes(p.id))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </label>
        <Action
          primary
          onClick={() => {
            const a = state.squad.find((p) => p.id === out);
            const b = state.squad.find((p) => p.id === inside);
            update((s) => ({
              ...s,
              lineup: s.lineup.map((id) => (id === out ? inside : id)),
              substitutions: [...s.substitutions, `${step?.minute}′ · ${a?.name} → ${b?.name}`],
            }));
            notify("Changement noté dans le journal.");
            setSub(false);
          }}
        >
          Confirmer
        </Action>
      </Confirm>
      <Confirm
        open={exit}
        onOpenChange={setExit}
        title="Quitter le match ?"
        description="La progression temporaire est conservée pendant cette session. Aucun résultat ne sera validé."
      >
        <Action onClick={() => setExit(false)}>Rester</Action>
        <Action primary onClick={() => navigate({ to: "/hub" })}>
          Quitter
        </Action>
      </Confirm>
    </div>
  );
}
export function SummaryView() {
  const { state, update, notify } = useCareer();
  const { club, opponent, fixture } = useFixture();
  const navigate = useNavigate();
  const done = fixture ? state.completed.includes(fixture.id) : false;
  if (state.matchStep < 6 && !done)
    return (
      <Empty>
        La rencontre n’est pas terminée. <Go to="/match/direct">Reprendre le match</Go>
      </Empty>
    );
  return (
    <div className="career-two">
      <Panel title="Résultat de démonstration">
        <div className="career-score">
          <span>{club.name}</span>
          <strong className="font-mono">2 – 1</strong>
          <span>{opponent}</span>
        </div>
        <p className="caps text-ink-2">
          {fixture && dateLabel(fixture.date)} · {club.competition}
        </p>
        <div className="career-stats">
          <Stat label="Possession" value="56 %" />
          <Stat label="Tirs cadrés" value="7 / 3" />
          <Stat label="Homme du match" value="Costa · 8,2" />
        </div>
        <p>28′ Delcourt · 52′ adversaire · 71′ Costa</p>
        <Action
          primary
          onClick={() => {
            if (fixture && !done) {
              update((s) => ({
                ...s,
                completed: [...s.completed, fixture.id],
                current: Math.min(s.current + 1, 38),
                matchStep: 0,
                validated: false,
                feed: [
                  {
                    id: `match-${fixture.id}`,
                    title: `Victoire 2–1 contre ${opponent}`,
                    body: "Delcourt et Costa décisifs dans le scénario de démonstration.",
                    type: "Match",
                    destination: "/saison/calendrier",
                  },
                  ...s.feed,
                ],
              }));
              notify("Résultat fictif repris dans le calendrier et le fil.");
            }
            navigate({ to: "/saison/calendrier" });
          }}
        >
          Valider le résultat & continuer
        </Action>
      </Panel>
      <Panel title="Le débrief du staff" index="02">
        <p>
          Le groupe a su réagir après l’égalisation. La récupération est au programme avant le
          prochain rendez-vous.
        </p>
        <ul className="career-notes">
          <li>Delcourt · finition efficace</li>
          <li>Costa · joueur du match</li>
          <li>Keller · repos conseillé</li>
        </ul>
        <Go to="/equipe/entrainement">Organiser la récupération</Go>
        <Go to="/gestion/presse">Répondre à la presse</Go>
        <Go to="/medias/fil">Voir les réactions</Go>
      </Panel>
    </div>
  );
}
