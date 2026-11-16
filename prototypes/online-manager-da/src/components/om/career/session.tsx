import { createContext, useContext, useState, type ReactNode } from "react";
import { CAREER_PLAYERS, CAREER_INITIAL_FEED, CAREER_BUDGET, type CareerPlayer } from "@/data/mock";
export interface FeedEvent {
  id: string;
  title: string;
  body: string;
  type: string;
  destination: string;
}
export interface PromiseItem {
  id: string;
  player: string;
  text: string;
  status: "En cours" | "Tenue" | "Abandonnée";
}
export interface CareerState {
  coach: string;
  selectedPlayer: string;
  current: number;
  squad: CareerPlayer[];
  lineup: string[];
  formation: string;
  mentality: string;
  pressing: string;
  validated: boolean;
  matchStep: number;
  substitutions: string[];
  completed: string[];
  simulation: string[];
  budget: number;
  salary: number;
  transfer: boolean;
  promises: PromiseItem[];
  feed: FeedEvent[];
  training: string;
  intensity: string;
  trainingDone: boolean;
  saved: { name: string; current: number; snapshot: Omit<CareerState, "saved"> }[];
}
export function initialCareer(current = 11, coach = "Alex Morgan"): CareerState {
  return {
    coach,
    selectedPlayer: "p8",
    current,
    squad: CAREER_PLAYERS.map((p) => ({ ...p })),
    lineup: CAREER_PLAYERS.slice(0, 11).map((p) => p.id),
    formation: "4-3-3",
    mentality: "Équilibrée",
    pressing: "Normal",
    validated: false,
    matchStep: 0,
    substitutions: [],
    completed: [],
    simulation: [],
    budget: CAREER_BUDGET,
    salary: 0,
    transfer: false,
    promises: [],
    feed: CAREER_INITIAL_FEED.map((e) => ({ ...e })),
    training: "Collectif",
    intensity: "Modérée",
    trainingDone: false,
    saved: [],
  };
}
interface CareerContextValue {
  state: CareerState;
  update: (fn: (s: CareerState) => CareerState) => void;
  reset: (current?: number, coach?: string) => void;
  notice: string;
  notify: (s: string) => void;
}
const CareerContext = createContext<CareerContextValue | null>(null);
export function CareerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => initialCareer());
  const [notice, notify] = useState("");
  return (
    <CareerContext.Provider
      value={{
        state,
        update: setState,
        reset: (i = 11, c = "Alex Morgan") => {
          setState(initialCareer(i, c));
          notify("Carrière fictive ouverte. Les changements restent temporaires.");
        },
        notice,
        notify,
      }}
    >
      {children}
    </CareerContext.Provider>
  );
}
export function useCareer() {
  const ctx = useContext(CareerContext);
  if (!ctx) throw new Error("CareerProvider manquant");
  return ctx;
}
export function findPlayers(
  players: CareerPlayer[],
  query: string,
  position: string,
  status: string,
  sort: string,
) {
  const q = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return players
    .filter(
      (p) =>
        p.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .includes(q) &&
        (position === "Tous" || p.position === position) &&
        (status === "Tous" || p.status === status),
    )
    .sort((a, b) =>
      sort === "age"
        ? a.age - b.age
        : sort === "fatigue"
          ? b.fatigue - a.fatigue
          : sort === "minutes"
            ? b.minutes - a.minutes
            : sort === "name"
              ? a.name.localeCompare(b.name, "fr")
              : b.rating - a.rating,
    );
}

export function captureCareer(state: CareerState) {
  const { saved, ...snapshot } = state;
  return structuredClone(snapshot);
}
export function restoreCareer(state: CareerState, index: number) {
  const save = state.saved[index];
  return save ? { ...structuredClone(save.snapshot), saved: state.saved } : state;
}
