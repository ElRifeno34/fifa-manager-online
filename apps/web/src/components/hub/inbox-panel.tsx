import { Link } from "react-router";
import { useGameState } from "@/components/providers/hooks";
import { cn } from "@/lib/utils";

function UnreadTag({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="flex h-[1.125rem] min-w-[1.125rem] shrink-0 items-center justify-center rounded-full bg-club px-1.5 font-mono text-[0.6875rem] font-bold leading-none text-club-on short:h-3.5 short:min-w-3.5 short:text-[0.625rem]">
      {count}
      <span className="sr-only"> non lus</span>
    </span>
  );
}

/** Large inbox on desktop (3 latest messages); a single compact row on phones in landscape. */
export function InboxPanel({ className }: { className?: string }) {
  const { season, isUnread, unreadCount } = useGameState();
  const latest = season.messages.slice(0, 3);

  return (
    <section aria-labelledby="inbox-title" className={cn("sheet flex min-h-0 flex-col", className)}>
      <div className="flex min-h-0 flex-1 flex-col short:hidden">
        <h3 id="inbox-title">
          <Link
            to="/messagerie"
            aria-keyshortcuts="M"
            title="Ouvrir la messagerie (M)"
            className="caps group flex items-center gap-2 px-3 pb-2 pt-3 text-ink transition-colors duration-150 hover:bg-raised/60 focus-visible:outline-offset-[-2px]"
          >
            <span className="min-w-0 flex-1 truncate">Boîte de réception</span>
            <UnreadTag count={unreadCount} />
            {/* The column is narrow: the arrow alone carries "Voir tout" here. */}
            <span
              aria-hidden
              className="text-ink-3 transition-colors duration-150 group-hover:text-club-ink"
            >
              →
            </span>
            <span className="sr-only">Voir tout</span>
          </Link>
        </h3>

        <ul className="flex min-h-0 flex-1 flex-col">
          {latest.map((m) => {
            const unread = isUnread(m);
            return (
              <li key={m.id} className="min-h-0 flex-1 border-t border-line">
                <Link
                  to={`/messagerie?id=${m.id}`}
                  className="flex h-full min-h-0 items-center gap-2 overflow-hidden px-3 transition-colors duration-150 hover:bg-raised/80 focus-visible:bg-raised/80 focus-visible:outline-offset-[-2px] motion-reduce:transition-none"
                >
                  <span
                    aria-hidden
                    className={cn("size-1.5 shrink-0", unread ? "bg-club" : "bg-transparent")}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={cn("caps truncate", unread ? "text-ink" : "text-ink-2")}>
                        {m.sender}
                      </span>
                      <span className="shrink-0 font-mono text-[0.6875rem] text-ink-3">
                        {m.time}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "truncate text-[0.8125rem] leading-tight",
                        unread ? "font-semibold text-ink" : "text-ink-2",
                      )}
                    >
                      {m.subject}
                      {unread && <span className="sr-only"> (non lu)</span>}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <Link
        to="/messagerie"
        aria-label={`Boîte de réception, ${unreadCount} non lus`}
        className="hidden h-[2.125rem] min-h-0 flex-col justify-center gap-px px-2 transition-colors hover:bg-raised/80 focus-visible:outline-offset-[-2px] short:flex"
      >
        <span className="flex items-center justify-between gap-1.5">
          <span className="caps truncate text-[0.625rem] text-ink">Boîte de réception</span>
          <UnreadTag count={unreadCount} />
        </span>
        <span className="truncate text-[0.6875rem] leading-tight text-ink-2">
          {latest[0]?.subject}
        </span>
      </Link>
    </section>
  );
}
