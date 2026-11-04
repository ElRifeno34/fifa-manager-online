import { Crest } from '@/components/crest'
import { CalendarDay } from '@/components/calendar-day'
import { CALENDAR, NEXT_MATCH } from '@/lib/mock-data'

export function CalendarPanel() {
  return (
    <aside
      aria-label="Calendrier"
      className="flex min-h-0 flex-col overflow-hidden rounded-lg bg-surface shadow-panel"
    >
      <div className="flex items-start justify-between gap-2 bg-club px-4 py-3.5 text-club-on short:px-2.5 short:py-2">
        <div className="min-w-0">
          <p className="font-display text-xl font-semibold uppercase leading-none tracking-wide short:text-[1rem]">
            {NEXT_MATCH.date}
          </p>
          <p className="mt-1.5 text-sm font-medium opacity-90 short:mt-1 short:text-xs">{NEXT_MATCH.venue}</p>
          <p className="mt-1 font-display text-lg font-semibold uppercase leading-none tracking-wide text-club-accent-on short:mt-0.5 short:text-sm">
            {NEXT_MATCH.title}
          </p>
        </div>
        <Crest
          initials={NEXT_MATCH.opponent.initials}
          primary={NEXT_MATCH.opponent.primary}
          secondary={NEXT_MATCH.opponent.secondary}
          compact
          className="mt-0.5 size-10 shrink-0 short:size-7"
        />
      </div>

      <ol className="flex min-h-0 flex-1 flex-col py-1 short:py-0.5">
        {CALENDAR.map((entry, i) => (
          <CalendarDay key={entry.day} entry={entry} className={i >= 4 ? 'short:hidden' : undefined} />
        ))}
      </ol>
    </aside>
  )
}
