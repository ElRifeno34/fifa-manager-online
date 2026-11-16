import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, FolderOpen, Play, Plus, Save } from "lucide-react";
import { CAREER_SAVE_EXAMPLES, CAREER_FIXTURES, CAREER_TABLE } from "@/data/mock";
import { CLUBS, type ClubId } from "@/lib/clubs";
import { useClubTheme } from "@/components/om/club-theme-provider";
import { Crest } from "@/components/om/crest";
import { Button } from "@/components/om/button";
import { useCareer, captureCareer, restoreCareer } from "./session";
import { Action, Confirm, Field, Go, Panel, Stat, dateLabel, money } from "./ui";
import pressConference from "../../../../docs/codex/references/press-conference.png";
import regraguiPhoto from "@/assets/walid-regragui.jpg.asset.json";
import stadiumMontage from "@/assets/regragui-stadium-menu.jpg";
export function MenuView() {
  const [photoFailed, setPhotoFailed] = useState(false);
  const [entered, setEntered] = useState(false);
  const choices = useRef<HTMLElement>(null);
  const enter = () => {
    setEntered(true);
    requestAnimationFrame(() => choices.current?.querySelector<HTMLAnchorElement>('a')?.focus());
  };
  return (
    <div className={`career-menu-scene ${entered ? 'is-entered' : 'is-intro'}`}>
      {photoFailed ? (
        <div className="career-menu-photo-placeholder" role="img" aria-label="Emplacement du portrait de Walid Regragui">
          <span>Walid Regragui</span>
          <small>Photographie indisponible</small>
        </div>
      ) : (
        <img className="career-menu-montage" src={stadiumMontage} alt="Walid Regragui en tenue du Maroc, photographié de trois quarts, dans un montage retouché sur un stade illustratif créé par IA." onError={(e) => { if (e.currentTarget.src.endsWith(regraguiPhoto.url)) setPhotoFailed(true); else e.currentTarget.src = regraguiPhoto.url; }} />
      )}
      <div className="career-menu-copy">
        <p className="caps career-menu-season"><span /> Saison 2026–27</p>
        <h1>Online Manager</h1>
        {entered && <>
          <nav ref={choices} id="home-actions" className="career-menu-actions" aria-label="Choisir une carrière">
            <Go to="/carriere/nouvelle" primary><span className="career-menu-option"><Plus size={20} strokeWidth={1.5} /><span>Nouvelle carrière<small>Choisir votre club</small></span></span></Go>
            <Go to="/carriere/sauvegardes"><span className="career-menu-option"><FolderOpen size={20} strokeWidth={1.5} /><span>Reprendre une carrière<small>Carrières et instantanés</small></span></span></Go>
            <Go to="/hub"><span className="career-menu-option"><Play size={20} strokeWidth={1.5} /><span>Explorer la démo<small>Entrer dans le club</small></span></span></Go>
          </nav>
          <p className="career-menu-disclaimer">Maquette fictive, sans sauvegarde permanente.</p>
        </>}
      </div>
      {!entered && <Button className="career-menu-touch" onClick={enter} aria-label="Toucher pour continuer"><span>Toucher pour continuer <ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" /></span></Button>}
      <p className="career-menu-credit">
        Walid Regragui · Photo : <a href="https://commons.wikimedia.org/wiki/File:RegraguiCoach.jpg" target="_blank" rel="noreferrer">Nawfel Ajari / Wikimedia Commons</a>
        <br /><a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a> · Photo retouchée, montage sur stade IA
      </p>
    </div>
  );
}
export function NewCareerView() {
  const { club, setClub } = useClubTheme();
  const { reset } = useCareer();
  const navigate = useNavigate();
  const [name, setName] = useState("Alex Morgan");
  const [selected, setSelected] = useState<ClubId>(club.id);
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(11);
  return (
    <div className="career-two">
      <Panel title="Identité du coach">
        <Field label="Nom du coach">
          <input
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
          />
        </Field>
        <Field label="Point de départ">
          <select value={start} onChange={(e) => setStart(Number(e.target.value))}>
            <option value="11">22 novembre 2026 · Journée 12</option>
            <option value="0">16 août 2026 · Journée 1</option>
          </select>
        </Field>
        <p className="text-ink-2">
          Objectif fictif : qualification européenne. Les joueurs et budgets sont des exemples.
        </p>
        <Action primary disabled={!name.trim()} onClick={() => setOpen(true)}>
          Créer la carrière <ArrowRight size={16} />
        </Action>
      </Panel>
      <Panel title="Choisir un club" index="02">
        <div className="career-club-grid">
          {CLUBS.map((c) => (
            <Action key={c.id} onClick={() => setSelected(c.id)}>
              <Crest initials={c.initials} className="size-8" />
              <span>{c.name}</span>
              {selected === c.id && <Check className="text-club-ink" size={16} />}
            </Action>
          ))}
        </div>
        <p className="text-ink-2">Même effectif fictif dans les six habillages de club.</p>
      </Panel>
      <Confirm
        open={open}
        onOpenChange={setOpen}
        title="Démarrer cette carrière ?"
        description="La session courante sera remplacée. Aucun fichier de sauvegarde ne sera créé."
      >
        <Action onClick={() => setOpen(false)}>Annuler</Action>
        <Action
          primary
          onClick={() => {
            reset(start, name.trim());
            setClub(selected);
            navigate({ to: "/hub" });
          }}
        >
          Démarrer
        </Action>
      </Confirm>
    </div>
  );
}
export function SavesView() {
  const { state, reset, update, notify } = useCareer();
  const { setClub } = useClubTheme();
  const navigate = useNavigate();
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <div className="career-two">
      <Panel title="Carrières d’exemple">
        <p className="text-ink-2">Exemples prédéfinis, pas des sauvegardes sur votre appareil.</p>
        {CAREER_SAVE_EXAMPLES.map((save) => (
          <div className="career-list-row" key={save.id}>
            <FolderOpen size={20} strokeWidth={1.5} />
            <div className="flex-1">
              <strong>{save.label}</strong>
              <p className="text-ink-2">2026–27 · Coach Alex Morgan · Exemple fictif</p>
            </div>
            <Action onClick={() => setChosen(save.id)}>Reprendre</Action>
          </div>
        ))}
      </Panel>
      <Panel title="Instantanés de cette session" index="02">
        <Action
          onClick={() => {
            update((s) => ({
              ...s,
              saved: [
                ...s.saved,
                {
                  name: `${s.coach} · J${s.current + 1}`,
                  current: s.current,
                  snapshot: captureCareer(s),
                },
              ],
            }));
            notify("Instantané temporaire ajouté. Il disparaît au rechargement.");
          }}
        >
          <Save size={16} />
          Créer un instantané temporaire
        </Action>
        {state.saved.length === 0 ? (
          <p className="career-empty">Aucun instantané temporaire.</p>
        ) : (
          state.saved.map((save, i) => (
            <div className="career-list-row" key={i}>
              <span className="flex-1">{save.name}</span>
              <Action
                onClick={() => {
                  update((s) => restoreCareer(s, i));
                  notify(
                    "Instantané temporaire restauré : effectif, tactique, résultats et gestion.",
                  );
                  navigate({ to: "/hub" });
                }}
              >
                Reprendre l’instantané
              </Action>
              <Action
                aria-label={`Supprimer ${save.name}`}
                onClick={() => update((s) => ({ ...s, saved: s.saved.filter((_, j) => i !== j) }))}
              >
                Supprimer
              </Action>
            </div>
          ))
        )}
      </Panel>
      <Confirm
        open={chosen !== null}
        onOpenChange={(v) => {
          if (!v) setChosen(null);
        }}
        title="Reprendre cet exemple ?"
        description="Vos changements temporaires actuels seront remis à zéro."
      >
        <Action onClick={() => setChosen(null)}>Annuler</Action>
        <Action
          primary
          onClick={() => {
            const save = CAREER_SAVE_EXAMPLES.find((s) => s.id === chosen);
            if (save) {
              reset(save.index);
              setClub(save.clubId);
              navigate({ to: "/hub" });
            }
          }}
        >
          Reprendre
        </Action>
      </Confirm>
    </div>
  );
}
export function HubView() {
  const { state } = useCareer();
  const { club } = useClubTheme();
  const next = CAREER_FIXTURES[state.current];
  return (
    <div className="career-hub">
       <div className="career-hub-left">
        <Panel title="Prochain rendez-vous" to="/match/avant">
          <div className="career-fixture-hero">
            <span className="caps text-ink-2">
              {next ? `${dateLabel(next.date)} · J${next.day}` : "30 mai 2027 · Bilan"}
            </span>
            <div className="career-match-names">
              <Crest initials={club.initials} className="size-11" />
              <h2>
                {club.name}
                <span>
                  vs{" "}
                  {next?.opponent === "Rival"
                    ? club.id === "barcelone"
                      ? "Real Madrid"
                      : "FC Barcelone"
                    : (next?.opponent ?? "Fin de saison")}
                </span>
              </h2>
            </div>
            <p className="text-ink-2">
              {next?.home ? "Domicile" : "Extérieur"} · 21:00 · {club.competition}
            </p>
            <p className="warning-tag">
              2 titulaires fatigués · {state.validated ? "Compo validée" : "Compo à valider"}
            </p>
            <Go to={state.current >= 38 ? "/saison/bilan" : "/match/avant"} primary>
              {state.current >= 38 ? "Voir le bilan" : "Préparer le match"}
            </Go>
          </div>
        </Panel>
        <Panel title="Vestiaire" index="02" to="/gestion/discussions">
          <p>El Amrani souhaite parler de son temps de jeu.</p>
          <Go to="/gestion/discussions">Ouvrir la discussion</Go>
        </Panel>
      </div>
      <div className="career-hub-center">
        <div className="career-hub-photo">
          <img src={pressConference} alt="Joueur de football lors d’une conférence de presse" />
          <div>
             <p className="caps">{club.name} · 2026–27</p>
            <h2>Le prochain rendez-vous se prépare</h2>
            <Go to="/gestion/presse">Conférence de presse</Go>
          </div>
        </div>
        <div className="career-stats">
          <Stat label="Position" value="2e" />
          <Stat label="Points" value={27 + state.completed.length * 3} />
          <Stat label="Budget" value={`${money(state.budget)} M€`} />
        </div>
        <Panel title="Fil du club" index="03" to="/medias/fil">
          {state.feed.slice(0, 3).map((event) => (
            <div className="career-feed-preview" key={event.id}>
              <span className="caps text-club-ink">{event.type}</span>
              <strong>{event.title}</strong>
              <p>{event.body}</p>
            </div>
          ))}
        </Panel>
      </div>
      <div className="career-hub-right">
        <Panel title="Votre programme" index="04">
          <div className="career-hub-link-group" role="group" aria-label="Préparer le prochain match">
            <span>Préparer le prochain match</span>
            <Go to="/equipe/effectif" className="career-decision-row">Effectif</Go>
            <Go to="/equipe/tactique" className="career-decision-row">Composition</Go>
            <Go to="/equipe/entrainement" className="career-decision-row">Entraînement</Go>
          </div>
          <div className="career-hub-link-group" role="group" aria-label="Suivre la saison et le club">
            <span>Suivre la saison et le club</span>
            <Go to="/gestion/transferts" className="career-decision-row">Transferts</Go>
            <Go to="/saison/calendrier" className="career-decision-row">Calendrier</Go>
            <Go to="/saison/classement" className="career-decision-row">Classement</Go>
          </div>
        </Panel>
      </div>
    </div>
  );
}
