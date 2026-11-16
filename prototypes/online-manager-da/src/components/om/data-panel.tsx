import { Button } from '@/components/om/button'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { StandingRow } from '@/data/mock'
import { useToast } from '@/components/om/toast-provider'

export function SectionHeader({ index, title, className }: { index: string; title: string; className?: string }) {
  const toast = useToast()
  return <h2 className={cn('section-header', className)}><Button className="flex w-full items-center gap-2 text-left" onClick={() => toast.show('Pas encore dans le prototype')}><span className="font-mono text-ink-3">{index}</span><span className="caps flex-1 text-ink">{title}</span><span className="section-more">Voir tout →</span></Button></h2>
}

export function DataPanel({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string | undefined
}) {
  return (
    <section className={cn('sheet flex flex-col pb-2', className)}>
      <SectionHeader index={title.startsWith('Classement') ? '04' : '05'} title={title} />
      <ul className="flex flex-col">{children}</ul>
    </section>
  )
}

interface DataRowProps {
  position: number
  name: string
  value: number | string
  crestColor: string
  highlight?: boolean | undefined
}

export function DataRow({ position, name, value, crestColor, highlight }: DataRowProps) {
  return (
    <li
      className={cn(
        'mx-2 grid h-8 grid-cols-[1.25rem_0.75rem_minmax(0,1fr)_auto] items-center gap-2 border-b border-line px-2 text-[0.8125rem] tabular-nums last:border-b-0 short:h-6 short:text-[0.6875rem]',
        highlight ? 'bg-raised font-semibold text-ink' : 'font-medium text-ink-2',
      )}
    >
      <span className={cn('text-right', highlight ? 'text-club-ink' : 'text-ink-3')}>{position}</span>
      <span
        aria-hidden
        className="size-2.5 rounded-full ring-1 ring-inset ring-ink/10"
        style={{ background: crestColor }}
      />
      <span className="truncate">{name}</span>
      <span className="text-right font-mono font-semibold text-ink">
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
  className?: string | undefined
}

/** Compact variant: one panel, tabbed (used on phones in landscape). */
export function DataTabs({ tabs, className }: DataTabsProps) {
  const [active, setActive] = useState(tabs[0]?.id ?? '')
  const current = tabs.find((t) => t.id === active) ?? tabs[0]

  if (!current) return null

  return (
    <section className={cn('sheet flex flex-col pb-1', className)}>
      <div role="tablist" aria-label="Classements" className="flex gap-1 px-2 pt-1.5">
        {tabs.map((t) => (
          <Button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === active}
            onClick={() => setActive(t.id)}
            className={cn(
              'rounded px-2 py-0.5 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.08em] transition-colors',
              t.id === active ? 'bg-club-subtle text-club-ink' : 'text-ink-3 hover:text-ink-2',
            )}
          >
            {t.label}
          </Button>
        ))}
      </div>
      <ul className="flex flex-col pt-0.5">
        <DataRows rows={current.rows} />
      </ul>
    </section>
  )
}

