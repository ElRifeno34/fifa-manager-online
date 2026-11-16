import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  Home,
  Users,
  Goal,
  CalendarDays,
  MoreHorizontal,
  Menu,
  Settings,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/om/button";
import { Crest } from "@/components/om/crest";
import { useClubTheme } from "@/components/om/club-theme-provider";
import { SettingsSheet } from "@/components/om/settings-sheet";
import { CAREER_FIXTURES } from "@/data/mock";
import { useCareer } from "./session";
import { Go, dateLabel, type CareerPath } from "./ui";
export const navigation = [
  {
    label: "Accueil",
    icon: Home,
    to: "/hub",
    links: [
      ["Hub du club", "/hub"],
      ["Menu de carrière", "/"],
      ["Sauvegardes", "/carriere/sauvegardes"],
    ],
  },
  {
    label: "Équipe",
    icon: Users,
    to: "/equipe/effectif",
    links: [
      ["Effectif", "/equipe/effectif"],
      ["Composition & tactique", "/equipe/tactique"],
      ["Entraînement", "/equipe/entrainement"],
    ],
  },
  {
    label: "Match",
    icon: Goal,
    to: "/match/avant",
    links: [
      ["Avant-match", "/match/avant"],
      ["Match texte", "/match/direct"],
      ["Résumé", "/match/resume"],
    ],
  },
  {
    label: "Saison",
    icon: CalendarDays,
    to: "/saison/calendrier",
    links: [
      ["Calendrier", "/saison/calendrier"],
      ["Classement", "/saison/classement"],
      ["Simulation rapide", "/saison/simulation"],
      ["Fin de saison", "/saison/bilan"],
    ],
  },
  {
    label: "Plus",
    icon: MoreHorizontal,
    to: "/gestion/discussions",
    links: [
      ["Transferts & contrats", "/gestion/transferts"],
      ["Finances", "/gestion/finances"],
      ["Discussions & promesses", "/gestion/discussions"],
      ["Presse", "/gestion/presse"],
      ["Fil du club", "/medias/fil"],
      ["Carrière coach", "/carriere/coach"],
    ],
  },
] as const;
const paths: Record<
  string,
  { title: string; eyebrow: string; back: Exclude<CareerPath, "/equipe/joueur/$id"> }
