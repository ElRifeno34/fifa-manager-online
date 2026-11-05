import { Search, Settings, Wallet } from "lucide-react";
import { Chip, ChipGroup } from "@/components/hub/chip";
import { Crest } from "@/components/hub/crest";
import { NumericText } from "@/components/hub/numeric-text";
import { useGameState } from "@/components/providers/hooks";
import type { Club } from "@/lib/clubs";

interface TopBarProps {
  club: Club;
  budget: string;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
}

export function TopBar({ club, budget, onOpenSearch, onOpenSettings }: TopBarProps) {
  const { season } = useGameState();
  const rank = season.position === 1 ? "1er" : `${season.position}e`;

  return (
    <header className="flex items-center justify-between gap-4 short:h-11 short:gap-2">
      <div className="flex min-w-0 items-center gap-3.5 pl-1 short:gap-2.5 short:pl-0">
        <Crest initials={club.initials} className="size-11 short:size-8" />
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate font-display text-2xl font-bold uppercase leading-none tracking-tight text-ink short:text-lg">
            {club.name}
          </h1>
          <p className="mt-1.5 truncate text-sm font-medium text-ink-2 short:hidden">
            <NumericText>{`${club.competition} · Saison 2026/27 · ${rank} · ${season.points} pts`}</NumericText>
          </p>
        </div>
      </div>

      <ChipGroup className="shrink-0">
        <Chip
          icon={Search}
          label="Rechercher"
          value="Ctrl K"
          interactive
          compactLabelHidden
          // No keyboard on phones: the shortcut hint would only add noise there.
          className="short:[&>span:last-child]:hidden"
          onClick={onOpenSearch}
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K"
          title="Rechercher (Ctrl K)"
        />
        <Chip label="Journée" value="J12 · 23/11" className="short:hidden" />
        <Chip icon={Wallet} label="Budget" value={budget} compactLabelHidden />
        <Chip
          icon={Settings}
          label="Réglages"
          interactive
          compactLabelHidden
          onClick={onOpenSettings}
          aria-haspopup="dialog"
          title="Réglages"
        />
      </ChipGroup>
    </header>
  );
}
