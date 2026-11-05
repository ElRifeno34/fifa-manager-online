'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { KeyHint } from '@/components/key-hint'
import { NumericText } from '@/components/numeric-text'
import { useToast } from '@/components/toast-provider'
import { MESSAGES, MESSAGE_FILTERS, type Message } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type FilterId = (typeof MESSAGE_FILTERS)[number]['id']

function matches(m: Message, filter: FilterId) {
  if (filter === 'tous') return true
  if (filter === 'non-lus') return !!m.unread
  return m.category === filter
}

export function MailView({ initialId }: { initialId?: string }) {
  const router = useRouter()
  const toast = useToast()
  const [filter, setFilter] = useState<FilterId>('tous')
  const [selectedId, setSelectedId] = useState(
    MESSAGES.some((m) => m.id === initialId) ? (initialId as string) : MESSAGES[0].id,
  )
  const [read, setRead] = useState<Set<string>>(() => new Set())

  const visible = useMemo(() => MESSAGES.filter((m) => matches(m, filter)), [filter])
  const selected = MESSAGES.find((m) => m.id === selectedId) ?? visible[0] ?? MESSAGES[0]
  const isUnread = (m: Message) => !!m.unread && !read.has(m.id)
  const unreadTotal = MESSAGES.filter(isUnread).length

  useEffect(() => {
    setRead((prev) => (prev.has(selected.id) ? prev : new Set(prev).add(selected.id)))
  }, [selected.id])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Escape') {
        router.push('/')
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const i = visible.findIndex((m) => m.id === selectedId)
        const next = visible[Math.min(visible.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))]
        if (next) setSelectedId(next.id)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router, visible, selectedId])

  return (
    <main className="mx-auto flex h-dvh max-w-[96rem] flex-col gap-3 p-6 short:gap-1.5 short:p-2 short:pb-[max(0.5rem,env(safe-area-inset-bottom))] short:pl-[max(0.5rem,env(safe-area-inset-left))] short:pr-[max(0.5rem,env(safe-area-inset-right))] short:pt-[max(0.5rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 short:gap-2">
          <Link
            href="/"
            className="caps flex h-8 items-center gap-2 bg-overlay px-3 text-inverse transition-colors duration-150 hover:bg-club hover:text-club-on short:h-7 short:px-2"
          >
            <ArrowLeft className="size-4 text-club-accent-dark" aria-hidden />
            <span className="short:sr-only">Retour</span>
          </Link>
          <h1 className="flex items-baseline gap-2.5 font-display text-2xl font-bold uppercase leading-none tracking-tight text-ink short:text-lg">
            <span className="font-mono text-sm font-bold text-club-ink">M</span>
            <span aria-hidden className="text-ink-3">
              —
            </span>
            Boîte de réception
          </h1>
        </div>
        <p className="caps flex items-center gap-2 bg-overlay px-3 py-2 text-inverse/80 short:py-1.5">
          <span className="font-mono text-sm font-bold text-inverse">{unreadTotal}</span> non lus
        </p>
      </header>

      <div className="sheet grid min-h-0 flex-1 grid-cols-[minmax(0,24rem)_minmax(0,1fr)] short:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]">
        <section aria-label="Liste des messages" className="flex min-h-0 flex-col border-r border-line">
          <div
            role="tablist"
            aria-label="Filtres"
            className="no-scrollbar flex shrink-0 overflow-x-auto border-b border-line px-1.5 short:px-1"
          >
            {MESSAGE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'caps relative shrink-0 px-2 py-2.5 transition-colors duration-150 short:px-1.5 short:py-1.5 short:text-[0.625rem]',
                  filter === f.id ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
                )}
              >
                {f.label}
                {filter === f.id && <span aria-hidden className="absolute inset-x-1 bottom-0 h-0.5 bg-club-rule" />}
              </button>
            ))}
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto">
            {visible.length === 0 && <li className="px-4 py-6 text-sm text-ink-3">Aucun message.</li>}
            {visible.map((m) => {
              const active = m.id === selected.id
              const unread = isUnread(m)
              return (
                <li key={m.id} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setSelectedId(m.id)}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'relative flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-raised/80 focus-visible:outline-offset-[-2px] short:gap-2 short:px-2 short:py-1.5',
                      active && 'bg-raised',
                    )}
                  >
                    {active && <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-club-rule" />}
                    <span aria-hidden className={cn('mt-1.5 size-1.5 shrink-0', unread ? 'bg-club' : 'bg-transparent')} />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn('caps truncate', unread ? 'text-ink' : 'text-ink-2')}>{m.sender}</span>
                        <span className="shrink-0 font-mono text-[0.6875rem] text-ink-3">{m.time}</span>
                      </span>
                      <span
                        className={cn(
                          'truncate text-[0.8125rem] leading-snug short:text-xs',
                          unread ? 'font-semibold text-ink' : 'text-ink-2',
                        )}
                      >
                        {m.subject}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <article aria-label={selected.subject} className="flex min-h-0 min-w-0 flex-col">
          <header className="shrink-0 border-b border-line px-6 py-4 short:px-3 short:py-2">
            <p className="caps flex items-center justify-between gap-3 text-ink-2">
              <span className="truncate text-ink">{selected.sender}</span>
              <span className="shrink-0 font-mono text-xs tracking-normal text-ink-3">{selected.received}</span>
            </p>
            <h2 className="mt-2 font-display text-[1.75rem] font-bold uppercase leading-[1.05] tracking-tight text-ink text-balance short:mt-1 short:text-lg">
              <NumericText>{selected.subject}</NumericText>
            </h2>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 short:px-3 short:py-2">
            <div className="flex max-w-[40rem] flex-col gap-3 text-[0.9375rem] leading-relaxed text-ink-2 short:gap-1.5 short:text-xs">
              {selected.body.map((p, i) => (
                <p key={i} className="text-pretty">
                  <NumericText>{p}</NumericText>
                </p>
              ))}
            </div>
          </div>

          <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-line px-6 py-3 short:px-3 short:py-1.5">
            {selected.actions.map((action, i) => (
              <button
                key={action}
                type="button"
                onClick={() => toast.show('Écran hors périmètre de ce prototype')}
                className={cn(
                  'caps h-9 px-4 transition-colors duration-150 short:h-7 short:px-3 short:text-[0.625rem]',
                  i === 0
                    ? 'bg-club text-club-on hover:bg-[color-mix(in_oklab,var(--club-primary)_88%,black)]'
                    : 'border border-line-strong text-ink hover:bg-raised',
                )}
              >
                {action}
              </button>
            ))}
          </footer>
        </article>
      </div>

      <div className="flex items-center gap-5 bg-overlay px-5 py-2 short:hidden">
        <KeyHint keys="↑ ↓" label="Changer de message" />
        <KeyHint keys="Échap" label="Retour" />
      </div>
    </main>
  )
}
