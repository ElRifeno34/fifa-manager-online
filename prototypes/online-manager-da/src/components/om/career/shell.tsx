import { Link, useRouterState } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  Home,
  Users,
  Goal,
  CalendarDays,
  MoreHorizontal,
  Menu,
  X,
  Settings,
  ChevronRight,
  Moon,
  Sun,
  ClipboardList,
  Trophy,
  Newspaper,
  MessageCircle,
  FastForward,
  Dumbbell,
  ArrowLeftRight,
  UserRound,
  Briefcase,
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
const referenceNavigation = [
  { label: "Avancer", icon: FastForward, to: "/match/avant", primary: true },
  { label: "Effectif", icon: Users, to: "/equipe/effectif", badge: 2 },
  { label: "Tactique", icon: ClipboardList, to: "/equipe/tactique" },
  { label: "Entraînement", icon: Dumbbell, to: "/equipe/entrainement" },
  { label: "Transferts", icon: ArrowLeftRight, to: "/gestion/transferts", badge: 3 },
  { label: "Compétition", icon: Trophy, to: "/saison/calendrier" },
  { label: "Médias", icon: Newspaper, to: "/medias/fil", badge: 5 },
  { label: "Carrière coach", icon: UserRound, to: "/carriere/coach" },
  { label: "Bureau du manager", icon: Briefcase, to: "/gestion/discussions" },
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
    if (settings || more || pathname === "/") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey ||
          (event.target instanceof HTMLElement && (event.target.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)))) return;
      if (/^[1-9]$/.test(event.key)) {
        event.preventDefault();
        document.querySelector<HTMLAnchorElement>(`[data-career-shortcut="${event.key}"]`)?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pathname, settings, more]);
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
    <div className={`career-app ${pathname === "/hub" ? "is-hub" : ""}`}>
      <a href="#career-content" className="skip-link">
        Aller au contenu
      </a>
      <aside className="career-rail" aria-label="Navigation principale">
        <Link to="/" className="career-brand" title="Menu de carrière">
          <Crest initials={club.initials} className="career-crest-small" />
          <span><strong>{club.name}</strong><small>{club.competition} · 2026–27</small></span>
        </Link>
        <nav aria-label="Sections de carrière" className="career-navigation-list">
          {referenceNavigation.map((item, index) => {
            const selected = pathname === item.to ||
               (item.to === "/gestion/transferts" && pathname === "/gestion/finances") ||
               (item.to === "/medias/fil" && pathname === "/gestion/presse") ||
              (item.to === "/equipe/effectif" && pathname.startsWith("/equipe/joueur/")) ||
              (item.to === "/saison/calendrier" && (pathname.startsWith("/saison/") || pathname.startsWith("/match/")));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`career-nav-main ${"primary" in item ? "is-primary" : ""} ${selected ? "is-active" : ""}`}
                data-career-shortcut={index + 1}
                aria-keyshortcuts={String(index + 1)}
                aria-current={selected ? (pathname === item.to ? "page" : "true") : undefined}
                aria-label={`${item.label}${"badge" in item ? `, ${item.badge} notifications` : ""}`}
                title={item.label}
              >
                <item.icon size={20} strokeWidth={1.5} aria-hidden="true" />
                <span>{item.label}</span>
                {"badge" in item && <span className="career-menu-badge" aria-hidden="true">{item.badge}</span>}
              </Link>
            );
          })}

        </nav>
        <div className="career-rail-tools"><Link to="/hub" className="career-icon" title="Accueil du manager" aria-label="Accueil du manager"><Home size={20} aria-hidden="true" /></Link><Dialog.Root open={more} onOpenChange={setMore}><Dialog.Trigger asChild><Button className="career-icon" title="Toutes les pages" aria-label="Plus : toutes les pages"><MoreHorizontal size={20} aria-hidden="true" /></Button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="career-navigation-overlay" /><Dialog.Content className="career-more" id="career-more-menu"><div className="flex items-center justify-between"><Dialog.Title className="caps">Toutes les pages</Dialog.Title><Dialog.Close asChild><Button className="career-icon" aria-label="Fermer toutes les pages" title="Fermer"><X size={20} aria-hidden="true" /></Button></Dialog.Close></div><Dialog.Description className="sr-only">Choisir une destination de carrière.</Dialog.Description><nav aria-label="Toutes les pages de carrière">{navigation.map(group => group.links.map(([label, to]) => <Link key={to} to={to} aria-current={pathname === to ? "page" : undefined} onClick={() => setMore(false)}>{label}<ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" /></Link>))}</nav></Dialog.Content></Dialog.Portal></Dialog.Root></div>
        <div className="career-rail-coach"><span className="career-coach-avatar" aria-hidden="true">{state.coach.slice(0, 1)}</span><div><strong>{state.coach}</strong><span>Manager · 2026–27</span></div></div>
        <Button
          className="career-rail-theme"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          title={theme === "light" ? "Activer le thème sombre" : "Activer le thème clair"}
          aria-label={theme === "light" ? "Activer le thème sombre" : "Activer le thème clair"}
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
          <Link to={page.back} className="career-icon" title={`Retour : ${paths[page.back]?.title ?? "Effectif"}`} aria-label={`Retour : ${paths[page.back]?.title ?? "Effectif"}`}>
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <div className="min-w-0">
            <p className="caps text-ink-2">Carrière · 2026–27</p>
            <h1>{page.title}</h1>
          </div>
          <div className="career-club">
            <span className="career-top-club-name"><Crest initials={club.initials} className="size-6" />{club.name}</span>
            <strong className="font-mono">
              {CAREER_FIXTURES[state.current] ? `${dateLabel(CAREER_FIXTURES[state.current]?.date ?? "2027-05-30")} · J${state.current + 1}` : "Saison terminée"}
            </strong>
          </div>
          <div className="career-continue"><Go to={state.current >= 38 ? "/saison/bilan" : "/match/avant"}>{state.current >= 38 ? "Bilan" : "Prochain match"}</Go></div>
          <Button
            className="career-icon"
            onClick={() => setSettings(true)}
            title="Réglages"
            aria-label="Ouvrir les réglages du jeu"
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
        <main id="career-content" className={`career-content ${pathname !== "/hub" ? "career-screen" : ""}`} key={pathname}>
          {children}
        </main>
        <div className="career-notice" role="status" aria-live="polite">
          {notice || "Carrière de démonstration · Aucun moteur de jeu"}
        </div>
      </div>
      <SettingsSheet open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}
export function CareerPage({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
