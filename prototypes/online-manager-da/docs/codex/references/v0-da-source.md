# Online Manager — DA de référence (v0, hub v2)

Code source exporté de v0 (Next.js + Tailwind v4). C'est la DA à reproduire À L'IDENTIQUE. Images : stadium-bg.png et press-conference.png (jointes séparément).

## `app/globals.css`

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

@custom-variant dark (&:is(.dark *));
/* Phones in landscape (and very short windows) switch to the compact layout. */
@custom-variant short (@media (max-height: 500px));

@theme inline {
  --font-sans: var(--font-barlow), 'Barlow Fallback', system-ui, sans-serif;
  --font-display: var(--font-barlow-condensed), 'Barlow Condensed Fallback', system-ui, sans-serif;

  --color-base: var(--bg-base);
  --color-surface: var(--surface);
  --color-raised: var(--raised);
  --color-overlay: var(--overlay);
  --color-scrim: var(--scrim);
  --color-line: var(--line);
  --color-line-strong: var(--line-strong);
  --color-ink: var(--ink);
  --color-ink-2: var(--ink-2);
  --color-ink-3: var(--ink-3);
  --color-inverse: var(--inverse);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);

  --color-club: var(--club-primary);
  --color-club-on: var(--club-on-primary);
  --color-club-2: var(--club-secondary);
  --color-club-on-2: var(--club-on-secondary);
  --color-club-subtle: var(--club-primary-subtle);
  --color-club-ink: var(--club-ink);
  --color-club-accent-dark: var(--club-accent-dark);
  --color-club-accent-on: var(--club-accent-on-primary);

  --shadow-panel: 0 2px 6px rgb(18 26 35 / 0.08);
  --shadow-lift: 0 6px 16px rgb(18 26 35 / 0.14);

  /* shadcn token bridge so the stock Button keeps working */
  --color-background: var(--bg-base);
  --color-foreground: var(--ink);
  --color-card: var(--surface);
  --color-card-foreground: var(--ink);
  --color-popover: var(--surface);
  --color-popover-foreground: var(--ink);
  --color-primary: var(--club-primary);
  --color-primary-foreground: var(--club-on-primary);
  --color-secondary: var(--raised);
  --color-secondary-foreground: var(--ink);
  --color-muted: var(--raised);
  --color-muted-foreground: var(--ink-2);
  --color-accent: var(--raised);
  --color-accent-foreground: var(--ink);
  --color-destructive: var(--danger);
  --color-border: var(--line);
  --color-input: var(--line-strong);
  --color-ring: var(--club-ink);
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}

:root {
  color-scheme: light;
  --bg-base: #e4e9ef;
  --surface: #ffffff;
  --raised: #f3f5f8;
  --overlay: #1d2630;
  --scrim: #0b1118;
  --line: #d5dce4;
  --line-strong: #b7c2ce;
  --ink: #121a23;
  --ink-2: #4d5b6a;
  --ink-3: #8592a1;
  --inverse: #ffffff;
  --success: #1f9d57;
  --warning: #d98a00;
  --danger: #e0364a;
  --veil: rgb(238 242 246 / 0.6);
  --pitch-fallback: linear-gradient(180deg, #dbe9f7 0%, #eef2f6 55%, #cfe3c8 100%);
}

.dark {
  color-scheme: dark;
  --bg-base: #0a0e13;
  --surface: #111821;
  --raised: #18212c;
  --overlay: #1d2630;
  --line: #243040;
  --line-strong: #34445a;
  --ink: #f1f4f8;
  --ink-2: #a9b5c2;
  --ink-3: #738193;
  --veil: rgb(10 14 19 / 0.78);
  --pitch-fallback: linear-gradient(180deg, #0f1722 0%, #0a0e13 100%);
}

/* Desktop reference is 1280x720 = 16px root. Everything is in rem, so the whole
   hub scales up cleanly at 1920x1080 (24px root). */
html {
  font-size: clamp(11px, min(1.25vw, 2.2222vh), 24px);
}

@media (max-height: 500px) {
  html {
    font-size: 16px;
  }
}

@layer base {
  * {
    @apply border-line;
  }
  html {
    background-color: var(--bg-base);
  }
  body {
    @apply bg-base font-sans text-ink antialiased;
    min-height: 100dvh;
  }
  :focus-visible {
    outline: 2px solid var(--club-ink);
    outline-offset: 2px;
  }
  button {
    cursor: pointer;
  }
}

/* Applied for ~250ms while the club or theme changes. */
html.theme-anim,
html.theme-anim *,
html.theme-anim *::before,
html.theme-anim *::after {
  transition:
    background-color 200ms ease,
    color 200ms ease,
    border-color 200ms ease,
    fill 200ms ease,
    box-shadow 200ms ease !important;
}

@media (prefers-reduced-motion: reduce) {
  html.theme-anim,
  html.theme-anim * {
    transition: none !important;
  }
}

.no-scrollbar {
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

```

## `app/layout.tsx`

```tsx
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import { AppBackground } from '@/components/app-background'
import { ClubThemeProvider } from '@/components/club-theme-provider'
import { RotateOverlay } from '@/components/rotate-overlay'
import { ToastProvider } from '@/components/toast-provider'
import { DEFAULT_CLUB_ID, buildClubThemeCss, buildThemeBootScript } from '@/lib/clubs'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Online Manager — Hub du manager',
  description:
    'Prototype de direction artistique du hub d’Online Manager, un jeu de gestion de football aux couleurs de votre club.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E4E9EF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0E13' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      data-club={DEFAULT_CLUB_ID}
      suppressHydrationWarning
      className={`${barlow.variable} ${barlowCondensed.variable} bg-base`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: buildClubThemeCss() }} />
        <script dangerouslySetInnerHTML={{ __html: buildThemeBootScript() }} />
      </head>
      <body>
        <ClubThemeProvider>
          <ToastProvider>

            <AppBackground />
            {children}
            <RotateOverlay />
          </ToastProvider>
        </ClubThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

```

## `app/medias/fil/page.tsx`

```tsx
import type { Metadata } from 'next'
import { SocialViewer } from '@/components/social-viewer'

export const metadata: Metadata = {
  title: 'Médias · Fil du club — Online Manager',
}

export default function Page() {
  return <SocialViewer />
}

```

## `app/page.tsx`

```tsx
import { HomeHub } from '@/components/home-hub'

export default function Page() {
  return <HomeHub />
}

```

## `components/app-background.tsx`

```tsx
import { IMAGES } from '@/lib/mock-data'

/**
 * Blurred stadium photo + a theme-aware veil. If the photo fails to load the
 * gradient layer underneath stays visible, so the layout never breaks.
 */
export function AppBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10" style={{ background: 'var(--pitch-fallback)' }}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${IMAGES.background}), url(${IMAGES.backgroundRemote})`,
        }}
      />
      <div className="absolute inset-0" style={{ background: 'var(--veil)' }} />
    </div>
  )
}

