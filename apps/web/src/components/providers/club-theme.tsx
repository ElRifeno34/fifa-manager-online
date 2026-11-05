import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BG_STORAGE_KEY,
  CLUB_STORAGE_KEY,
  THEME_STORAGE_KEY,
  getClub,
  type ClubId,
} from "@/lib/clubs";

import { ClubThemeContext, type Theme } from "./hooks";

/**
 * Owns the club palette + light/dark theme. The CSS variables themselves are
 * emitted statically (see `buildClubThemeCss`); this provider only flips
 * `data-club` / `.dark` on <html>, persists the choice and animates the change.
 */
export function ClubThemeProvider({ children }: { children: ReactNode }) {
  // The boot script in index.html has already applied the saved choices to <html>; start from them.
  const [clubId, setClubId] = useState<ClubId>(
    () => getClub(document.documentElement.getAttribute("data-club")).id,
  );
  const [theme, setThemeState] = useState<Theme>(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  const [animatedBg, setAnimatedBgState] = useState(
    () => document.documentElement.getAttribute("data-bg") !== "static",
  );
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animate = useCallback(() => {
    const root = document.documentElement;
    root.classList.add("theme-anim");
    if (animTimer.current) clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => root.classList.remove("theme-anim"), 280);
  }, []);

  const setClub = useCallback(
    (id: ClubId) => {
      animate();
      document.documentElement.setAttribute("data-club", id);
      setClubId(id);
      try {
        localStorage.setItem(CLUB_STORAGE_KEY, id);
      } catch {}
    },
    [animate],
  );

  const setTheme = useCallback(
    (next: Theme) => {
      animate();
      document.documentElement.classList.toggle("dark", next === "dark");
      setThemeState(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
    },
    [animate],
  );

  const setAnimatedBg = useCallback((on: boolean) => {
    const root = document.documentElement;
    if (on) root.removeAttribute("data-bg");
    else root.setAttribute("data-bg", "static");
    setAnimatedBgState(on);
    try {
      localStorage.setItem(BG_STORAGE_KEY, on ? "on" : "off");
    } catch {}
  }, []);

  const value = useMemo(
    () => ({ club: getClub(clubId), theme, setClub, setTheme, animatedBg, setAnimatedBg }),
    [clubId, theme, setClub, setTheme, animatedBg, setAnimatedBg],
  );

  return <ClubThemeContext.Provider value={value}>{children}</ClubThemeContext.Provider>;
}
