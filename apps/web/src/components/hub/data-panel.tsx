import { useState, type ReactNode } from "react";
import { NumericText } from "@/components/hub/numeric-text";
import type { RankRow } from "@/lib/season";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  index: string;
  title: string;
  className?: string;
  id?: string;
  /** Adds the "Voir tout →" affordance and makes the whole header actionable. */
  onSeeAll?: () => void;
}

/** Indexed programme header: `01 — CLASSEMENT · LALIGA · J11`, optionally with "Voir tout →". */
export function SectionHeader({ index, title, className, id, onSeeAll }: SectionHeaderProps) {
  const label = (
    <>
      <span className="font-mono text-xs font-bold tracking-normal text-club-ink">{index}</span>
      <span aria-hidden className="text-ink-3">
        —
      </span>
      <span className="min-w-0 flex-1 truncate text-left">
        <NumericText>{title}</NumericText>
      </span>
    </>
  );

  if (!onSeeAll) {
    return (
      <h3
        id={id}
        className={cn("caps flex items-baseline gap-2 px-3 pb-2 pt-3 text-ink", className)}
      >
        {label}
      </h3>
    );
  }

  return (
    <h3 id={id} className={cn("text-ink", className)}>
      <button
        type="button"
        onClick={onSeeAll}
        className="caps group flex w-full items-baseline gap-2 px-3 pb-2 pt-3 transition-colors duration-150 hover:bg-raised/60 focus-visible:outline-offset-[-2px]"
      >
        {label}
        <span className="shrink-0 text-ink-3 transition-colors duration-150 group-hover:text-club-ink group-focus-visible:text-club-ink">
          Voir tout →
        </span>
      </button>
    </h3>
  );
}

export function DataPanel({
  index,
  title,
  onSeeAll,
  children,
  className,
}: {
  index: string;
  title: string;
  onSeeAll?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("sheet flex flex-col", className)}>
      <SectionHeader index={index} title={title} onSeeAll={onSeeAll} />
      <ul className="flex flex-col pb-1.5">{children}</ul>
    </section>
  );
}

export function DataRow({ row }: { row: RankRow }) {
  const { pos, name, value, color, highlight } = row;
  return (
    <li
      className={cn(
        "row-pill grid h-[1.625rem] grid-cols-[1.25rem_0.625rem_1fr_auto] items-center gap-2 px-2.5 text-[0.8125rem] short:h-5 short:text-xs",
        highlight ? "bg-club-subtle text-ink" : "text-ink-2",
      )}
    >
      <span
        className={cn(
          "text-right font-mono text-xs",
          highlight ? "font-bold text-club-ink" : "text-ink-3",
        )}
      >
        {pos}
      </span>
      <span
        aria-hidden
        className="size-2.5 ring-1 ring-inset ring-ink/15"
        style={{ background: color }}
      />
      <span
        className={cn(
          "truncate uppercase tracking-[0.02em]",
          highlight ? "font-semibold" : "font-medium",
        )}
      >
        {name}
      </span>
      <span className="text-right font-mono text-[0.8125rem] font-semibold text-ink">{value}</span>
    </li>
  );
}

export function DataRows({ rows }: { rows: RankRow[] }) {
  return rows.map((r) => <DataRow key={`${r.pos}-${r.name}`} row={r} />);
}

interface DataTabsProps {
  tabs: { id: string; label: string; rows: RankRow[] }[];
  className?: string;
}

/** Compact variant: one sheet, tabbed (used on phones in landscape). */
export function DataTabs({ tabs, className }: DataTabsProps) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <section className={cn("sheet flex flex-col", className)}>
      <div role="tablist" aria-label="Classements" className="flex gap-4 px-2.5 pt-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === active}
            onClick={() => setActive(t.id)}
            className={cn(
              "caps relative pb-1 transition-colors duration-150",
              t.id === active ? "text-ink" : "text-ink-3 hover:text-ink-2",
            )}
          >
            {t.label}
            {t.id === active && (
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-club-rule" />
            )}
          </button>
        ))}
      </div>
      <ul className="flex flex-col pb-1">{current && <DataRows rows={current.rows} />}</ul>
    </section>
  );
}