```

## `components/calendar-day.tsx`

```tsx
import { Crest } from '@/components/crest'
import type { CalendarEntry } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function CalendarDay({ entry, className }: { entry: CalendarEntry; className?: string }) {
  const { day, weekday, today, match } = entry
  const label = match
    ? `${weekday} ${day} novembre : ${match.venue === 'DOM.' ? 'domicile' : 'extérieur'} contre ${match.opponentName}${match.competition ? `, ${match.competition}` : ''}`
    : `${weekday} ${day} novembre : pas de match`

  return (
    <li
      aria-label={label}
      aria-current={today ? 'date' : undefined}
      className={cn(
        'mx-1.5 flex min-h-0 flex-1 items-center gap-2.5 rounded px-2.5 short:mx-1 short:gap-2 short:px-2',
        today && 'bg-club-subtle',
        className,
      )}
    >
      <span
        className={cn(
          'w-7 text-right font-display text-xl font-semibold leading-none tabular-nums short:w-6 short:text-[1rem]',
          today ? 'text-club-ink' : match ? 'text-ink' : 'text-ink-3',
        )}
      >
        {day}
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className={cn('text-sm font-medium short:text-xs', today ? 'text-ink' : 'text-ink-2')}>{weekday}</span>
        {match?.competition && (
          <span className="truncate text-[0.6875rem] font-medium text-ink-3 short:hidden">{match.competition}</span>
        )}
      </span>
      {match && (
        <span className="flex items-center gap-1.5">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-2 short:text-[0.625rem]">
            {match.venue}
          </span>
          <Crest
            initials={match.opponent.initials}
            primary={match.opponent.primary}
            secondary={match.opponent.secondary}
            compact
            className="size-[1.625rem] short:size-5"
          />
        </span>
      )}
    </li>
  )
}

```

## `components/calendar-panel.tsx`

```tsx
import { Crest } from '@/components/crest'
import { CalendarDay } from '@/components/calendar-day'
import { CALENDAR, NEXT_MATCH } from '@/lib/mock-data'

export function CalendarPanel() {
  return (
    <aside
      aria-label="Calendrier"
      className="flex min-h-0 flex-col overflow-hidden rounded-lg bg-surface shadow-panel"
    >
      <div className="flex items-start justify-between gap-2 bg-club px-4 py-3.5 text-club-on short:px-2.5 short:py-2">
        <div className="min-w-0">
          <p className="font-display text-xl font-semibold uppercase leading-none tracking-wide short:text-[1rem]">
            {NEXT_MATCH.date}
          </p>
          <p className="mt-1.5 text-sm font-medium opacity-90 short:mt-1 short:text-xs">{NEXT_MATCH.venue}</p>
          <p className="mt-1 font-display text-lg font-semibold uppercase leading-none tracking-wide text-club-accent-on short:mt-0.5 short:text-sm">
            {NEXT_MATCH.title}
          </p>
        </div>
        <Crest
          initials={NEXT_MATCH.opponent.initials}
          primary={NEXT_MATCH.opponent.primary}
          secondary={NEXT_MATCH.opponent.secondary}
          compact
          className="mt-0.5 size-10 shrink-0 short:size-7"
        />
      </div>

      <ol className="flex min-h-0 flex-1 flex-col py-1 short:py-0.5">
        {CALENDAR.map((entry, i) => (
          <CalendarDay key={entry.day} entry={entry} className={i >= 4 ? 'short:hidden' : undefined} />
        ))}
      </ol>
    </aside>
  )
}

```

## `components/chip.tsx`

```tsx
import type { ComponentProps, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChipProps extends Omit<ComponentProps<'button'>, 'children'> {
  icon: LucideIcon
  children: ReactNode
  /** Visually hide the label (still read by screen readers) on compact screens. */
  iconOnlyWhenCompact?: boolean
  interactive?: boolean
}

/** Dark pill used in the top bar. Icon takes the club's secondary color. */
export function Chip({
  icon: Icon,
  children,
  iconOnlyWhenCompact,
  interactive,
  className,
  ...props
}: ChipProps) {
  const classes = cn(
    'inline-flex h-9 items-center gap-2 rounded-full bg-overlay px-3.5 text-[0.9375rem] font-medium tabular-nums text-inverse short:h-8 short:gap-1.5 short:px-2.5 short:text-sm',
    iconOnlyWhenCompact && 'short:size-8 short:justify-center short:px-0',
    interactive &&
      'transition-transform hover:-translate-y-px active:scale-[.97] motion-reduce:transition-none',
    className,
  )
  const content = (
    <>
      <Icon className="size-[1.0625rem] shrink-0 text-club-accent-dark short:size-4" aria-hidden />
      <span className={cn('whitespace-nowrap', iconOnlyWhenCompact && 'short:sr-only')}>
        {children}
      </span>
    </>
  )

  if (interactive) {
    return (
      <button type="button" className={classes} {...props}>
        {content}
      </button>
    )
  }
  return <div className={classes}>{content}</div>
}

```

## `components/club-theme-provider.tsx`

```tsx
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  CLUB_STORAGE_KEY,
  DEFAULT_CLUB_ID,
  THEME_STORAGE_KEY,
  getClub,
  type Club,
  type ClubId,
} from '@/lib/clubs'

type Theme = 'light' | 'dark'

interface ClubThemeContextValue {
  club: Club
  theme: Theme
  setClub: (id: ClubId) => void
  setTheme: (theme: Theme) => void
}

const ClubThemeContext = createContext<ClubThemeContextValue | null>(null)

/**
 * Owns the club palette + light/dark theme. The CSS variables themselves are
 * emitted statically (see `buildClubThemeCss`); this provider only flips
 * `data-club` / `.dark` on <html>, persists the choice and animates the change.
 */
export function ClubThemeProvider({ children }: { children: ReactNode }) {
  const [clubId, setClubId] = useState<ClubId>(DEFAULT_CLUB_ID)
  const [theme, setThemeState] = useState<Theme>('light')
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const root = document.documentElement
    setClubId(getClub(root.getAttribute('data-club')).id)
    setThemeState(root.classList.contains('dark') ? 'dark' : 'light')
  }, [])

  const animate = useCallback(() => {
    const root = document.documentElement
    root.classList.add('theme-anim')
    if (animTimer.current) clearTimeout(animTimer.current)
    animTimer.current = setTimeout(() => root.classList.remove('theme-anim'), 280)
  }, [])

  const setClub = useCallback(
    (id: ClubId) => {
      animate()
      document.documentElement.setAttribute('data-club', id)
      setClubId(id)
      try {
        localStorage.setItem(CLUB_STORAGE_KEY, id)
      } catch {}
    },
    [animate],
  )

  const setTheme = useCallback(
    (next: Theme) => {
      animate()
      document.documentElement.classList.toggle('dark', next === 'dark')
      setThemeState(next)
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch {}
    },
    [animate],
  )

  const value = useMemo(
    () => ({ club: getClub(clubId), theme, setClub, setTheme }),
    [clubId, theme, setClub, setTheme],
  )

  return <ClubThemeContext.Provider value={value}>{children}</ClubThemeContext.Provider>
}

