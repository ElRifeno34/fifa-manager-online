'use client'

import { useState, type ReactNode } from 'react'
import { NumericText } from '@/components/numeric-text'
import { cn } from '@/lib/utils'
import type { StandingRow } from '@/lib/mock-data'

/** Indexed programme header: `01 — CLASSEMENT · LALIGA · J11`. */
export function SectionHeader({
  index,
  title,
  className,
  id,
}: {
  index: string
  title: string
  className?: string
  id?: string
}) {
  return (
    <h3 id={id} className={cn('caps flex items-baseline gap-2 px-3 pb-1.5 pt-2.5 text-ink', className)}>
      <span className="font-mono text-xs font-bold tracking-normal text-club-ink">{index}</span>
      <span aria-hidden className="text-ink-3">
        —
      </span>
      <span className="truncate">
        <NumericText>{title}</NumericText>
      </span>
    </h3>
  )
}

export function DataPanel({
  index,
  title,
  children,
  className,
}: {
  index: string
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('sheet flex flex-col', className)}>
      <SectionHeader index={index} title={title} />
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
        'grid h-[1.625rem] grid-cols-[1.25rem_0.625rem_1fr_auto] items-center gap-2 border-t border-line px-3 text-[0.8125rem] short:h-5 short:text-xs',
        highlight ? 'bg-club-subtle text-ink' : 'text-ink-2',
      )}
    >
      <span className={cn('text-right font-mono text-xs', highlight ? 'font-bold text-club-ink' : 'text-ink-3')}>
        {position}
      </span>
      <span aria-hidden className="size-2.5 ring-1 ring-inset ring-ink/15" style={{ background: crestColor }} />
      <span className={cn('truncate uppercase tracking-[0.02em]', highlight ? 'font-semibold' : 'font-medium')}>
        {name}
      </span>
      <span className="text-right font-mono text-[0.8125rem] font-semibold text-ink">{value}</span>
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

/** Compact variant: one sheet, tabbed (used on phones in landscape). */
export function DataTabs({ tabs, className }: DataTabsProps) {
  const [active, setActive] = useState(tabs[0].id)
  const current = tabs.find((t) => t.id === active) ?? tabs[0]

  return (
    <section className={cn('sheet flex flex-col', className)}>
      <div role="tablist" aria-label="Classements" className="flex gap-4 px-2.5 pt-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === active}
            onClick={() => setActive(t.id)}
            className={cn(
              'caps relative pb-1 transition-colors duration-150',
              t.id === active ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
            )}
          >
            {t.label}
            {t.id === active && <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-club-rule" />}
          </button>
        ))}
      </div>
      <ul className="flex flex-col">
        <DataRows rows={current.rows} />
      </ul>
    </section>
  )
}
