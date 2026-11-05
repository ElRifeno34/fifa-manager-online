import { useCallback, useMemo, useState, type ReactNode } from "react";
import { GameStateContext, useClubTheme } from "./hooks";
import { getSeason, type Message } from "@/lib/season";

/**
 * Season data derived from the managed club, plus inbox read state shared by the hub, the
 * command palette and /messagerie. Read state lasts for the session (no save game yet).
 */
export function GameStateProvider({ children }: { children: ReactNode }) {
  const { club } = useClubTheme();
  const season = useMemo(() => getSeason(club), [club]);
  const [read, setRead] = useState<ReadonlySet<string>>(() => new Set());

  const markRead = useCallback((id: string) => {
    setRead((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const value = useMemo(() => {
    const isUnread = (m: Message) => !!m.unread && !read.has(m.id);
    return { season, isUnread, unreadCount: season.messages.filter(isUnread).length, markRead };
  }, [season, read, markRead]);

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}