export function useClubTheme() {
  const ctx = useContext(ClubThemeContext)
  if (!ctx) throw new Error('useClubTheme must be used inside ClubThemeProvider')
  return ctx
}

```

## `components/crest.tsx`

```tsx
import { cn } from '@/lib/utils'

interface CrestProps {
  initials: string
  /** Omit to use the managed club's colors. */
  primary?: string
  secondary?: string
  /** Size it with a `size-*` class; the initials scale with the container. */
  className?: string
  /** Thin ring for small crests (calendar rows, lists). */
  compact?: boolean
}

/** Circular placeholder crest: initials on the club color, ring in the secondary. */
export function Crest({ initials, primary, secondary, className, compact }: CrestProps) {
  const background = primary ?? 'var(--club-primary)'
  const ring = secondary ?? 'var(--club-secondary)'
  const color = primary ? (isLightColor(primary) ? '#121A23' : '#FFFFFF') : 'var(--club-on-primary)'
  const fontSize = initials.length > 2 ? '30cqw' : '38cqw'

  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 select-none items-center justify-center rounded-full', className)}
      style={{
        background,
        color,
        containerType: 'size',
        boxShadow: compact
          ? `0 0 0 1.5px ${ring}`
          : `0 0 0 2px var(--surface), 0 0 0 4px ${ring}`,
      }}
    >
      <span
        className="font-display font-bold uppercase leading-none tracking-wide"
        style={{ fontSize }}
      >
        {initials}
      </span>
    </span>
  )
}

function isLightColor(hex: string) {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  return r * 0.299 + g * 0.587 + b * 0.114 > 160
}

```

## `components/data-panel.tsx`

```tsx
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

```

## `components/home-hub.tsx`

```tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CalendarPanel } from '@/components/calendar-panel'
import { useClubTheme } from '@/components/club-theme-provider'
import { DataPanel, DataRows, DataTabs } from '@/components/data-panel'
import { KeyHintBar } from '@/components/key-hint'
import { MenuTile } from '@/components/menu-tile'
import { NewsCarousel } from '@/components/news-carousel'
import { SettingsSheet } from '@/components/settings-sheet'
import { useToast } from '@/components/toast-provider'
import { TopBar } from '@/components/top-bar'
import { MENU, NEWS, SCORERS, STANDINGS } from '@/lib/mock-data'

const TABS = [
  { id: 'classement', label: 'Classement', rows: STANDINGS },
  { id: 'buteurs', label: 'Buteurs', rows: SCORERS },
]

export function HomeHub() {
  const { club } = useClubTheme()
  const toast = useToast()
  const [storyIndex, setStoryIndex] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const tileRefs = useRef<(HTMLElement | null)[]>([])

  const closeSettings = useCallback(() => setSettingsOpen(false), [])

  const handleTile = (id: string) => {
    if (id === 'avancer') toast.show('Journée suivante…')
    else if (id !== 'medias') toast.show('Écran hors périmètre de ce prototype')
  }

  useEffect(() => {
    if (settingsOpen) return

    const isTyping = (el: EventTarget | null) =>
      el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return

      if (e.code === 'Space') {
        e.preventDefault()
        if (!e.repeat) toast.show('Journée suivante…')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setStoryIndex((i) => (i + 1) % NEWS.length)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setStoryIndex((i) => (i - 1 + NEWS.length) % NEWS.length)
      } else if (/^[1-6]$/.test(e.key)) {
        tileRefs.current[Number(e.key) - 1]?.focus()
      } else if (e.key === 'Enter' && document.activeElement === document.body) {
        toast.show('Validé')
      }
    }
    // Stops a focused button from also being "clicked" when Space is used as the advance shortcut.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTyping(e.target)) e.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [settingsOpen, toast])

  return (
    <main className="mx-auto flex h-dvh w-full flex-col gap-3.5 overflow-hidden p-6 short:gap-1.5 short:p-2 short:pb-[max(0.5rem,env(safe-area-inset-bottom))] short:pl-[max(0.5rem,env(safe-area-inset-left))] short:pr-[max(0.5rem,env(safe-area-inset-right))] short:pt-[max(0.5rem,env(safe-area-inset-top))]">
      <TopBar club={club} budget="84,5 M€" onOpenSettings={() => setSettingsOpen(true)} />

      <div className="grid min-h-0 flex-1 grid-cols-[14.5rem_minmax(0,1fr)_13.75rem] gap-4 short:grid-cols-[10.5rem_minmax(0,1fr)_9.375rem] short:gap-2 short:max-[720px]:grid-cols-[10.5rem_minmax(0,1fr)_8.5rem]">
        <nav aria-label="Menu principal" className="flex min-h-0 flex-col gap-2.5 short:gap-1">
          {MENU.map((item, i) => (
            <MenuTile
              key={item.id}
              ref={(el) => {
                tileRefs.current[i] = el
              }}
              label={item.label}
              icon={item.icon}
              badge={item.badge}
              primary={item.primary}
              href={item.href}
              shortcut={String(i + 1)}
              onClick={() => handleTile(item.id)}
            />
          ))}
        </nav>

        <div className="flex min-h-0 min-w-0 flex-col gap-3 short:gap-1.5">
          <NewsCarousel
            stories={NEWS}
            index={storyIndex}
            onIndexChange={setStoryIndex}
            className="min-h-0 flex-1"
          />

          <div className="grid grid-cols-2 gap-3 short:hidden">
            <DataPanel title="Classement · LaLiga · J11">
              <DataRows rows={STANDINGS} />
            </DataPanel>
            <DataPanel title="Buteurs · LaLiga">
              <DataRows rows={SCORERS} />
            </DataPanel>
          </div>
          <DataTabs tabs={TABS} className="hidden short:flex" />
        </div>

        <CalendarPanel />
      </div>

      <KeyHintBar />
      <SettingsSheet open={settingsOpen} onClose={closeSettings} />
    </main>
  )
}

```

## `components/key-hint.tsx`

```tsx
import { HINTS } from '@/lib/mock-data'

export function KeyHint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <kbd className="rounded bg-inverse/15 px-1.5 py-0.5 font-sans text-xs font-semibold leading-none text-inverse">
        {keys}
      </kbd>
      <span className="text-[0.8125rem] font-medium text-inverse/80">{label}</span>
    </span>
  )
}

