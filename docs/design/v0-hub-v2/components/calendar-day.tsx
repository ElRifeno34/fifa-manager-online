import { Crest } from '@/components/crest'
import type { CalendarEntry } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function CalendarDay({ entry, className }: { entry: CalendarEntry; className?: string }) {
  const { day, weekday, today, match } = entry
  const label = match
    ? `${weekday} ${day} novembre : ${match.venue === 'DOM.' ? 'domicile' : 'extérieur'} contre ${match.opponentName}${match.competition ? `, ${match.competition}` : ''}`
    : `${weekday} ${day} novembre : pas de match`

  return (
    <li
      aria-label={label}
      aria-current={today ? 'date' : undefined}
      className={cn(
        'mx-1.5 flex min-h-0 flex-1 items-center gap-2.5 rounded px-2.5 short:mx-1 short:gap-2 short:px-2',
        today && 'bg-club-subtle',
        className,
      )}
    >
      <span
        className={cn(
          'w-7 text-right font-display text-xl font-semibold leading-none tabular-nums short:w-6 short:text-[1rem]',
          today ? 'text-club-ink' : match ? 'text-ink' : 'text-ink-3',
        )}
      >
        {day}
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className={cn('text-sm font-medium short:text-xs', today ? 'text-ink' : 'text-ink-2')}>{weekday}</span>
        {match?.competition && (
          <span className="truncate text-[0.6875rem] font-medium text-ink-3 short:hidden">{match.competition}</span>
        )}
      </span>
      {match && (
        <span className="flex items-center gap-1.5">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-2 short:text-[0.625rem]">
            {match.venue}
          </span>
          <Crest
            initials={match.opponent.initials}
            primary={match.opponent.primary}
            secondary={match.opponent.secondary}
            compact
            className="size-[1.625rem] short:size-5"
          />
        </span>
      )}
    </li>
  )
}
