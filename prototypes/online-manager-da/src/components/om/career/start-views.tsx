import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, FolderOpen, Play, Plus, Save, ClipboardList, Users, Goal, AlertTriangle, CalendarDays } from "lucide-react";
import { IMAGES, CAREER_SAVE_EXAMPLES, CAREER_FIXTURES, CAREER_TABLE, getClubNews } from "@/data/mock";
import { CLUBS, type ClubId } from "@/lib/clubs";
import { useClubTheme } from "@/components/om/club-theme-provider";
import { Crest } from "@/components/om/crest";
import { Button } from "@/components/om/button";
import { useCareer, captureCareer, restoreCareer } from "./session";
import { Action, Confirm, Field, Go, Panel, Stat, dateLabel, money } from "./ui";
import regraguiPhoto from "@/assets/walid-regragui.jpg.asset.json";
import stadiumMontage from "@/assets/regragui-stadium-menu.jpg";
import { NewsCarousel } from "@/components/om/news-carousel";
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
  const navigate = useNavigate();
  const [storyIndex, setStoryIndex] = useState(0);
  const next = CAREER_FIXTURES[state.current];
  const opponent = (fixture: typeof next) => fixture?.opponent === "Rival"
    ? club.id === "barcelone" ? "Real Madrid" : "FC Barcelone"
    : fixture?.opponent ?? "Fin de saison";
  const stories = getClubNews(club).map((story, index) => index === 0
    ? { ...story, headline: `${club.name} : le rendez-vous approche`, lead: `${opponent(next)} · ${next ? dateLabel(next.date) : "Bilan de saison"} · 21:00. Le groupe prépare la prochaine rencontre.` }
    : story);
  useEffect(() => {
    const openNews = () => navigate({ to: "/gestion/presse" });
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey ||
          (event.target instanceof HTMLElement && /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName))) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        if (document.querySelector('[role="dialog"]')) return;
        event.preventDefault();
        setStoryIndex(i => (i + (event.key === "ArrowRight" ? 1 : -1) + stories.length) % stories.length);
      }
    };
    window.addEventListener("om-news-all", openNews);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("om-news-all", openNews); window.removeEventListener("keydown", onKey); };
  }, [navigate, stories.length]);
  return (
    <div className="career-v0-hub">
      <div className="career-v0-main">
        <section className="career-match-focus" aria-label="Prochain rendez-vous">
          <div className="career-match-focus-copy">
            <p className="caps">{club.competition} · {next ? `Journée ${next.day}` : "Saison terminée"}</p>
            <h2>{next ? <>Face à <span>{opponent(next)}</span></> : "Le bilan de votre saison"}</h2>
            <p className="career-focus-date"><CalendarDays size={16} aria-hidden="true" />{next ? `${dateLabel(next.date)} · 21:00 · ${next.home ? "Domicile" : "Extérieur"}` : "2026–27"}</p>
          </div>
          <div className="career-match-focus-action">
            {next && <span className={`career-readiness ${state.validated ? "is-ready" : ""}`}>{state.validated ? <Check size={16} /> : <AlertTriangle size={16} />}{state.validated ? "Onze validé · 2 joueurs fatigués" : "Onze à valider · 2 joueurs fatigués"}</span>}
            <Go to={!next ? "/saison/bilan" : state.validated ? "/match/avant" : "/equipe/tactique"} primary>{!next ? "Voir le bilan" : state.validated ? "Préparer le match" : "Valider mon onze"}</Go>
          </div>
          <nav className="career-preparation" aria-label="Préparation du match">
            <Go to="/equipe/effectif"><Users size={16} /><span>Effectif</span></Go>
            <Go to="/equipe/tactique"><ClipboardList size={16} /><span>Composition</span>{state.validated && <Check size={14} />}</Go>
            <Go to="/match/avant"><Goal size={16} /><span>Avant-match</span></Go>
          </nav>
        </section>
        <NewsCarousel stories={stories} index={storyIndex} onIndexChange={setStoryIndex} className="career-v0-news" />
        <div className="career-v0-tables">
          <Panel title={`Classement · ${club.competition}`} to="/saison/classement">
            <div className="career-hub-standings">
              {CAREER_TABLE.slice(0, 5).map((row, i) => <div key={row.name} className={i === 1 ? "is-managed" : ""}><span>{i + 1}</span><strong>{i === 1 ? club.name : row.name}</strong><b>{i === 1 ? 27 + state.completed.length * 3 : row.points}</b></div>)}
            </div>
          </Panel>
          <Panel title="Vie du club" index="02" to="/gestion/discussions">
            <div className="career-stats"><Stat label="Position" value="2e" /><Stat label="Points" value={27 + state.completed.length * 3} /><Stat label="Budget" value={`${money(state.budget)} M€`} /></div>
            <p className="career-v0-inbox">El Amrani souhaite parler de son temps de jeu.</p>
            <Go to="/gestion/discussions">Ouvrir la discussion</Go>
          </Panel>
        </div>
      </div>
      <aside className="career-v0-calendar" aria-label="Calendrier">
        <div className="career-v0-fixture">
          <CalendarDays size={20} aria-hidden="true" /><h2>Calendrier</h2><span className="caps">2026–27</span>
        </div>
        <div className="career-v0-agenda">
          {CAREER_FIXTURES.slice(state.current, state.current + 4).map(fixture => <Go key={fixture.id} to="/saison/calendrier"><span><strong className="font-display">{dateLabel(fixture.date)}</strong><small>J{fixture.day} · {opponent(fixture)}</small></span></Go>)}
          <Go to="/saison/calendrier">Tout le calendrier</Go>
        </div>
        <div className="career-agenda-club"><span className="caps">Votre club</span><strong>2e <small>au classement</small></strong><span>{27 + state.completed.length * 3} points · {money(state.budget)} M€</span><Go to="/gestion/discussions">Vestiaire</Go></div>
      </aside>
    </div>
  );
}
