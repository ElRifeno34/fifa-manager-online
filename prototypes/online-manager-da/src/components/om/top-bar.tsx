import { CalendarDays, Settings, Wallet } from 'lucide-react'
import { Chip, ChipGroup } from '@/components/om/chip'
import { Crest } from '@/components/om/crest'
import type { Club } from '@/lib/clubs'

interface TopBarProps {
  club: Club
  budget: string
  onOpenSettings: () => void
}

export function TopBar({ club, budget, onOpenSettings }: TopBarProps) {
  return (
    <header className="hub-topbar flex items-center justify-between gap-4 short:h-11 short:gap-2">
      <div className="flex min-w-0 items-center gap-3.5 pl-1 short:gap-2.5 short:pl-0">
        <Crest initials={club.initials} className="size-11 short:size-8" />
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate font-display text-[1.875rem] font-semibold uppercase leading-none tracking-wide text-ink short:text-[1.375rem]">
            {club.name}
          </h1>
          <p className="mt-1 truncate text-[0.8125rem] font-medium text-ink-2 short:hidden">
            {club.competition} · Saison 2026/27 · 2e · 27 pts
          </p>
        </div>
      </div>

      <ChipGroup className="shrink-0">
        <Chip icon={CalendarDays} className="short:hidden" label="Journée" value="12 · 23/11" />
        <Chip icon={Wallet} label="Budget" value={budget} compactLabelHidden />
        <Chip icon={Settings} label="Réglages" interactive compactLabelHidden aria-label="Réglages" title="Réglages" onClick={onOpenSettings} aria-haspopup="dialog" />
      </ChipGroup>
    </header>
  )
}

