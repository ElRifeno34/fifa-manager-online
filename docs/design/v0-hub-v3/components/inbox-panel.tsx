import Link from 'next/link'
import { MESSAGES } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const unreadCount = MESSAGES.filter((m) => m.unread).length
const latest = MESSAGES.slice(0, 3)

function UnreadTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-[1.125rem] min-w-[1.125rem] shrink-0 items-center justify-center bg-club px-1 font-mono text-[0.6875rem] font-bold leading-none text-club-on short:h-3.5 short:min-w-3.5 short:text-[0.625rem]',
        className,
      )}
    >
      {unreadCount}
      <span className="sr-only"> non lus</span>
    </span>
  )
}

/** Large inbox on desktop (3 latest messages); a single compact row on phones in landscape. */
export function InboxPanel({ className }: { className?: string }) {
  return (
    <section aria-labelledby="inbox-title" className={cn('sheet flex min-h-0 flex-col', className)}>
      <div className="flex min-h-0 flex-1 flex-col short:hidden">
        <header className="flex items-center gap-2 px-3 pb-1.5 pt-2.5">
          <h3 id="inbox-title" className="caps flex-1 truncate text-ink">
            Boîte de réception
          </h3>
          <kbd
            aria-hidden
            className="flex h-4 min-w-4 items-center justify-center border border-line-strong px-1 font-mono text-[0.625rem] font-medium text-ink-3"
          >
            M
          </kbd>
          <UnreadTag />
        </header>

        <ul className="flex min-h-0 flex-1 flex-col">
          {latest.map((m) => (
            <li key={m.id} className="min-h-0 flex-1 border-t border-line">
              <Link
                href={`/messagerie?id=${m.id}`}
                className="group flex h-full min-h-0 items-center gap-2 overflow-hidden px-3 transition-colors duration-150 hover:bg-raised/80 focus-visible:bg-raised/80 focus-visible:outline-offset-[-2px] motion-reduce:transition-none"
              >
                <span aria-hidden className={cn('size-1.5 shrink-0', m.unread ? 'bg-club' : 'bg-transparent')} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={cn('caps truncate', m.unread ? 'text-ink' : 'text-ink-2')}>{m.sender}</span>
                    <span className="shrink-0 font-mono text-[0.6875rem] text-ink-3">{m.time}</span>
                  </span>
                  <span
                    className={cn(
                      'truncate text-[0.8125rem] leading-tight',
                      m.unread ? 'font-semibold text-ink' : 'text-ink-2',
                    )}
                  >
                    {m.subject}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/messagerie"
          className="caps flex h-8 shrink-0 items-center justify-between border-t border-line px-3 text-club-ink transition-colors duration-150 hover:bg-raised/80 focus-visible:outline-offset-[-2px] motion-reduce:transition-none"
        >
          <span>Tout voir →</span>
        </Link>
      </div>

      <Link
        href="/messagerie"
        aria-label="Boîte de réception"
        className="hidden h-[2.125rem] min-h-0 flex-col justify-center gap-px px-2 transition-colors hover:bg-raised/80 focus-visible:outline-offset-[-2px] short:flex"
      >
        <span className="flex items-center justify-between gap-1.5">
          <span className="caps truncate text-[0.625rem] text-ink">Boîte de réception</span>
          <UnreadTag />
        </span>
        <span className="truncate text-[0.6875rem] leading-tight text-ink-2">{latest[0].subject}</span>
      </Link>
    </section>
  )
}
