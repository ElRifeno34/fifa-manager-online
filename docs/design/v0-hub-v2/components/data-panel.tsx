'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { StandingRow } from '@/lib/mock-data'

export function DataPanel({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('flex flex-col rounded-lg bg-surface pb-1.5 shadow-panel', className)}>
      <h3 className="px-4 pb-1 pt-3 font-display text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-club-ink">
        {title}
      </h3>
      <ul className="flex flex-col">{children}</ul>
    </section>
  )
}

interface DataRowProps {
  position: number
  name: string
  value: number | string
  crestColor: string
  highlight?: boolean
}

export function DataRow({ position, name, value, crestColor, highlight }: DataRowProps) {
  return (
    <li
      className={cn(
        'mx-1.5 grid h-[1.625rem] grid-cols-[1.25rem_0.75rem_1fr_auto] items-center gap-2 rounded px-2.5 text-[0.875rem] tabular-nums short:h-5 short:text-xs',
        highlight ? 'bg-club-subtle font-semibold text-ink' : 'font-medium text-ink-2',
      )}
    >
      <span className={cn('text-right', highlight ? 'text-club-ink' : 'text-ink-3')}>{position}</span>
      <span
        aria-hidden
        className="size-2.5 rounded-full ring-1 ring-inset ring-ink/10"
        style={{ background: crestColor }}
      />
      <span className="truncate uppercase tracking-[0.02em]">{name}</span>
      <span className={cn('text-right font-semibold', highlight ? 'text-club-ink' : 'text-ink')}>
        {value}
      </span>
    </li>
  )
}

export function DataRows({ rows }: { rows: StandingRow[] }) {
  return rows.map((r) => (
    <DataRow
      key={`${r.pos}-${r.name}`}
      position={r.pos}
      name={r.name}
      value={r.value}
      crestColor={r.color}
      highlight={r.highlight}
    />
  ))
}

interface DataTabsProps {
  tabs: { id: string; label: string; rows: StandingRow[] }[]
  className?: string
}

/** Compact variant: one panel, tabbed (used on phones in landscape). */
export function DataTabs({ tabs, className }: DataTabsProps) {
  const [active, setActive] = useState(tabs[0].id)
  const current = tabs.find((t) => t.id === active) ?? tabs[0]

  return (
    <section className={cn('flex flex-col rounded-lg bg-surface pb-1 shadow-panel', className)}>
      <div role="tablist" aria-label="Classements" className="flex gap-1 px-2 pt-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === active}
            onClick={() => setActive(t.id)}
            className={cn(
              'rounded px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-[0.08em] transition-colors',
              t.id === active ? 'bg-club-subtle text-club-ink' : 'text-ink-3 hover:text-ink-2',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ul className="flex flex-col pt-0.5">
        <DataRows rows={current.rows} />
      </ul>
    </section>
  )
}
