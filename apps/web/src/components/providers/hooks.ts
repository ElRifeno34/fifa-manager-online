import { createContext, useContext } from "react";
import type { Club, ClubId } from "@/lib/clubs";
import type { Message, SeasonView } from "@/lib/season";

/*
 * Contexts and hooks live here, apart from the provider components. A module that exports both a
 * component and a hook cannot be hot-reloaded: React recreates the context and every consumer
 * suddenly sits outside its provider ("useToast must be used inside ToastProvider" → blank page).
 */

// ---------------------------------------------------------------- club theme

export type Theme = "light" | "dark";

export interface ClubThemeContextValue {
  club: Club;
  theme: Theme;
  setClub: (id: ClubId) => void;
  setTheme: (theme: Theme) => void;
  animatedBg: boolean;
  setAnimatedBg: (on: boolean) => void;
}

export const ClubThemeContext = createContext<ClubThemeContextValue | null>(null);

export function useClubTheme() {
  const ctx = useContext(ClubThemeContext);
  if (!ctx) throw new Error("useClubTheme must be used inside ClubThemeProvider");
  return ctx;
}

// ---------------------------------------------------------------- game state

export interface GameStateValue {
  season: SeasonView;
  isUnread: (message: Message) => boolean;
  unreadCount: number;
  markRead: (id: string) => void;
}

export const GameStateContext = createContext<GameStateValue | null>(null);

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error("useGameState must be used inside GameStateProvider");
  return ctx;
}

// ---------------------------------------------------------------- toasts

export interface ToastAction {
  label: string;
  onAction: () => void;
}

export interface ToastContextValue {
  show: (message: string, action?: ToastAction) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

/** Message shown for every destination the prototype does not have yet. */
export const NOT_IN_PROTOTYPE = "Pas encore disponible dans le prototype";

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
