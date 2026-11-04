import { CalendarDays, Settings, Wallet } from 'lucide-react'
import { Chip } from '@/components/chip'
import { Crest } from '@/components/crest'
import type { Club } from '@/lib/clubs'

interface TopBarProps {
  club: Club
  budget: string
  onOpenSettings: () => void
}

export function TopBar({ club, budget, onOpenSettings }: TopBarProps) {
  return (
    <header className="flex items-center justify-between gap-4 short:h-11 short:gap-2">
      <div className="flex min-w-0 items-center gap-3.5 pl-1 short:gap-2.5 short:pl-0">
        <Crest initials={club.initials} className="size-11 short:size-8" />
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate font-display text-2xl font-semibold uppercase leading-none tracking-wide text-ink short:text-lg">
            {club.name}
          </h1>
          <p className="mt-1 truncate text-sm font-medium text-ink-2 short:hidden">
            {club.competition} · Saison 2026/27 · 2e · 27 pts
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Chip icon={CalendarDays} className="short:hidden">
          J12 · Dim. 23 nov.
        </Chip>
        <Chip icon={Wallet}>{budget}</Chip>
        <Chip icon={Settings} interactive iconOnlyWhenCompact onClick={onOpenSettings} aria-haspopup="dialog">
          Réglages
        </Chip>
      </div>
    </header>
  )
}
