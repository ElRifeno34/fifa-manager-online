import { Settings, Wallet } from 'lucide-react'
import { Chip, ChipGroup } from '@/components/chip'
import { Crest } from '@/components/crest'
import { NumericText } from '@/components/numeric-text'
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
          <h1 className="truncate font-display text-2xl font-bold uppercase leading-none tracking-tight text-ink short:text-lg">
            {club.name}
          </h1>
          <p className="mt-1.5 truncate text-sm font-medium text-ink-2 short:hidden">
            <NumericText>{`${club.competition} · Saison 2026/27 · 2e · 27 pts`}</NumericText>
          </p>
        </div>
      </div>

      <ChipGroup className="shrink-0">
        <Chip label="Journée" value="J12 · 23/11" className="short:hidden" />
        <Chip icon={Wallet} label="Budget" value={budget} compactLabelHidden />
        <Chip
          icon={Settings}
          label="Réglages"
          interactive
          compactLabelHidden
          onClick={onOpenSettings}
          aria-haspopup="dialog"
        />
      </ChipGroup>
    </header>
  )
}
