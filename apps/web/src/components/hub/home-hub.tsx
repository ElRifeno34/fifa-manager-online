import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Inbox,
  Mail,
  MoonStar,
  Palette,
  Settings,
  Sun,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { CalendarPanel } from "@/components/hub/calendar-panel";
import { CommandPalette, type Command } from "@/components/hub/command-palette";
import { DataPanel, DataRows, DataTabs } from "@/components/hub/data-panel";
import { Dialog } from "@/components/hub/dialog";
import { InboxPanel } from "@/components/hub/inbox-panel";
import { KeyHintBar } from "@/components/hub/key-hint";
import { AdvanceBlock, MenuTile } from "@/components/hub/menu-tile";
import { NewsCarousel } from "@/components/hub/news-carousel";
import { SettingsSheet } from "@/components/hub/settings-sheet";
import { TopBar } from "@/components/hub/top-bar";
import { useClubTheme } from "@/components/providers/hooks";
import { useGameState } from "@/components/providers/hooks";
import { NOT_IN_PROTOTYPE, useToast } from "@/components/providers/hooks";
import { CLUBS } from "@/lib/clubs";
import { MENU, READINESS_WARNINGS } from "@/lib/season";

const rowItems = MENU.slice(1);

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

export function HomeHub() {
  const { club, theme, setClub, setTheme } = useClubTheme();
  const { season } = useGameState();
  const toast = useToast();
  const navigate = useNavigate();
  const [storyIndex, setStoryIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const advanceRef = useRef<HTMLButtonElement>(null);
  const tileRefs = useRef<(HTMLElement | null)[]>([]);

  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const closeConfirm = useCallback(() => setConfirmOpen(false), []);
  const notYet = useCallback(() => toast.show(NOT_IN_PROTOTYPE), [toast]);

  const advance = useCallback(() => {
    if (READINESS_WARNINGS.length) setConfirmOpen(true);
    else toast.show("Journée suivante…");
  }, [toast]);

  const anyOverlay = settingsOpen || paletteOpen || confirmOpen;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (anyOverlay || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (!e.repeat) advance();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setStoryIndex((i) => (i + 1) % season.news.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStoryIndex((i) => (i - 1 + season.news.length) % season.news.length);
      } else if (e.key === "1") {
        advanceRef.current?.focus();
      } else if (/^[2-9]$/.test(e.key)) {
        tileRefs.current[Number(e.key) - 2]?.focus();
      } else if (e.key === "m" || e.key === "M") {
        navigate("/messagerie");
      }
    };
    // Stops a focused button from also being "clicked" when Space is used as the advance shortcut.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && !anyOverlay && !isTyping(e.target)) e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [anyOverlay, advance, navigate, season.news.length]);

  const openTile = (id: string) => {
    if (id !== "medias") notYet();
  };

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      {
        id: "avancer",
        label: "Avancer à la prochaine journée",
        group: "Actions",
        hint: "Espace",
        run: advance,
      },
      ...rowItems.map((item, i) => ({
        id: `menu-${item.id}`,
        label: item.label,
        group: "Sections",
        icon: item.icon,
        hint: String(i + 2),
        run: () => (item.href ? navigate(item.href) : notYet()),
      })),
      {
        id: "inbox",
        label: "Boîte de réception",
        group: "Sections",
        icon: Inbox,
        hint: "M",
        run: () => navigate("/messagerie"),
      },
      ...season.messages.map((m) => ({
        id: `msg-${m.id}`,
        label: m.subject,
        group: "Messages",
        icon: Mail,
        keywords: m.sender,
        hint: m.time,
        run: () => navigate(`/messagerie?id=${m.id}`),
      })),
      ...season.scorers.map((p) => ({
        id: `player-${p.name}`,
        label: p.name,
        group: "Joueurs",
        icon: UserRound,
        hint: `${p.value} buts`,
        run: notYet,
      })),
      ...CLUBS.filter((c) => c.id !== club.id).map((c) => ({
        id: `club-${c.id}`,
        label: `Passer aux couleurs de ${c.name}`,
        group: "Clubs",
        icon: Palette,
        keywords: c.competition,
        run: () => setClub(c.id),
      })),
      {
        id: "theme",
        label: theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre",
        group: "Réglages",
        icon: theme === "dark" ? Sun : MoonStar,
        run: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
      {
        id: "settings",
        label: "Ouvrir les réglages",
        group: "Réglages",
        icon: Settings,
        run: () => setSettingsOpen(true),
      },
    ];
    return list;
  }, [advance, club.id, navigate, notYet, season, setClub, setTheme, theme]);

  const registerRef = (i: number) => (el: HTMLElement | null) => {
    tileRefs.current[i] = el;
  };

  const leagueRound = `${club.competition} · J11`;

  return (
    <main
      id="contenu"
      className="mx-auto flex h-dvh w-full flex-col gap-4 overflow-hidden p-6 short:gap-1.5 short:p-2 short:pb-[max(0.5rem,env(safe-area-inset-bottom))] short:pl-[max(0.5rem,env(safe-area-inset-left))] short:pr-[max(0.5rem,env(safe-area-inset-right))] short:pt-[max(0.5rem,env(safe-area-inset-top))]"
    >
      <TopBar
        club={club}
        budget="84,5 M€"
        onOpenSearch={() => setPaletteOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="grid min-h-0 flex-1 grid-cols-[14.5rem_minmax(0,1fr)_13.75rem] gap-4 short:grid-cols-[10.5rem_minmax(0,1fr)_9.375rem] short:gap-2 short:max-[720px]:grid-cols-[10.5rem_minmax(0,1fr)_8.5rem]">
        <nav aria-label="Menu principal" className="flex min-h-0 flex-col gap-2 short:gap-1">
          <AdvanceBlock
            ref={advanceRef}
            subline={season.advanceSubline}
            warnings={READINESS_WARNINGS}
            onClick={advance}
          />

          <InboxPanel className="flex-1 short:flex-none" />

          <div className="paper flex shrink-0 flex-col py-1 short:min-h-0 short:flex-1 short:py-0.5">
            {rowItems.map((item, i) => (
              <MenuTile
                key={item.id}
                ref={registerRef(i)}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                href={item.href}
                index={String(i + 2).padStart(2, "0")}
                shortcut={String(i + 2)}
                onClick={() => openTile(item.id)}
              />
            ))}
          </div>
        </nav>

        <div className="flex min-h-0 min-w-0 flex-col gap-4 short:gap-1.5">
          <NewsCarousel
            stories={season.news}
            index={storyIndex}
            onIndexChange={setStoryIndex}
            onSeeAll={notYet}
            className="min-h-0 flex-1"
          />

          <div className="grid grid-cols-2 gap-4 short:hidden">
            <DataPanel index="01" title={`Classement · ${leagueRound}`} onSeeAll={notYet}>
              <DataRows rows={season.standings} />
            </DataPanel>
            <DataPanel index="02" title={`Buteurs · ${club.competition}`} onSeeAll={notYet}>
              <DataRows rows={season.scorers} />
            </DataPanel>
          </div>
          <DataTabs
            tabs={[
              { id: "classement", label: "Classement", rows: season.standings },
              { id: "buteurs", label: "Buteurs", rows: season.scorers },
            ]}
            className="hidden short:flex"
          />
        </div>

        <CalendarPanel onSeeAll={notYet} />
      </div>

      <KeyHintBar />

      <SettingsSheet open={settingsOpen} onClose={closeSettings} />
      <CommandPalette open={paletteOpen} onClose={closePalette} commands={commands} />

      <Dialog
        open={confirmOpen}
        onClose={closeConfirm}
        labelledBy="confirm-title"
        describedBy="confirm-desc"
        className="max-w-[26rem]"
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <p className="caps text-club-ink">Avant le match</p>
            <h2
              id="confirm-title"
              className="font-display text-2xl font-bold uppercase leading-none tracking-tight text-ink"
            >
              Avancer quand même ?
            </h2>
          </div>
          <div id="confirm-desc" className="flex flex-col gap-2">
            <p className="text-sm text-ink-2">
              Le prochain match contre {season.rival.name} se joue dimanche. Il reste :
            </p>
            <ul className="flex flex-col border-t border-line">
              {READINESS_WARNINGS.map((w) => (
                <li
                  key={w}
                  className="flex items-center gap-2 border-b border-line py-2 text-sm font-semibold text-ink"
                >
                  <TriangleAlert
                    className="size-4 shrink-0 text-warning"
                    strokeWidth={2}
                    aria-hidden
                  />
                  {w}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              data-autofocus
              onClick={() => {
                closeConfirm();
                notYet();
              }}
              className="caps h-10 rounded-md border border-line-strong px-4 text-ink transition-colors duration-150 hover:bg-raised"
            >
              Voir la compo
            </button>
            <button
              type="button"
              onClick={() => {
                closeConfirm();
                toast.show("Journée suivante…");
              }}
              className="caps h-10 rounded-md bg-club px-4 text-club-on transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--club-primary)_88%,black)]"
            >
              Continuer quand même
            </button>
          </div>
        </div>
      </Dialog>
    </main>
  );
}
