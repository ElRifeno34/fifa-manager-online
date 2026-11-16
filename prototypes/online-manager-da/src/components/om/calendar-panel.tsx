import { Crest } from '@/components/om/crest'
import { CalendarDay } from '@/components/om/calendar-day'
import { SectionHeader } from '@/components/om/data-panel'
import { getClubCalendar, getNextMatch } from '@/data/mock'
import { useClubTheme } from '@/components/om/club-theme-provider'

export function CalendarPanel() {
  const { club } = useClubTheme()
  const NEXT_MATCH = getNextMatch(club)
  const CALENDAR = getClubCalendar(club)
  return (
    <aside aria-label="Calendrier" className="sheet flex min-h-0 flex-col overflow-hidden">
      <SectionHeader index="03" title="Calendrier" className="short:hidden" />

      <div className="calendar-fixture flex items-start justify-between gap-2 border-b border-line bg-raised p-4 text-ink short:p-2">
        <div className="min-w-0">
          <p className="caps text-[0.6875rem] opacity-80 short:hidden">Prochain match</p>
          <p className="mt-1 flex items-baseline gap-1.5 leading-none short:mt-0">
            <span className="font-display text-[1.375rem] font-bold uppercase short:text-[0.9375rem] short:max-[720px]:text-[0.8125rem]">
              {NEXT_MATCH.weekday}
            </span>
            <span className="whitespace-nowrap font-mono text-[1.375rem] font-bold short:text-[0.9375rem] short:max-[720px]:text-[0.8125rem]">
              {NEXT_MATCH.date}
            </span>
          </p>
          <p className="mt-1.5 whitespace-nowrap text-[0.8125rem] font-medium opacity-90 short:mt-1 short:text-[0.6875rem] short:max-[720px]:text-[0.6875rem]">
            {NEXT_MATCH.venue} · <span className="font-mono">{NEXT_MATCH.time}</span>
          </p>
          <p className="mt-1 font-display text-[0.9375rem] font-bold uppercase leading-none tracking-normal text-club-accent-on short:mt-0.5 short:text-[0.8125rem]">
            {NEXT_MATCH.title}
          </p>
        </div>
        <Crest
          initials={NEXT_MATCH.opponent.initials}
          primary={NEXT_MATCH.opponent.primary}
          secondary={NEXT_MATCH.opponent.secondary}
          compact
          className="size-10 shrink-0 short:size-7 short:max-[720px]:size-6"
        />
      </div>

      <ol className="flex min-h-0 flex-1 flex-col">
        {CALENDAR.map((entry, i) => (
          <CalendarDay key={entry.day} entry={entry} className={i >= 4 ? 'short:hidden' : undefined} />
        ))}
      </ol>
    </aside>
  )
}
