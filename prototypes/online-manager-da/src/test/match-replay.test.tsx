import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CareerProvider, useCareer } from "@/components/om/career/session";
import { LiveMatchView } from "@/components/om/career/match-views";
import { CLUBS } from "@/lib/clubs";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
vi.mock("@/components/om/club-theme-provider", () => ({ useClubTheme: () => ({ club: CLUBS[0] }) }));
afterEach(cleanup);
it("replays a previous event without changing the match score, progress or lineup", () => {
  let career: ReturnType<typeof useCareer> | undefined;
  function Probe() { career=useCareer(); return <LiveMatchView />; }
  render(<CareerProvider><Probe /></CareerProvider>);
  act(() => career?.update(s => ({...s,matchStep:2})));
  const lineup=career?.state.lineup.slice();
  fireEvent.click(screen.getByRole("button",{name:"Replay"}));
  fireEvent.click(screen.getByRole("button",{name:"Temps fort précédent"}));
  expect(within(screen.getByRole("dialog")).getByText("Première occasion : la frappe de Mendes passe au-dessus.")).toBeDefined();
  fireEvent.click(screen.getByRole("button",{name:"Retour au match"}));
  expect(career?.state.matchStep).toBe(2);
  expect(career?.state.lineup).toEqual(lineup);
  expect(screen.getByText("1 – 0")).toBeDefined();
});
it("starts paused and stops scenario progression after Pause", () => {
  vi.useFakeTimers();
  try {
    let career: ReturnType<typeof useCareer> | undefined;
    function Probe() { career=useCareer(); return <LiveMatchView />; }
    render(<CareerProvider><Probe /></CareerProvider>);
    act(() => vi.advanceTimersByTime(3200));
    expect(career?.state.matchStep).toBe(0);
    fireEvent.click(screen.getByRole("button", {name:"Lecture"}));
    act(() => vi.advanceTimersByTime(1600));
    expect(career?.state.matchStep).toBe(1);
    fireEvent.click(screen.getByRole("button", {name:"Pause"}));
    act(() => vi.advanceTimersByTime(3200));
    expect(career?.state.matchStep).toBe(1);
  } finally { vi.useRealTimers(); }
});
it("refreshes replacement selections for a second substitution and keeps eleven unique players", () => {
  let career: ReturnType<typeof useCareer> | undefined;
  function Probe() { career=useCareer(); return <LiveMatchView />; }
  render(<CareerProvider><Probe /></CareerProvider>);
  for (let i=0;i<2;i++) {
    fireEvent.click(screen.getByRole("button", {name:"Faire un changement"}));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button",{name:"Confirmer"}));
  }
  expect(career?.state.substitutions).toEqual(["0′ · Adrien Morel → Pablo Navarro", "0′ · Pablo Navarro → Adrien Morel"]);
  expect(new Set(career?.state.lineup).size).toBe(11);
  expect(career?.state.matchStep).toBe(0);
});