/** Desktop-only footer: shortcuts + a warning about the squad. Hidden on compact screens. */
export function KeyHintBar() {
  return (
    <footer
      aria-label="Raccourcis clavier"
      className="mx-auto flex items-center gap-5 rounded-full bg-overlay px-5 py-2 short:hidden"
    >
      {HINTS.map((h) => (
        <KeyHint key={h.keys} keys={h.keys} label={h.label} />
      ))}
      <span className="h-4 w-px bg-inverse/20" aria-hidden />
      <span className="flex items-center gap-2 text-[0.8125rem] font-medium text-inverse">
        <span className="size-2 rounded-full bg-warning" aria-hidden />
        2 titulaires fatigués
      </span>
    </footer>
  )
}

```

## `components/menu-tile.tsx`

```tsx
import Link from 'next/link'
import type { Ref } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuTileProps {
  label: string
  icon: LucideIcon
  badge?: number
  /** Main call to action: filled with the club's primary color. */
  primary?: boolean
  href?: string
  onClick?: () => void
  /** Keyboard hint exposed to assistive tech (e.g. "1"). */
  shortcut?: string
  ref?: Ref<HTMLElement>
}

export function MenuTile({
  label,
  icon: Icon,
  badge,
  primary,
  href,
  onClick,
  shortcut,
  ref,
}: MenuTileProps) {
  const className = cn(
    'group relative flex h-20 w-full flex-col items-start justify-between rounded-lg p-3 text-left shadow-panel outline-none',
    'transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0 active:scale-[.98]',
    'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
    'short:h-11 short:flex-row short:items-center short:justify-start short:gap-2.5 short:px-3 short:py-0',
    primary ? 'bg-club text-club-on' : 'bg-surface text-ink',
  )

  const content = (
    <>
      <Icon
        className={cn(
          'size-6 shrink-0 short:size-[1.125rem]',
          primary ? 'text-club-on' : 'text-ink-2 group-hover:text-club-ink',
        )}
        aria-hidden
      />
      <span className="min-w-0 font-sans text-[1rem] font-semibold leading-tight short:text-[0.8125rem]">
        {label}
      </span>
      {badge ? (
        <span
          className="absolute right-2.5 top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-xs font-bold tabular-nums leading-none text-inverse short:static short:ml-auto short:h-[1.125rem] short:min-w-[1.125rem]"
          aria-label={`${badge} notification${badge > 1 ? 's' : ''}`}
        >
          {badge}
        </span>
      ) : null}
    </>
  )

  const shortcutProps = shortcut ? { 'aria-keyshortcuts': shortcut } : {}

  if (href) {
    return (
      <Link
        href={href}
        ref={ref as Ref<HTMLAnchorElement>}
        className={className}
        onClick={onClick}
        {...shortcutProps}
      >
        {content}
      </Link>
    )
  }
  return (
    <button
      type="button"
      ref={ref as Ref<HTMLButtonElement>}
      className={className}
      onClick={onClick}
      {...shortcutProps}
    >
      {content}
    </button>
  )
}

```

## `components/news-carousel.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SafeImage } from '@/components/safe-image'
import type { NewsStory } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const AUTO_ADVANCE_MS = 8000

interface NewsCarouselProps {
  stories: NewsStory[]
  index: number
  onIndexChange: (index: number) => void
  className?: string
}

