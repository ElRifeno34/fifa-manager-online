'use client'

import { useEffect, useRef } from 'react'
import { Check, Moon, Sun, X } from 'lucide-react'
import { useClubTheme } from '@/components/club-theme-provider'
import { Crest } from '@/components/crest'
import { CLUBS } from '@/lib/clubs'
import { cn } from '@/lib/utils'

interface SettingsSheetProps {
  open: boolean
  onClose: () => void
}

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const { club, theme, setClub, setTheme } = useClubTheme()
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusTo = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    returnFocusTo.current = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    panel?.querySelector<HTMLElement>('[data-autofocus]')?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const focusables = panel.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])')
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      returnFocusTo.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 animate-in fade-in bg-scrim/45 duration-200"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="relative flex h-full w-[22rem] max-w-full animate-in slide-in-from-right flex-col gap-5 overflow-y-auto bg-surface p-5 pr-[max(1.25rem,env(safe-area-inset-right))] shadow-lift duration-200 short:w-[20rem] short:gap-3 short:p-3"
      >
        <header className="flex items-center justify-between">
          <h2
            id="settings-title"
            className="font-display text-2xl font-semibold uppercase tracking-wide text-club-ink short:text-xl"
          >
            Réglages
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les réglages"
            className="flex size-9 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-raised hover:text-ink"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <fieldset className="flex flex-col gap-2 short:gap-1.5">
          <legend className="mb-1 font-display text-sm font-semibold uppercase tracking-[0.08em] text-ink-2">
            Club géré
          </legend>
          <div className="grid grid-cols-2 gap-2 short:gap-1.5">
            {CLUBS.map((c, i) => {
              const selected = c.id === club.id
              return (
                <label
                  key={c.id}
                  className={cn(
                    'relative flex cursor-pointer items-center gap-2.5 rounded-lg bg-raised p-2.5 text-sm font-semibold text-ink transition-colors hover:bg-club-subtle has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-club-ink short:p-1.5',
                    selected && 'bg-club-subtle ring-2 ring-club-ink',
                  )}
                >
                  <input
                    type="radio"
                    name="club"
                    value={c.id}
                    checked={selected}
                    onChange={() => setClub(c.id)}
                    data-autofocus={i === 0 || selected ? '' : undefined}
                    className="sr-only"
                  />
                  <span className="flex flex-col gap-1">
                    <Crest
                      initials={c.initials}
                      primary={c.primary}
                      secondary={c.secondary}
                      compact
                      className="size-8"
                    />
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">{c.name}</span>
                  {selected && <Check className="absolute right-1.5 top-1.5 size-3.5 text-club-ink" aria-hidden />}
                </label>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 font-display text-sm font-semibold uppercase tracking-[0.08em] text-ink-2">
            Thème
          </legend>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-raised p-1">
            {(
              [
                { id: 'light', label: 'Clair', icon: Sun },
                { id: 'dark', label: 'Sombre', icon: Moon },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <label
                key={id}
                className={cn(
                  'flex cursor-pointer items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-club-ink short:py-1',
                  theme === id ? 'bg-club text-club-on shadow-panel' : 'text-ink-2 hover:text-ink',
                )}
              >
                <input
                  type="radio"
                  name="theme"
                  value={id}
                  checked={theme === id}
                  onChange={() => setTheme(id)}
                  className="sr-only"
                />
                <Icon className="size-4" aria-hidden />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <p className="mt-auto text-xs leading-relaxed text-ink-3">
          Les couleurs du club s’appliquent par touches : menu principal, titres de panneaux, lignes
          surlignées, calendrier et focus. Vos choix sont mémorisés sur cet appareil.
        </p>
      </div>
    </div>
  )
}
