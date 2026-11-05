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

function Legend({ children }: { children: React.ReactNode }) {
  return <legend className="caps mb-1.5 text-ink-2">{children}</legend>
}

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const { club, theme, setClub, setTheme, animatedBg, setAnimatedBg } = useClubTheme()
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
      <div aria-hidden onClick={onClose} className="absolute inset-0 animate-in fade-in bg-scrim/45 duration-150" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="relative flex h-full w-[22rem] max-w-full animate-in slide-in-from-right flex-col gap-5 overflow-y-auto border-l border-t-2 border-l-line border-t-club-rule bg-surface p-5 pr-[max(1.25rem,env(safe-area-inset-right))] duration-150 short:w-[20rem] short:gap-3 short:p-3"
      >
        <header className="flex items-center justify-between">
          <h2
            id="settings-title"
            className="flex items-baseline gap-2 font-display text-2xl font-bold uppercase leading-none tracking-tight text-ink short:text-xl"
          >
            <span className="font-mono text-sm text-club-ink">00</span>
            <span aria-hidden className="text-ink-3">
              —
            </span>
            Réglages
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les réglages"
            className="flex size-9 items-center justify-center border border-line-strong text-ink-2 transition-colors hover:bg-raised hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <fieldset className="flex flex-col">
          <Legend>Club géré</Legend>
          <div className="grid grid-cols-2 gap-1.5 short:gap-1">
            {CLUBS.map((c, i) => {
              const selected = c.id === club.id
              return (
                <label
                  key={c.id}
                  className={cn(
                    'relative flex cursor-pointer items-center gap-2.5 border border-line bg-raised p-2.5 text-sm font-semibold text-ink transition-colors hover:border-line-strong has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-club-ink short:p-1.5',
                    selected && 'border-club-rule bg-club-subtle',
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
                  <Crest initials={c.initials} primary={c.primary} secondary={c.secondary} compact className="size-8" />
                  <span className="min-w-0 flex-1 text-[0.8125rem] leading-tight">{c.name}</span>
                  {selected && <Check className="absolute right-1.5 top-1.5 size-3.5 text-club-ink" aria-hidden />}
                </label>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="flex flex-col">
          <Legend>Thème</Legend>
          <div className="grid grid-cols-2 border border-line-strong">
            {(
              [
                { id: 'light', label: 'Clair', icon: Sun },
                { id: 'dark', label: 'Sombre', icon: Moon },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <label
                key={id}
                className={cn(
                  'caps flex cursor-pointer items-center justify-center gap-2 py-2 text-xs transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-club-ink short:py-1',
                  theme === id ? 'bg-club text-club-on' : 'text-ink-2 hover:bg-raised hover:text-ink',
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

        <div className="flex items-center justify-between gap-3 border border-line bg-raised p-3 short:p-2">
          <div className="flex min-w-0 flex-col gap-1">
            <span id="bg-anim-label" className="caps text-ink-2">
              Fond animé
            </span>
            <span id="bg-anim-desc" className="text-xs leading-snug text-ink-3">
              Projecteurs, particules et lent travelling. Désactivé si votre système réduit les animations.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={animatedBg}
            aria-labelledby="bg-anim-label"
            aria-describedby="bg-anim-desc"
            onClick={() => setAnimatedBg(!animatedBg)}
            className={cn(
              'relative h-6 w-11 shrink-0 border transition-colors duration-150',
              animatedBg ? 'border-club-rule bg-club' : 'border-line-strong bg-surface',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'absolute top-0.5 size-4 transition-transform duration-150',
                animatedBg ? 'translate-x-[1.375rem] bg-club-on' : 'translate-x-0.5 bg-ink-2',
              )}
            />
          </button>
        </div>

        <p className="mt-auto text-xs leading-relaxed text-ink-3">
          Les couleurs du club s’appliquent par touches : bloc principal, filets de section, lignes surlignées,
          calendrier et focus. Vos choix sont mémorisés sur cet appareil.
        </p>
      </div>
    </div>
  )
}