export function NewsCarousel({ stories, index, onIndexChange, className }: NewsCarouselProps) {
  const [paused, setPaused] = useState(false)
  const count = stories.length

  useEffect(() => {
    if (paused || count < 2) return
    const timer = setTimeout(() => onIndexChange((index + 1) % count), AUTO_ADVANCE_MS)
    return () => clearTimeout(timer)
  }, [index, paused, count, onIndexChange])

  const go = (delta: number) => onIndexChange((index + delta + count) % count)

  return (
    <section
      aria-roledescription="carousel"
      aria-label="À la une"
      className={cn(
        'group relative min-h-0 overflow-hidden rounded-lg bg-raised shadow-panel',
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {stories.map((story, i) => (
        <Slide key={story.id} story={story} active={i === index} position={`${i + 1} / ${count}`} />
      ))}

      <div
        className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 px-6 pb-4 short:px-3 short:pb-2"
        role="tablist"
        aria-label="Choisir une actualité"
      >
        {stories.map((story, i) => (
          <button
            key={story.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Actualité ${i + 1} : ${story.headline}`}
            onClick={() => onIndexChange(i)}
            className={cn(
              'h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none short:h-1',
              i === index
                ? 'w-[1.125rem] bg-club-accent-dark short:w-3.5'
                : 'w-1.5 bg-inverse/50 hover:bg-inverse/80 short:w-1',
            )}
          />
        ))}
      </div>

      {count > 1 && (
        <>
          <ArrowButton side="left" onClick={() => go(-1)} />
          <ArrowButton side="right" onClick={() => go(1)} />
        </>
      )}
    </section>
  )
}

function Slide({
  story,
  active,
  position,
}: {
  story: NewsStory
  active: boolean
  position: string
}) {
  const Icon = story.icon
  return (
    <article
      role="group"
      aria-roledescription="diapositive"
      aria-label={position}
      aria-hidden={!active}
      className={cn(
        'absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none',
        active ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      {story.image ? (
        <SafeImage
          src={story.image}
          alt=""
          className="absolute inset-0 size-full object-[50%_18%]"
          fallback={<GradientBackdrop icon={Icon} />}
        />
      ) : (
        <GradientBackdrop icon={Icon} />
      )}

      <div
        className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 px-6 pb-9 pt-16 short:gap-0.5 short:px-3 short:pb-6 short:pt-8"
        style={{
          background:
            'linear-gradient(to top, rgb(11 17 24 / .78) 0%, rgb(11 17 24 / .78) 62%, rgb(11 17 24 / 0) 100%)',
        }}
      >
        <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-club-accent-dark short:text-[0.6875rem]">
          {story.meta}
        </p>
        <h2 className="font-display text-[1.875rem] font-bold leading-[1.05] text-inverse text-balance short:text-[1.375rem]">
          {story.headline}
        </h2>
        <p className="line-clamp-2 max-w-[44rem] text-[0.9375rem] leading-snug text-inverse/85 text-pretty short:text-xs">
          {story.lead}
        </p>
      </div>
    </article>
  )
}

function GradientBackdrop({ icon: Icon }: { icon: NewsStory['icon'] }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, var(--club-primary) 0%, color-mix(in oklab, var(--club-primary) 45%, #0B1118) 100%)',
      }}
    >
      <Icon
        className="absolute -top-6 right-6 size-[17rem] text-club-on opacity-[0.12] short:-top-2 short:size-36"
        strokeWidth={1.25}
      />
    </div>
  )
}

function ArrowButton({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Actualité précédente' : 'Actualité suivante'}
      className={cn(
        'absolute top-[38%] flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-scrim/55 text-inverse opacity-0 backdrop-blur-sm transition-opacity hover:bg-scrim/80 focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100 short:size-7',
        side === 'left' ? 'left-3 short:left-1.5' : 'right-3 short:right-1.5',
      )}
    >
      <Icon className="size-5 short:size-4" aria-hidden />
    </button>
  )
}

```

## `components/rotate-overlay.tsx`

```tsx
import { Smartphone } from 'lucide-react'

export function RotateOverlay() {
  return (
    <div
      role="alertdialog"
      aria-label="Tournez votre téléphone"
      className="fixed inset-0 z-[100] hidden flex-col items-center justify-center gap-6 bg-base px-8 text-center portrait:max-md:flex"
    >
      <Smartphone className="size-14 rotate-90 text-club-ink" strokeWidth={1.5} aria-hidden />
      <div className="flex flex-col gap-2">
        <p className="font-display text-3xl font-semibold uppercase tracking-wide text-ink">
          Tournez votre téléphone
        </p>
        <p className="text-[1rem] text-ink-2">
          Online Manager se joue en mode paysage.
        </p>
      </div>
    </div>
  )
}

```

## `components/safe-image.tsx`

```tsx
'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  /** Rendered when the image cannot load; defaults to a neutral gradient. */
  fallback?: ReactNode
}

export function SafeImage({ src, alt, className, fallback }: SafeImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      fallback ?? (
        <div
          role="img"
          aria-label={alt}
          className={cn('bg-gradient-to-br from-raised to-line-strong', className)}
        />
      )
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      draggable={false}
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  )
}

```

## `components/settings-sheet.tsx`

```tsx
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

```

## `components/social-post.tsx`

```tsx
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, BadgeCheck, Heart, MessageCircle } from 'lucide-react'
import { Crest } from '@/components/crest'
import { SafeImage } from '@/components/safe-image'
import type { Club } from '@/lib/clubs'
import type { Comment, Post } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface SocialPostProps {
  post: Post
  club: Club
  commentsHidden: boolean
  onToggleComments: () => void
  /** Post switcher rendered in the header (prev / counter / next). */
  controls?: ReactNode
}

export function SocialPost({ post, club, commentsHidden, onToggleComments, controls }: SocialPostProps) {
  const Icon = post.icon

  return (
    <article className="grid h-[min(34rem,100%)] w-[62rem] max-w-full grid-cols-[1.1fr_1fr] overflow-hidden rounded-lg bg-surface shadow-lift short:h-full short:w-full short:grid-cols-[45fr_55fr] short:rounded-none short:shadow-none">
      <div className="relative min-h-0 bg-raised">
        {post.image ? (
          <SafeImage
            src={post.image}
            alt={`Photo associée à la publication du ${post.date}`}
            className="absolute inset-0 size-full object-[50%_20%]"
            fallback={<Backdrop icon={Icon} />}
          />
        ) : (
          <Backdrop icon={Icon} />
        )}

        <Link
          href="/"
          aria-label="Retour au hub"
          className="absolute left-3 top-3 flex h-9 items-center gap-2 rounded-full bg-overlay px-3.5 text-sm font-medium text-inverse transition-transform hover:-translate-y-px active:scale-[.97] short:left-[max(0.5rem,env(safe-area-inset-left))] short:top-[max(0.5rem,env(safe-area-inset-top))] short:h-8 short:px-2.5"
        >
          <ArrowLeft className="size-4 text-club-accent-dark" aria-hidden />
          <span className="short:sr-only">Retour</span>
        </Link>

        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 pb-3 pt-10 short:pb-2 short:pl-[max(0.75rem,env(safe-area-inset-left))] short:pt-6"
          style={{ background: 'linear-gradient(to top, rgb(11 17 24 / .78), rgb(11 17 24 / 0))' }}
        >
          <p className="flex items-center gap-4 text-sm font-semibold tabular-nums text-inverse">
            <span className="flex items-center gap-1.5">
              <Heart className="size-[1.125rem] fill-danger text-danger" aria-hidden />
              {post.likes}
              <span className="sr-only"> mentions j’aime</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="size-[1.125rem]" aria-hidden />
              {post.commentCount}
              <span className="sr-only"> commentaires</span>
            </span>
          </p>
          <button
            type="button"
            onClick={onToggleComments}
            aria-pressed={commentsHidden}
            className="rounded-full bg-inverse/15 px-3 py-1.5 text-xs font-semibold text-inverse backdrop-blur-sm transition-colors hover:bg-inverse/25 short:px-2.5 short:py-1 short:text-[0.6875rem]"
          >
            {commentsHidden ? 'Afficher les commentaires' : 'Masquer les commentaires'}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-col short:pr-[max(0rem,env(safe-area-inset-right))]">
        <header className="flex items-center gap-3 px-5 pt-4 short:gap-2 short:px-3 short:pt-2">
          <Crest initials={club.initials} compact className="size-10 shrink-0 short:size-7" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 font-display text-lg font-semibold uppercase leading-none tracking-wide text-ink short:text-[1rem]">
              <span className="truncate">{club.name}</span>
              <BadgeCheck className="size-4 shrink-0 text-club-ink" aria-label="Compte certifié" />
            </p>
            <p className="mt-1 text-xs font-medium tabular-nums text-ink-3 short:mt-0.5">{post.date}</p>
          </div>
          {controls}
        </header>

        <div className="flex flex-col items-start gap-2 px-5 pb-3 pt-3 short:gap-1 short:px-3 short:pb-2 short:pt-1.5">
          {post.isNew && (
            <span className="rounded bg-club-2 px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-[0.1em] text-club-on-2">
              Nouveau
            </span>
          )}
          <p className="text-[1.0625rem] font-medium leading-snug text-ink text-pretty short:text-sm">{post.text}</p>
        </div>

        <div className="min-h-0 flex-1 border-t border-line">
          {commentsHidden ? (
            <p className="px-5 py-6 text-sm text-ink-3 short:px-3 short:py-3 short:text-xs">
              Commentaires masqués. {post.commentCount} réactions de supporters.
            </p>
          ) : (
            <ul
              tabIndex={0}
              aria-label="Commentaires"
              className="flex h-full flex-col gap-3.5 overflow-y-auto px-5 py-3.5 short:gap-2 short:px-3 short:py-2"
            >
              {post.comments.map((c) => (
                <CommentItem key={c.id} comment={c} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  const initials = comment.author
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
  return (
    <li className="flex gap-2.5">
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-raised text-xs font-semibold text-ink-2 short:size-6 short:text-[0.625rem]"
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-2 text-[0.8125rem] short:text-xs">
          <span className="font-semibold text-ink">{comment.author}</span>
          <span className="text-ink-3">{comment.time}</span>
        </p>
        <p className="mt-0.5 text-[0.9375rem] leading-snug text-ink-2 text-pretty short:text-[0.8125rem]">
          {comment.text}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs font-medium tabular-nums text-ink-3 short:hidden">
          <Heart className="size-3" aria-hidden />
          {comment.likes}
        </p>
      </div>
    </li>
  )
}

function Backdrop({ icon: Icon }: { icon: Post['icon'] }) {
  return (
    <div
      aria-hidden
      className={cn('absolute inset-0 flex items-center justify-center')}
      style={{
        background:
          'linear-gradient(135deg, var(--club-primary) 0%, color-mix(in oklab, var(--club-primary) 45%, #0B1118) 100%)',
      }}
    >
      <Icon className="size-40 text-club-on opacity-[0.14] short:size-28" strokeWidth={1.25} />
    </div>
  )
}

```

## `components/social-viewer.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useClubTheme } from '@/components/club-theme-provider'
import { KeyHint } from '@/components/key-hint'
import { SocialPost } from '@/components/social-post'
import { POSTS } from '@/lib/mock-data'

export function SocialViewer() {
  const router = useRouter()
  const { club } = useClubTheme()
  const [index, setIndex] = useState(0)
  const [commentsHidden, setCommentsHidden] = useState(false)
  const count = POSTS.length

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setIndex((i) => (i + 1) % count)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setIndex((i) => (i - 1 + count) % count)
      } else if (e.key === 'Escape') {
        router.push('/')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [count, router])

  const post = POSTS[index]

  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-3 p-6 short:p-0">
      <SocialPost
        key={post.id}
        post={post}
        club={club}
        commentsHidden={commentsHidden}
        onToggleComments={() => setCommentsHidden((h) => !h)}
        controls={
          <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Changer de publication">
            <NavButton label="Publication précédente" onClick={() => setIndex((index - 1 + count) % count)}>
              <ChevronLeft className="size-4" aria-hidden />
            </NavButton>
            <span className="min-w-9 text-center text-xs font-semibold tabular-nums text-ink-2" aria-live="polite">
              {index + 1} / {count}
            </span>
            <NavButton label="Publication suivante" onClick={() => setIndex((index + 1) % count)}>
              <ChevronRight className="size-4" aria-hidden />
            </NavButton>
          </div>
        }
      />

      <div className="flex items-center gap-5 rounded-full bg-overlay px-5 py-2 short:hidden">
        <KeyHint keys="← →" label="Changer de publication" />
        <KeyHint keys="Échap" label="Retour" />
      </div>
    </main>
  )
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-full bg-raised text-ink-2 transition-colors hover:bg-club-subtle hover:text-club-ink short:size-6"
    >
      {children}
    </button>
  )
}

```

## `components/toast-provider.tsx`

```tsx
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface ToastContextValue {
  show: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((message: string) => {
    if (timer.current) clearTimeout(timer.current)
    setToast({ id: Date.now(), message })
    timer.current = setTimeout(() => setToast(null), 1800)
  }, [])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-16 z-[60] flex justify-center px-4 short:bottom-4"
      >
        {toast && (
          <div
            key={toast.id}
            className="animate-in fade-in slide-in-from-bottom-2 rounded-full bg-overlay px-5 py-2.5 text-[0.9375rem] font-medium text-inverse shadow-lift duration-200 short:px-4 short:py-1.5 short:text-sm"
          >
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

```

## `components/top-bar.tsx`

```tsx
import { CalendarDays, Settings, Wallet } from 'lucide-react'
import { Chip } from '@/components/chip'
import { Crest } from '@/components/crest'
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
          <h1 className="truncate font-display text-2xl font-semibold uppercase leading-none tracking-wide text-ink short:text-lg">
            {club.name}
          </h1>
          <p className="mt-1 truncate text-sm font-medium text-ink-2 short:hidden">
            {club.competition} · Saison 2026/27 · 2e · 27 pts
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Chip icon={CalendarDays} className="short:hidden">
          J12 · Dim. 23 nov.
        </Chip>
        <Chip icon={Wallet}>{budget}</Chip>
        <Chip icon={Settings} interactive iconOnlyWhenCompact onClick={onOpenSettings} aria-haspopup="dialog">
          Réglages
        </Chip>
      </div>
    </header>
  )
}

```

## `components/ui/button.tsx`

```tsx
import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        outline:
          'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default:
          'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: 'size-8',
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg',
        'icon-lg': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

```

## `lib/clubs.ts`

```ts
import { contrast, ensureContrast, firstReadable, mix } from './color'

export type ClubId =
  | 'real-madrid'
  | 'barcelone'
  | 'liverpool'
  | 'psg'
  | 'bayern'
  | 'online-manager'

export interface Club {
  id: ClubId
  name: string
  initials: string
  competition: string
  primary: string
  onPrimary: string
  secondary: string
  subtle: string
}

export const CLUBS: Club[] = [
  {
    id: 'real-madrid',
    name: 'Real Madrid',
    initials: 'RM',
    competition: 'LaLiga',
    primary: '#00529F',
    onPrimary: '#FFFFFF',
    secondary: '#FEBE10',
    subtle: '#E5EEF8',
  },
  {
    id: 'barcelone',
    name: 'FC Barcelone',
    initials: 'FCB',
    competition: 'LaLiga',
    primary: '#A50044',
    onPrimary: '#FFFFFF',
    secondary: '#004D98',
    subtle: '#F8E5EE',
  },
  {
    id: 'liverpool',
    name: 'Liverpool',
    initials: 'LFC',
    competition: 'Premier League',
    primary: '#C8102E',
    onPrimary: '#FFFFFF',
    secondary: '#00B2A9',
    subtle: '#FBE6E9',
  },
  {
    id: 'psg',
    name: 'Paris SG',
    initials: 'PSG',
    competition: 'Ligue 1',
    primary: '#004170',
    onPrimary: '#FFFFFF',
    secondary: '#DA291C',
    subtle: '#E3ECF3',
  },
  {
    id: 'bayern',
    name: 'Bayern',
    initials: 'FCB',
    competition: 'Bundesliga',
    primary: '#DC052D',
    onPrimary: '#FFFFFF',
    secondary: '#0066B2',
    subtle: '#FCE4E8',
  },
  {
    id: 'online-manager',
    name: 'Online Manager',
    initials: 'OM',
    competition: 'Online League',
    primary: '#0FA47A',
    onPrimary: '#FFFFFF',
    secondary: '#121A23',
    subtle: '#E3F7EF',
  },
]

export const DEFAULT_CLUB_ID: ClubId = 'real-madrid'
export const CLUB_STORAGE_KEY = 'om-club'
export const THEME_STORAGE_KEY = 'om-theme'

export function getClub(id: string | null | undefined): Club {
  return CLUBS.find((c) => c.id === id) ?? CLUBS[0]
}

const SURFACE = { light: '#FFFFFF', dark: '#111821' }
const SCRIM = '#0B1118'
const INK_DARK = '#121A23'

/**
 * The raw club colors are only used for fills. Text, rings and accents that sit
 * on a known background get a derived variant so they stay readable for every
 * palette (e.g. Online Manager's near-black secondary on a dark scrim).
 */
function clubVars(club: Club, mode: 'light' | 'dark') {
  const surface = SURFACE[mode]
  const ink = ensureContrast(club.primary, surface, 4.5, mode === 'light' ? '#000000' : '#FFFFFF')
  const accentOnDark = firstReadable([club.secondary, club.primary], SCRIM, 4.5, '')
  const accentDark =
    accentOnDark || ensureContrast(club.secondary, SCRIM, 4.5, '#FFFFFF')
  const accentOnPrimary = firstReadable([club.secondary], club.primary, 3, club.onPrimary)
  const onSecondary = contrast('#FFFFFF', club.secondary) >= contrast(INK_DARK, club.secondary) ? '#FFFFFF' : INK_DARK
  const subtle = mode === 'light' ? club.subtle : mix(club.primary, surface, 0.82)

  return [
    `--club-primary:${club.primary}`,
    `--club-on-primary:${club.onPrimary}`,
    `--club-secondary:${club.secondary}`,
    `--club-primary-subtle:${subtle}`,
    `--club-ink:${ink}`,
    `--club-accent-dark:${accentDark}`,
    `--club-accent-on-primary:${accentOnPrimary}`,
    `--club-on-secondary:${onSecondary}`,
  ].join(';')
}

/** Static CSS for every club in both themes, keyed on `html[data-club]`. */
export function buildClubThemeCss() {
  return CLUBS.map(
    (c) =>
      `html[data-club="${c.id}"]{${clubVars(c, 'light')}}html[data-club="${c.id}"].dark{${clubVars(c, 'dark')}}`,
  ).join('')
}

export function buildThemeBootScript() {
  const ids = JSON.stringify(CLUBS.map((c) => c.id))
  return `try{var d=document.documentElement,c=localStorage.getItem('${CLUB_STORAGE_KEY}'),t=localStorage.getItem('${THEME_STORAGE_KEY}');if(c&&${ids}.indexOf(c)>-1)d.setAttribute('data-club',c);if(t==='dark')d.classList.add('dark')}catch(e){}`
}

```

## `lib/color.ts`

```ts
type RGB = [number, number, number]

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB
}

function toHex(rgb: RGB) {
  return (
    '#' +
    rgb
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  )
}

export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Linear mix: 0 returns `a`, 1 returns `b`. */
export function mix(a: string, b: string, t: number) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  return toHex(ca.map((v, i) => v * (1 - t) + cb[i] * t) as RGB)
}

/** Moves `color` toward `toward` until it reaches `min` contrast on `bg`. */
export function ensureContrast(color: string, bg: string, min: number, toward: string) {
  for (let t = 0; t <= 1.0001; t += 0.04) {
    const candidate = mix(color, toward, t)
    if (contrast(candidate, bg) >= min) return candidate
  }
  return toward
}

/** First candidate that reaches `min` contrast on `bg`, otherwise `fallback`. */
export function firstReadable(candidates: string[], bg: string, min: number, fallback: string) {
  return candidates.find((c) => contrast(c, bg) >= min) ?? fallback
}

```

## `lib/mock-data.ts`

```ts
import {
  ArrowLeftRight,
  Briefcase,
  ClipboardList,
  FastForward,
  Goal,
  HeartPulse,
  Newspaper,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react'

export const IMAGES = {
  background: '/images/stadium-bg.png',
  backgroundRemote:
    'https://www.figma.com/api/mcp/asset/ce022aaf-111e-457e-994e-145a22df2861.png',
  press: '/images/press-conference.png',
  pressRemote: 'https://www.figma.com/api/mcp/asset/187c390e-c303-48fb-955e-e9860d37a057.png',
}

export interface MenuItem {
  id: string
  label: string
  icon: LucideIcon
  badge?: number
  primary?: boolean
  href?: string
}

export const MENU: MenuItem[] = [
  { id: 'avancer', label: 'Avancer', icon: FastForward, primary: true },
  { id: 'effectif', label: 'Effectif', icon: Users, badge: 2 },
  { id: 'tactique', label: 'Tactique', icon: ClipboardList },
  { id: 'competition', label: 'Compétition', icon: Trophy },
  { id: 'medias', label: 'Médias', icon: Newspaper, badge: 5, href: '/medias/fil' },
  { id: 'bureau', label: 'Bureau du manager', icon: Briefcase },
]

export interface NewsStory {
  id: string
  meta: string
  headline: string
  lead: string
  image?: string
  icon: LucideIcon
}

export const NEWS: NewsStory[] = [
  {
    id: 'classico',
    meta: 'MARCA · CONFÉRENCE DE PRESSE · IL Y A 2 H',
    headline: 'Le Clásico se prépare dès ce soir',
    lead: 'Après la victoire 2-0 contre Valence, l’entraîneur madrilène appelle au calme avant de recevoir le Barça dimanche.',
    image: IMAGES.press,
    icon: Newspaper,
  },
  {
    id: 'resume',
    meta: 'LALIGA · RÉSUMÉ · HIER',
    headline: 'Valence 0-2 Real Madrid : le résumé',
    lead: 'Deux buts en seconde période suffisent au Real pour s’installer à la deuxième place, à deux longueurs du leader.',
    icon: Goal,
  },
  {
    id: 'mercato',
    meta: 'L’ÉQUIPE · MERCATO · IL Y A 5 H',
    headline: 'Mercato : le club suit un milieu de terrain',
    lead: 'La cellule de recrutement a envoyé plusieurs observateurs pour suivre le joueur lors des deux prochaines rencontres.',
    icon: ArrowLeftRight,
  },
]

export interface Team {
  initials: string
  primary: string
  secondary: string
}

export const TEAMS = {
  barca: { initials: 'FCB', primary: '#A50044', secondary: '#004D98' },
  madrid: { initials: 'RM', primary: '#00529F', secondary: '#FEBE10' },
  atletico: { initials: 'ATM', primary: '#CB3524', secondary: '#272E61' },
  villarreal: { initials: 'VIL', primary: '#F2C500', secondary: '#005187' },
  athletic: { initials: 'ATH', primary: '#EE2523', secondary: '#121A23' },
  osasuna: { initials: 'OSA', primary: '#D91A21', secondary: '#0A346F' },
  inter: { initials: 'INT', primary: '#0068A8', secondary: '#121A23' },
  sevilla: { initials: 'SEV', primary: '#D4001F', secondary: '#FFFFFF' },
} satisfies Record<string, Team>

export interface StandingRow {
  pos: number
  name: string
  value: number
  color: string
  highlight?: boolean
}

export const STANDINGS: StandingRow[] = [
  { pos: 1, name: 'FC Barcelone', value: 29, color: TEAMS.barca.primary },
  { pos: 2, name: 'Real Madrid', value: 27, color: TEAMS.madrid.primary, highlight: true },
  { pos: 3, name: 'Atlético de Madrid', value: 24, color: TEAMS.atletico.primary },
  { pos: 4, name: 'Villarreal', value: 21, color: TEAMS.villarreal.primary },
  { pos: 5, name: 'Athletic Club', value: 20, color: TEAMS.athletic.primary },
]

export const SCORERS: StandingRow[] = [
  { pos: 1, name: 'K. Mbappé', value: 11, color: TEAMS.madrid.primary, highlight: true },
  { pos: 2, name: 'R. Lewandowski', value: 9, color: TEAMS.barca.primary },
  { pos: 3, name: 'J. Álvarez', value: 7, color: TEAMS.atletico.primary },
  { pos: 4, name: 'A. Budimir', value: 6, color: TEAMS.osasuna.primary },
  { pos: 5, name: 'Vinícius Jr', value: 6, color: TEAMS.madrid.primary, highlight: true },
]

export interface CalendarEntry {
  day: number
  weekday: string
  today?: boolean
  match?: {
    venue: 'DOM.' | 'EXT.'
    opponent: Team
    opponentName: string
    competition?: string
  }
}

export const CALENDAR: CalendarEntry[] = [
  {
    day: 23,
    weekday: 'Dim.',
    today: true,
    match: { venue: 'DOM.', opponent: TEAMS.barca, opponentName: 'FC Barcelone' },
  },
  { day: 24, weekday: 'Lun.' },
  { day: 25, weekday: 'Mar.' },
  {
    day: 26,
    weekday: 'Mer.',
    match: {
      venue: 'EXT.',
      opponent: TEAMS.inter,
      opponentName: 'Inter',
      competition: 'Champions League',
    },
  },
  { day: 27, weekday: 'Jeu.' },
  { day: 28, weekday: 'Ven.' },
  { day: 29, weekday: 'Sam.' },
  {
    day: 30,
    weekday: 'Dim.',
    match: { venue: 'EXT.', opponent: TEAMS.sevilla, opponentName: 'Séville FC' },
  },
]

export const NEXT_MATCH = {
  date: 'Dim. 23 nov.',
  venue: 'Domicile · 21:00',
  title: 'El Clásico',
  opponent: TEAMS.barca,
}

export const HINTS = [
  { keys: 'Espace', label: 'Avancer' },
  { keys: 'Entrée', label: 'Valider' },
  { keys: 'Échap', label: 'Retour' },
  { keys: '← →', label: 'Changer d’actu' },
  { keys: '1-6', label: 'Menu' },
]

export interface Comment {
  id: string
  author: string
  text: string
  time: string
  likes: number
}

export interface Post {
  id: string
  date: string
  text: string
  image?: string
  icon: LucideIcon
  likes: string
  commentCount: string
  isNew?: boolean
  comments: Comment[]
}

export const POSTS: Post[] = [
  {
    id: 'entrainement',
    date: '23/11',
    text: 'Le groupe a repris l’entraînement avant le Clásico 💪',
    image: IMAGES.press,
    icon: Newspaper,
    likes: '12,4 k',
    commentCount: '842',
    isNew: true,
    comments: [
      { id: 'c1', author: 'Camille R.', text: 'Enfin ! Hâte d’être à dimanche, on va les écraser 🔥', time: '12 min', likes: 214 },
      { id: 'c2', author: 'Sofia B.', text: 'Pourvu qu’il n’y ait pas de blessé avant le Clásico… j’ai tellement peur.', time: '18 min', likes: 96 },
      { id: 'c3', author: 'Karim D.', text: 'Tout ça pour que je rate le match parce que ma belle-mère vient dîner 😭', time: '26 min', likes: 388 },
      { id: 'c4', author: 'Julien M.', text: 'Ça sent le 3-0, je le sens dans mes genoux.', time: '31 min', likes: 57 },
      { id: 'c5', author: 'Léa P.', text: 'Allez les Merengues !!! Hala Madrid 🤍', time: '45 min', likes: 143 },
      { id: 'c6', author: 'Thomas L.', text: 'Si on aligne la même équipe que contre Valence, on ne change pas une équipe qui gagne.', time: '1 h', likes: 72 },
      { id: 'c7', author: 'Nadia K.', text: 'Mon chat porte le maillot, il valide la préparation 🐱', time: '1 h', likes: 301 },
    ],
  },
  {
    id: 'stade',
    date: '22/11',
    text: 'Pelouse impeccable, tribunes en préparation. Rendez-vous dimanche à 21h pour recevoir le Barça 🏟️',
    image: IMAGES.background,
    icon: Newspaper,
    likes: '8,9 k',
    commentCount: '416',
    isNew: true,
    comments: [
      { id: 'd1', author: 'Hugo V.', text: 'Cette pelouse, on dirait un tapis de billard. Les joueurs vont se régaler.', time: '2 h', likes: 88 },
      { id: 'd2', author: 'Inès A.', text: 'J’ai mes places, j’ai déjà pris ma journée. Le patron ne sait pas encore 🤫', time: '2 h', likes: 176 },
      { id: 'd3', author: 'Marc T.', text: 'Un peu inquiet pour la défense centrale, honnêtement…', time: '3 h', likes: 41 },
      { id: 'd4', author: 'Élodie S.', text: 'Quelqu’un a une place en trop ? Je promets d’être raisonnable 😅', time: '3 h', likes: 129 },
      { id: 'd5', author: 'Paul G.', text: 'L’ambiance va être folle, je suis déjà enroué rien que d’y penser.', time: '4 h', likes: 64 },
    ],
  },
  {
    id: 'infirmerie',
    date: '21/11',
    text: 'Point médical : deux joueurs suivis de près, la décision sera prise samedi.',
    icon: HeartPulse,
    likes: '5,2 k',
    commentCount: '1,1 k',
    comments: [
      { id: 'e1', author: 'Romain F.', text: 'Dites-moi que le groupe sera au complet, s’il vous plaît 🙏', time: '5 h', likes: 233 },
      { id: 'e2', author: 'Chloé D.', text: 'Le staff médical est au top cette saison, faisons-leur confiance.', time: '5 h', likes: 118 },
      { id: 'e3', author: 'Yanis B.', text: 'Moi à chaque communiqué médical : *respire dans un sac en papier*', time: '6 h', likes: 412 },
      { id: 'e4', author: 'Anaïs C.', text: 'On a un banc solide, ça ira. Courage à eux !', time: '7 h', likes: 54 },
      { id: 'e5', author: 'Victor N.', text: 'Rien de grave j’espère. Un Clásico sans nos meilleurs, ce serait cruel.', time: '8 h', likes: 80 },
    ],
  },
]

```

## `lib/utils.ts`

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

## `package.json`

```json
{
  "name": "my-project",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@12.3.4",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@base-ui/react": "^1.5.0",
    "@vercel/analytics": "1.6.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cn": "^0.5.1",
    "lucide-react": "^1.16.0",
    "next": "16.4.3",
    "react": "^19",
    "react-dom": "^19",
    "shadcn": "^4.11.0",
    "tailwind-merge": "^3.3.1",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.3",
    "@types/node": "^24",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "postcss": "^8.5",
    "tailwindcss": "^4.3.3",
    "typescript": "5.7.3"
  }
}

```

