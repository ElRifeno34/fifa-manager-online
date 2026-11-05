import { contrast, ensureContrast, firstReadable, mix } from "./color";

export type ClubId =
  "real-madrid" | "barcelone" | "liverpool" | "psg" | "bayern" | "online-manager";

export interface Club {
  id: ClubId;
  name: string;
  initials: string;
  competition: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  subtle: string;
}

export const CLUBS: Club[] = [
  {
    id: "real-madrid",
    name: "Real Madrid",
    initials: "RM",
    competition: "LaLiga",
    primary: "#00529F",
    onPrimary: "#FFFFFF",
    secondary: "#FEBE10",
    subtle: "#E5EEF8",
  },
  {
    id: "barcelone",
    name: "FC Barcelone",
    initials: "FCB",
    competition: "LaLiga",
    primary: "#A50044",
    onPrimary: "#FFFFFF",
    secondary: "#004D98",
    subtle: "#F8E5EE",
  },
  {
    id: "liverpool",
    name: "Liverpool",
    initials: "LFC",
    competition: "Premier League",
    primary: "#C8102E",
    onPrimary: "#FFFFFF",
    secondary: "#00B2A9",
    subtle: "#FBE6E9",
  },
  {
    id: "psg",
    name: "Paris SG",
    initials: "PSG",
    competition: "Ligue 1",
    primary: "#004170",
    onPrimary: "#FFFFFF",
    secondary: "#DA291C",
    subtle: "#E3ECF3",
  },
  {
    id: "bayern",
    name: "Bayern",
    initials: "FCB",
    competition: "Bundesliga",
    primary: "#DC052D",
    onPrimary: "#FFFFFF",
    secondary: "#0066B2",
    subtle: "#FCE4E8",
  },
  {
    id: "online-manager",
    name: "Online Manager",
    initials: "OM",
    competition: "Online League",
    primary: "#0FA47A",
    onPrimary: "#FFFFFF",
    secondary: "#121A23",
    subtle: "#E3F7EF",
  },
];

export const DEFAULT_CLUB_ID: ClubId = "real-madrid";
export const CLUB_STORAGE_KEY = "om-club";
export const THEME_STORAGE_KEY = "om-theme";
export const BG_STORAGE_KEY = "om-bg-anim";

export function getClub(id: string | null | undefined): Club {
  return CLUBS.find((c) => c.id === id) ?? CLUBS[0]!;
}

export const SURFACE = { light: "#F5F3EF", dark: "#121417" } as const;
export const SCRIM = "#111418";
const INK_DARK = "#111418";
const WHITE = "#FFFFFF";

/** The palette's own text color when it is readable on `bg`, otherwise the better of white or ink. */
function readableOn(bg: string, preferred: string) {
  if (contrast(preferred, bg) >= 4.5) return preferred;
  return contrast(WHITE, bg) >= contrast(INK_DARK, bg) ? WHITE : INK_DARK;
}

/**
 * Derived tones that keep every palette readable (WCAG AA). The palettes themselves are never
 * changed: only the colors used for text, rings and accents on a known background are derived.
 */
export function clubTokens(club: Club, mode: "light" | "dark") {
  const surface = SURFACE[mode];
  const onPrimary = readableOn(club.primary, club.onPrimary);
  return {
    primary: club.primary,
    onPrimary,
    secondary: club.secondary,
    onSecondary: readableOn(club.secondary, WHITE),
    subtle: mode === "light" ? club.subtle : mix(club.primary, surface, 0.82),
    // Text in the club color on the paper sheets.
    ink: ensureContrast(club.primary, surface, 4.5, mode === "light" ? "#000000" : WHITE),
    // Accent text on the ink bands (carousel caption, top-bar tags).
    accentDark: firstReadable(
      [club.secondary, club.primary],
      SCRIM,
      4.5,
      ensureContrast(club.secondary, SCRIM, 4.5, WHITE),
    ),
    // Large display text on the club block (e.g. "El Clásico"): 3:1 is enough at that size.
    accentOnPrimary: firstReadable([club.secondary], club.primary, 3, onPrimary),
    // Rules and bars are non-text: 3:1 against the sheet.
    rule: ensureContrast(club.primary, surface, 3, mode === "light" ? "#000000" : WHITE),
  };
}

function clubVars(club: Club, mode: "light" | "dark") {
  const t = clubTokens(club, mode);
  return [
    `--club-rule:${t.rule}`,
    `--club-primary:${t.primary}`,
    `--club-on-primary:${t.onPrimary}`,
    `--club-secondary:${t.secondary}`,
    `--club-on-secondary:${t.onSecondary}`,
    `--club-primary-subtle:${t.subtle}`,
    `--club-ink:${t.ink}`,
    `--club-accent-dark:${t.accentDark}`,
    `--club-accent-on-primary:${t.accentOnPrimary}`,
  ].join(";");
}

/** Static CSS for every club in both themes, keyed on `html[data-club]`. */
export function buildClubThemeCss() {
  return CLUBS.map(
    (c) =>
      `html[data-club="${c.id}"]{${clubVars(c, "light")}}html[data-club="${c.id}"].dark{${clubVars(c, "dark")}}`,
  ).join("");
}
