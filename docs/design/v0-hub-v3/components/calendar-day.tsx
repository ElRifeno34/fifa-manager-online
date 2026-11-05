import { Crest } from '@/components/crest'
import type { CalendarEntry } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function CalendarDay({ entry, className }: { entry: CalendarEntry; className?: string }) {
  const { day, weekday, today, match } = entry
  const home = match?.venue.startsWith('DOM')
  const label = match
    ? `${weekday} ${day} novembre : ${home ? 'domicile' : 'extérieur'} contre ${match.opponentName}${match.competition ? `, ${match.competition}` : ''}`
    : `${weekday} ${day} novembre : pas de match`

  return (
    <li
      aria-label={label}
      aria-current={today ? 'date' : undefined}
      className={cn(
        'relative flex min-h-0 flex-1 items-center gap-2.5 border-b border-line px-3 last:border-b-0 short:gap-2 short:px-2',
        className,
      )}
    >
      {today && <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-club-rule" />}
      <span
        className={cn(
          'w-6 text-right font-mono text-[1.0625rem] font-bold leading-none short:w-5 short:text-[0.9375rem]',
          match || today ? 'text-ink' : 'text-ink-3',
        )}
      >
        {day}
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className={cn('caps text-xs short:text-[0.6875rem]', today ? 'text-ink' : 'text-ink-2')}>
          {weekday.replace('.', '')}
        </span>
        {match?.competition && (
          <span className="truncate text-[0.625rem] text-ink-3 short:hidden">{match.competition}</span>
        )}
      </span>
      {match && (
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              'caps flex h-[1.125rem] items-center px-1.5 text-[0.625rem] short:h-4',
              home ? 'bg-ink text-surface' : 'border border-line-strong text-ink-2',
            )}
          >
            {home ? 'DOM' : 'EXT'}
          </span>
          <Crest
            initials={match.opponent.initials}
            primary={match.opponent.primary}
            secondary={match.opponent.secondary}
            compact
            className="size-[1.375rem] short:size-5"
          />
        </span>
      )}
    </li>
  )
}
