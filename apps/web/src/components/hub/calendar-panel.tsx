import { CalendarDay } from "@/components/hub/calendar-day";
import { Crest } from "@/components/hub/crest";
import { SectionHeader } from "@/components/hub/data-panel";
import { useGameState } from "@/components/providers/hooks";

export function CalendarPanel({ onSeeAll }: { onSeeAll: () => void }) {
  const { season } = useGameState();
  const next = season.nextMatch;

  return (
    <aside aria-label="Calendrier" className="sheet flex min-h-0 flex-col overflow-hidden">
      <SectionHeader index="03" title="Calendrier" onSeeAll={onSeeAll} className="short:hidden" />

      <div className="flex items-start justify-between gap-2 bg-club px-3 py-2.5 text-club-on short:px-2 short:py-1.5">
        <div className="min-w-0">
          <p className="caps text-[0.625rem] opacity-80 short:hidden">Prochain match</p>
          <p className="mt-1 flex items-baseline gap-1.5 leading-none short:mt-0">
            <span className="font-display text-xl font-bold uppercase short:text-base short:max-[720px]:text-sm">
              {next.weekday}
            </span>
            <span className="whitespace-nowrap font-mono text-xl font-bold short:text-base short:max-[720px]:text-sm">
              {next.date}
            </span>
          </p>
          <p className="mt-1.5 whitespace-nowrap text-[0.8125rem] font-medium opacity-90 short:mt-1 short:text-xs short:max-[720px]:text-[0.6875rem]">
            {next.venue} · <span className="font-mono">{next.time}</span>
          </p>
          <p className="mt-1 font-display text-base font-bold uppercase leading-none tracking-tight text-club-accent-on short:mt-0.5 short:text-sm">
            {next.title}
          </p>
          <p className="sr-only">contre {next.opponent.name}</p>
        </div>
        <Crest
          initials={next.opponent.initials}
          primary={next.opponent.primary}
          secondary={next.opponent.secondary}
          compact
          className="size-10 shrink-0 short:size-7 short:max-[720px]:size-6"
        />
      </div>

      <ol className="flex min-h-0 flex-1 flex-col">
        {season.calendar.map((entry, i) => (
          <CalendarDay
            key={entry.day}
            entry={entry}
            className={i >= 4 ? "short:hidden" : undefined}
          />
        ))}
      </ol>
    </aside>
  );
}