> = {
  "/": { title: "Online Manager", eyebrow: "Carrière V1", back: "/hub" },
  "/carriere/nouvelle": { title: "Nouvelle carrière", eyebrow: "01 · Démarrage", back: "/" },
  "/carriere/sauvegardes": { title: "Sauvegardes", eyebrow: "02 · Démarrage", back: "/" },
  "/hub": { title: "Hub du manager", eyebrow: "03 · Accueil", back: "/" },
  "/equipe/effectif": { title: "Effectif", eyebrow: "04 · Équipe", back: "/hub" },
  "/equipe/tactique": {
    title: "Composition & tactique",
    eyebrow: "06 · Équipe",
    back: "/equipe/effectif",
  },
  "/equipe/entrainement": { title: "Entraînement", eyebrow: "14 · Équipe", back: "/hub" },
  "/match/avant": { title: "Avant-match", eyebrow: "07 · Match", back: "/equipe/tactique" },
  "/match/direct": { title: "Match texte", eyebrow: "08 · Match", back: "/match/avant" },
  "/match/resume": { title: "Résumé du match", eyebrow: "09 · Match", back: "/match/direct" },
  "/saison/calendrier": { title: "Calendrier", eyebrow: "10 · Saison", back: "/hub" },
  "/saison/classement": { title: "Classement", eyebrow: "11 · Saison", back: "/saison/calendrier" },
  "/saison/simulation": {
    title: "Simulation rapide",
    eyebrow: "12 · Saison",
    back: "/saison/calendrier",
  },
  "/saison/bilan": { title: "Fin de saison", eyebrow: "13 · Saison", back: "/saison/simulation" },
  "/gestion/transferts": { title: "Transferts & contrats", eyebrow: "15 · Gestion", back: "/hub" },
  "/gestion/finances": { title: "Finances", eyebrow: "16 · Gestion", back: "/gestion/transferts" },
  "/gestion/discussions": {
    title: "Discussions & promesses",
    eyebrow: "17 · Vestiaire",
    back: "/hub",
  },
  "/gestion/presse": { title: "Presse", eyebrow: "18 · Médias", back: "/hub" },
  "/medias/fil": { title: "Fil du club", eyebrow: "19 · Médias", back: "/hub" },
  "/carriere/coach": { title: "Carrière coach", eyebrow: "20 · Carrière", back: "/hub" },
};
export function CareerShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { club, theme, setTheme } = useClubTheme();
  const { state, notice } = useCareer();
  const [settings, setSettings] = useState(false);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const main = document.getElementById("career-content");
    if (main) main.scrollTop = 0;
    setMore(false);
  }, [pathname]);
  const page = paths[pathname] ?? {
    title: "Fiche joueur",
    eyebrow: "05 · Équipe",
    back: "/equipe/effectif" as const,
  };
  const active = pathname.startsWith("/equipe")
    ? 1
    : pathname.startsWith("/match")
      ? 2
      : pathname.startsWith("/saison")
        ? 3
        : pathname.startsWith("/gestion") ||
            pathname === "/medias/fil" ||
            pathname === "/carriere/coach"
          ? 4
          : 0;
  // The start menu is autonomous; career routes keep the complete shell.
  if (pathname === "/") {
    return (
      <main id="career-content" className="career-home">
        <a href="#home-actions" className="skip-link">Aller aux actions</a>
        {children}
      </main>
    );
  }
  return (
    <div className="career-app">
      <a href="#career-content" className="skip-link">
        Aller au contenu
      </a>
      <aside className="career-rail" aria-label="Navigation principale">
        <Link to="/" className="career-brand" title="Menu de carrière">
          <Crest initials={club.initials} className="career-crest-small" />
          <span>
            Online
            <br />
            Manager
          </span>
        </Link>
        <nav aria-label="Sections de carrière">
          {navigation.map((group, i) => (
            <div key={group.label} className="career-nav-group">
              <Link
                to={group.to}
                onClick={(e) => {
                  if (
                    i === 4 &&
                    window.matchMedia("(max-height: 500px), (max-width: 1099px)").matches
                  ) {
                    e.preventDefault();
                    setMore((v) => !v);
                  }
                }}
                className={`career-nav-main ${active === i ? "is-active" : ""}`}
                aria-current={active === i ? "page" : undefined}
                title={group.label}
              >
                <group.icon size={20} strokeWidth={1.5} />
                <span>{group.label}</span>
              </Link>
              <div className={`career-nav-detail ${active === i ? "is-expanded" : ""}`}>
                {group.links.map(([label, to]) => (
                  <Link to={to} key={to} className={pathname === to ? "is-active" : ""} aria-current={pathname === to ? "page" : undefined}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="career-rail-coach"><span className="career-coach-avatar" aria-hidden="true">{state.coach.slice(0, 1)}</span><div><strong>{state.coach}</strong><span>Manager · 2026–27</span></div></div>
        <Button
          className="career-rail-theme"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          title="Changer de thème"
          aria-label="Changer de thème"
        >
          {theme === "light" ? (
            <Moon size={20} strokeWidth={1.5} />
          ) : (
            <Sun size={20} strokeWidth={1.5} />
          )}
        </Button>
      </aside>
      <div className="career-workspace">
        <header className="career-top">
          <Link to={page.back} className="career-icon" title="Retour" aria-label="Retour">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <div className="min-w-0">
            <p className="caps text-ink-2">{page.eyebrow} · 2026–27</p>
            <h1>{page.title}</h1>
          </div>
          <div className="career-club">
            <span className="career-top-club-name"><Crest initials={club.initials} className="size-6" />{club.name}</span>
            <strong className="font-mono">
              {CAREER_FIXTURES[state.current] ? `${dateLabel(CAREER_FIXTURES[state.current]?.date ?? "2027-05-30")} · J${state.current + 1}` : "Saison terminée"}
            </strong>
          </div>
          <div className="career-continue">
            <Go
              to={state.current >= 38 ? "/saison/bilan" : "/match/avant"}
              className="career-global-continue"
              ariaLabel={state.current >= 38 ? "Continuer la carrière vers le bilan de saison" : `Continuer la carrière vers l’avant-match · J${CAREER_FIXTURES[state.current]?.day ?? state.current + 1}`}
            >
              <span className="career-global-continue-copy">
                <strong>Continuer</strong>
                <small>{state.current >= 38 ? "Bilan de saison" : `Avant-match · J${CAREER_FIXTURES[state.current]?.day ?? state.current + 1}`}</small>
              </span>
            </Go>
          </div>
          <Button
            className="career-icon"
            onClick={() => setSettings(true)}
            title="Réglages"
            aria-label="Réglages"
          >
            <Settings size={20} strokeWidth={1.5} />
          </Button>
        </header>
        <nav className="career-section-tabs" aria-label={`Pages ${navigation[active]?.label ?? "de carrière"}`}>
          {navigation[active]?.links.map(([label, to]) => <Link key={to} to={to} className={pathname === to ? "is-active" : ""} aria-current={pathname === to ? "page" : undefined}>{label}</Link>)}
        </nav>
        <div className="career-demo">
          <span className="career-demo-dot" />
          <span>Données fictives · Modifications temporaires, perdues au rechargement</span>
          <span className="career-demo-version">V1 / DÉMO</span>
        </div>
        <main id="career-content" className="career-content" key={pathname}>
          {children}
        </main>
        <div className="career-notice" role="status" aria-live="polite">
          {notice || "Carrière de démonstration · Aucun moteur de jeu"}
        </div>
      </div>
      {more && (
        <div className="career-more">
          <div className="flex items-center justify-between">
            <h2 className="caps">Plus</h2>
            <Button className="career-icon" aria-label="Fermer Plus" onClick={() => setMore(false)}>
              <Menu size={20} />
            </Button>
          </div>
          {navigation[4].links.map(([label, to]) => (
            <Link key={to} to={to} onClick={() => setMore(false)}>
              {label}
              <ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
      <SettingsSheet open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}
export function CareerPage({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
