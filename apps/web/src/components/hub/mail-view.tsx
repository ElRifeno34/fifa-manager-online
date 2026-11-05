import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Inbox } from "lucide-react";
import { KeyHint } from "@/components/hub/key-hint";
import { NumericText } from "@/components/hub/numeric-text";
import { useGameState } from "@/components/providers/hooks";
import { NOT_IN_PROTOTYPE, useToast } from "@/components/providers/hooks";
import { MESSAGE_FILTERS, type FilterId, type Message } from "@/lib/season";
import { cn } from "@/lib/utils";

/** Actions whose result the manager may want to take back right away. */
const UNDOABLE: Record<string, string> = {
  Accepter: "Proposition acceptée",
  Refuser: "Proposition refusée",
};

export function MailView() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const { season, isUnread, unreadCount, markRead } = useGameState();
  const messages = season.messages;
  const [filter, setFilter] = useState<FilterId>("tous");
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const listRef = useRef<HTMLUListElement>(null);

  // "Non lus" keeps showing the messages that were unread when the view opened,
  // so a message does not vanish from under the cursor once it is read.
  const [initiallyUnread] = useState(() => new Set(messages.filter(isUnread).map((m) => m.id)));
  const matches = (m: Message, f: FilterId) =>
    f === "tous" ? true : f === "non-lus" ? initiallyUnread.has(m.id) : m.category === f;

  const visible = useMemo(() => messages.filter((m) => matches(m, filter)), [messages, filter]); // eslint-disable-line react-hooks/exhaustive-deps
  const requested = params.get("id");
  const selected = visible.find((m) => m.id === requested) ?? visible[0];

  const select = (id: string) => setParams({ id }, { replace: true });

  useEffect(() => {
    if (selected) markRead(selected.id);
  }, [selected, markRead]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector("[role='dialog']")) return;
      if (e.key === "Escape") {
        navigate("/");
      } else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && visible.length) {
        e.preventDefault();
        const i = Math.max(
          0,
          visible.findIndex((m) => m.id === selected?.id),
        );
        const next =
          visible[Math.min(visible.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1)))];
        if (next) {
          select(next.id);
          listRef.current?.querySelector<HTMLElement>(`[data-id="${next.id}"]`)?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }); // re-bound each render: it reads the current selection

  const runAction = (message: Message, action: string) => {
    const done = UNDOABLE[action];
    if (!done) {
      toast.show(NOT_IN_PROTOTYPE);
      return;
    }
    setDecisions((d) => ({ ...d, [message.id]: done }));
    toast.show(done, {
      label: "Annuler",
      onAction: () =>
        setDecisions((d) => {
          const next = { ...d };
          delete next[message.id];
          return next;
        }),
    });
  };

  const emptyLabel = MESSAGE_FILTERS.find((f) => f.id === filter)?.label ?? "";

  return (
    <main
      id="contenu"
      className="mx-auto flex h-dvh max-w-[96rem] flex-col gap-3 p-6 short:gap-1.5 short:p-2 short:pb-[max(0.5rem,env(safe-area-inset-bottom))] short:pl-[max(0.5rem,env(safe-area-inset-left))] short:pr-[max(0.5rem,env(safe-area-inset-right))] short:pt-[max(0.5rem,env(safe-area-inset-top))]"
    >
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 short:gap-2">
          <Link
            to="/"
            title="Retour au hub (Échap)"
            aria-keyshortcuts="Escape"
            className="caps flex h-8 items-center gap-2 rounded-md bg-overlay px-3 text-inverse transition-colors duration-150 hover:bg-club hover:text-club-on short:h-7 short:px-2"
          >
            <ArrowLeft className="size-4 text-club-accent-dark" aria-hidden />
            <span className="short:sr-only">Retour</span>
          </Link>
          <h1 className="flex items-baseline gap-2.5 font-display text-2xl font-bold uppercase leading-none tracking-tight text-ink short:text-lg">
            <span className="font-mono text-sm font-bold text-club-ink">M</span>
            <span aria-hidden className="text-ink-3">
              —
            </span>
            Boîte de réception
          </h1>
        </div>
        <p
          className="caps flex items-center gap-2 rounded-md bg-overlay px-3 py-2 text-inverse/80 short:py-1.5"
          aria-live="polite"
        >
          <span className="font-mono text-sm font-bold text-inverse">{unreadCount}</span> non lus
        </p>
      </header>

      <div className="sheet grid min-h-0 flex-1 grid-cols-[minmax(0,24rem)_minmax(0,1fr)] short:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]">
        <section
          aria-label="Liste des messages"
          className="flex min-h-0 flex-col border-r border-line"
        >
          <div
            role="tablist"
            aria-label="Filtres"
            className="no-scrollbar flex shrink-0 overflow-x-auto border-b border-line px-1.5 short:px-1"
          >
            {MESSAGE_FILTERS.map((f) => {
              const count = messages.filter((m) => matches(m, f.id)).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "caps relative flex shrink-0 items-baseline gap-1 px-2 py-2.5 transition-colors duration-150 short:px-1.5 short:py-1.5 short:text-[0.625rem]",
                    filter === f.id ? "text-ink" : "text-ink-3 hover:text-ink-2",
                  )}
                >
                  {f.label}
                  {/* Only "Non lus" needs a count: it is the one filter the manager acts on. */}
                  {f.id === "non-lus" && (
                    <span className="font-mono text-[0.625rem] tracking-normal text-ink-3">
                      {count}
                    </span>
                  )}
                  {filter === f.id && (
                    <span aria-hidden className="absolute inset-x-1 bottom-0 h-0.5 bg-club-rule" />
                  )}
                </button>
              );
            })}
          </div>

          {visible.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
              <Inbox className="size-6 text-ink-3" strokeWidth={1.5} aria-hidden />
              <p className="text-sm text-ink-2">Aucun message dans {emptyLabel}.</p>
            </div>
          ) : (
            <ul ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
              {visible.map((m) => {
                const active = m.id === selected?.id;
                const unread = isUnread(m);
                return (
                  <li key={m.id} className="border-b border-line">
                    <button
                      type="button"
                      data-id={m.id}
                      onClick={() => select(m.id)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "relative flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-raised/80 focus-visible:outline-offset-[-2px] short:gap-2 short:px-2 short:py-1.5",
                        active && "bg-raised",
                      )}
                    >
                      {active && (
                        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-club-rule" />
                      )}
                      <span
                        aria-hidden
                        className={cn(
                          "mt-1.5 size-1.5 shrink-0",
                          unread ? "bg-club" : "bg-transparent",
                        )}
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
                            "truncate text-[0.8125rem] leading-snug short:text-xs",
                            unread ? "font-semibold text-ink" : "text-ink-2",
                          )}
                        >
                          {m.subject}
                          {unread && <span className="sr-only"> (non lu)</span>}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {selected ? (
          <article aria-label={selected.subject} className="flex min-h-0 min-w-0 flex-col">
            <header className="shrink-0 border-b border-line px-6 py-4 short:px-3 short:py-2">
              <p className="caps flex items-center justify-between gap-3 text-ink-2">
                <span className="truncate text-ink">{selected.sender}</span>
                <span className="shrink-0 font-mono text-xs tracking-normal text-ink-3">
                  {selected.received}
                </span>
              </p>
              <h2 className="mt-2 text-balance font-display text-[1.75rem] font-bold uppercase leading-[1.05] tracking-tight text-ink short:mt-1 short:text-lg">
                <NumericText>{selected.subject}</NumericText>
              </h2>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 short:px-3 short:py-2">
              <div className="flex max-w-[40rem] flex-col gap-3 text-[0.9375rem] leading-relaxed text-ink-2 short:gap-1.5 short:text-xs">
                {selected.body.map((p, i) => (
                  <p key={i} className="text-pretty">
                    <NumericText>{p}</NumericText>
                  </p>
                ))}
              </div>
            </div>

            <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-line px-6 py-3 short:px-3 short:py-1.5">
              {decisions[selected.id] ? (
                <p className="caps flex h-9 items-center gap-2 text-ink short:h-7">
                  <span className="size-2 bg-success" aria-hidden />
                  {decisions[selected.id]}
                </p>
              ) : (
                selected.actions.map((action, i) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => runAction(selected, action)}
                    className={cn(
                      "caps h-9 rounded-md px-4 transition-colors duration-150 short:h-7 short:px-3 short:text-[0.625rem]",
                      i === 0
                        ? "bg-club text-club-on hover:bg-[color-mix(in_oklab,var(--club-primary)_88%,black)]"
                        : "border border-line-strong text-ink hover:bg-raised",
                    )}
                  >
                    {action}
                  </button>
                ))
              )}
            </footer>
          </article>
        ) : (
          <div className="flex items-center justify-center text-sm text-ink-3">
            Sélectionnez un message.
          </div>
        )}
      </div>

      <div className="flex items-center gap-5 self-start rounded-lg bg-overlay px-5 py-2 short:hidden">
        <KeyHint keys="↑ ↓" label="Changer de message" />
        <KeyHint keys="Échap" label="Retour" />
      </div>
    </main>
  );
}
