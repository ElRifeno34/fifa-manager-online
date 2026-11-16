# Online Manager — DA de référence v3 (v0)

Code source exporté de v0 (Next.js 16 + Tailwind v4). Images jointes : stadium-bg.png, stadium-bg-vivid.jpg, press-conference.png.

## `app/globals.css`

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

@custom-variant dark (&:is(.dark *));
/* Phones in landscape (and very short windows) switch to the compact layout. */
@custom-variant short (@media (max-height: 500px));

@theme inline {
  --font-sans: var(--font-archivo), 'Archivo Fallback', system-ui, sans-serif;
  --font-display: var(--font-archivo), 'Archivo Fallback', system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), 'JetBrains Mono Fallback', ui-monospace, monospace;

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
  --color-club-rule: var(--club-rule);
  --color-club-accent-dark: var(--club-accent-dark);
  --color-club-accent-on: var(--club-accent-on-primary);

  /* Flat print language: no drop shadows anywhere. */
  --shadow-panel: none;
  --shadow-lift: none;

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
  --radius-sm: 1px;
  --radius-md: 2px;
  --radius-lg: 2px;
  --radius-xl: 2px;
}

:root {
  color-scheme: light;
  --bg-base: #e4e9ef;
  --surface: #f5f3ef;
  --sheet-alpha: 94%;
  --raised: #ebe8e2;
  --overlay: #111418;
  --scrim: #0b1118;
  --line: #d9d5ce;
  --line-strong: #bdb8af;
  --ink: #111418;
  --ink-2: #5b6168;
  --ink-3: #7a8087;
  --inverse: #ffffff;
  --success: #1f9d57;
  --warning: #d98a00;
  --danger: #e0364a;
  --veil: linear-gradient(180deg, rgb(238 242 246 / 0.3), rgb(238 242 246 / 0.4));
  --photo-filter: contrast(1.1) saturate(1.25);
  --beam: rgb(255 255 255 / 0.62);
  --beam-opacity: 0.55;
  --particle: rgb(255 255 255 / 0.95);
  --pitch-fallback: linear-gradient(180deg, #dbe9f7 0%, #eef2f6 55%, #cfe3c8 100%);
}

.dark {
  color-scheme: dark;
  --bg-base: #0a0e13;
  --surface: #121417;
  --sheet-alpha: 92%;
  --raised: #1a1d21;
  --overlay: #0a0b0d;
  --line: #2a2e33;
  --line-strong: #3d4248;
  --ink: #ede9e4;
  --ink-2: #a9adb2;
  --ink-3: #80858b;
  --veil: linear-gradient(180deg, rgb(6 10 20 / 0.55), rgb(8 12 18 / 0.4));
  --photo-filter: brightness(0.34) contrast(1.2) saturate(1.1) hue-rotate(8deg);
  --beam: rgb(176 204 255 / 0.8);
  --beam-opacity: 0.85;
  --particle: rgb(196 218 255 / 0.95);
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
    @apply font-sans text-ink antialiased;
    background-color: transparent;
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

/* Archivo condensed (wdth 75) is the display voice everywhere it is used. */
@layer utilities {
  .font-display {
    font-stretch: 75%;
  }
}

/* Small uppercase label: Archivo condensed 600, +8% tracking. */
@utility caps {
  font-family: var(--font-archivo), system-ui, sans-serif;
  font-stretch: 75%;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.6875rem;
  line-height: 1.2;
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
    fill 200ms ease !important;
}

@media (prefers-reduced-motion: reduce) {
  html.theme-anim,
  html.theme-anim * {
    transition: none !important;
  }
}

/* ---------- Programme sheets: flat paper, hairline border, 2px club rule on top ---------- */

@layer components {
  .paper {
    background-color: color-mix(in srgb, var(--surface) var(--sheet-alpha), transparent);
    border: 1px solid var(--line);
  }
  .sheet {
    background-color: color-mix(in srgb, var(--surface) var(--sheet-alpha), transparent);
    border: 1px solid var(--line);
    border-top: 2px solid var(--club-rule);
  }
}

/* ---------- News carousel: segmented progress that drives the 8s timer ---------- */

.seg-fill {
  transform-origin: left center;
  animation: seg-fill 8s linear forwards;
}

@keyframes seg-fill {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

[data-paused='true'] .seg-fill {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .seg-fill {
    animation: none;
    transform: none;
  }
}

/* ---------- Animated stadium background (transform + opacity only) ---------- */

.bg-photo {
  filter: var(--photo-filter);
  transform: scale(1.08);
  will-change: transform;
  animation: bg-kenburns 40s ease-in-out infinite alternate;
}

@keyframes bg-kenburns {
  from {
    transform: translate3d(-1.2%, -0.8%, 0) scale(1.07);
  }
  to {
    transform: translate3d(1.2%, 0.8%, 0) scale(1.15);
  }
}

.bg-beam {
  position: absolute;
  top: -4vh;
  width: 62vw;
  height: 120vh;
  opacity: var(--beam-opacity);
  background: conic-gradient(
    from 158deg at 50% 0%,
    transparent 0deg,
    var(--beam) 22deg,
    transparent 44deg
  );
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, rgb(0 0 0 / 0.55) 45%, transparent 85%);
  mask-image: linear-gradient(to bottom, #000 0%, rgb(0 0 0 / 0.55) 45%, transparent 85%);
  transform-origin: 50% 0;
  will-change: transform, opacity;
  animation: bg-beam-sway var(--dur, 30s) ease-in-out var(--delay, 0s) infinite alternate;
}

@keyframes bg-beam-sway {
  from {
    transform: rotate(var(--from, -16deg));
    opacity: calc(var(--beam-opacity) * 0.55);
  }
  to {
    transform: rotate(var(--to, 12deg));
    opacity: var(--beam-opacity);
  }
}

.bg-sheen {
  position: absolute;
  width: 90vmax;
  height: 90vmax;
  border-radius: 9999px;
  will-change: transform;
  animation: bg-sheen-drift var(--dur, 36s) ease-in-out var(--delay, 0s) infinite alternate;
}

@keyframes bg-sheen-drift {
  from {
    transform: translate3d(-6%, -4%, 0);
  }
  to {
    transform: translate3d(8%, 6%, 0);
  }
}

.bg-particle {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--s);
  height: var(--s);
  border-radius: 9999px;
  background: var(--particle);
  box-shadow: 0 0 calc(var(--s) * 3) var(--particle);
  opacity: 0;
  will-change: transform, opacity;
  animation: bg-particle-drift var(--dur) linear var(--delay) infinite;
}

@keyframes bg-particle-drift {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 0;
  }
  15%,
  80% {
    opacity: var(--o);
  }
  100% {
    transform: translate3d(var(--dx), -38vh, 0);
    opacity: 0;
  }
}

[data-bg-paused='true'] *,
[data-bg-paused='true'] {
  animation-play-state: paused !important;
}

/* Static photo when the user turns the animation off or prefers reduced motion. */
html[data-bg='static'] .bg-motion {
  display: none;
}
html[data-bg='static'] .bg-photo {
  animation: none;
  transform: scale(1.08);
  will-change: auto;
}

@media (prefers-reduced-motion: reduce) {
  .bg-motion {
    display: none;
  }
  .bg-photo {
    animation: none;
    transform: scale(1.08);
    will-change: auto;
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
import { Archivo, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AppBackground } from '@/components/app-background'
import { ClubThemeProvider } from '@/components/club-theme-provider'
import { RotateOverlay } from '@/components/rotate-overlay'
import { ToastProvider } from '@/components/toast-provider'
import { DEFAULT_CLUB_ID, buildClubThemeCss, buildThemeBootScript } from '@/lib/clubs'

// Variable Archivo with its width axis: condensed (75) for headings and labels, normal (100) for text.
const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
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
      className={`${archivo.variable} ${jetbrainsMono.variable} bg-base`}
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

## `app/messagerie/page.tsx`

```tsx
import type { Metadata } from 'next'
import { MailView } from '@/components/mail-view'

export const metadata: Metadata = {
  title: 'Messagerie · Online Manager',
  description: 'Boîte de réception du manager : direction, staff, transferts et presse.',
}

export default async function MessageriePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams
  return <MailView initialId={id} />
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
'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { IMAGES } from '@/lib/mock-data'

const BEAMS = [
  { left: '-6vw', from: '-18deg', to: '8deg', dur: '31s', delay: '-4s' },
  { left: '30vw', from: '-10deg', to: '16deg', dur: '39s', delay: '-17s' },
  { left: '52vw', from: '-14deg', to: '12deg', dur: '35s', delay: '-9s' },
]

/** Deterministic pseudo-random values so server and client markup match. */
const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const r = (n: number) => {
    const v = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453
    return v - Math.floor(v)
  }
  return {
    x: `${Math.round(r(1) * 96)}%`,
    y: `${Math.round(30 + r(2) * 65)}%`,
    s: `${(2 + r(3) * 2.5).toFixed(1)}px`,
    o: (0.35 + r(4) * 0.4).toFixed(2),
    dur: `${Math.round(22 + r(5) * 24)}s`,
    delay: `-${Math.round(r(6) * 40)}s`,
    dx: `${Math.round((r(7) - 0.5) * 8)}vw`,
  }
})

/**
 * Stadium photo with a slow Ken Burns, floodlight beams, drifting particles and a
 * club-tinted sheen. Everything animated uses transform/opacity only, pauses with
 * the tab and is hidden by `html[data-bg="static"]` or prefers-reduced-motion.
 */
export function AppBackground() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const sync = () => {
      root.dataset.bgPaused = String(document.hidden)
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'var(--pitch-fallback)' }}
    >
      <div
        className="bg-photo absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${IMAGES.background}), url(${IMAGES.backgroundBlurred}), url(${IMAGES.backgroundRemote})`,
        }}
      />
      <div className="absolute inset-0" style={{ background: 'var(--veil)' }} />

      <div className="bg-motion absolute inset-0">
        <div
          className="bg-sheen"
          style={
            {
              left: '-30vmax',
              top: '-40vmax',
              background:
                'radial-gradient(closest-side, color-mix(in oklab, var(--club-primary) 22%, transparent), transparent)',
              '--dur': '38s',
            } as CSSProperties
          }
        />
        <div
          className="bg-sheen"
          style={
            {
              right: '-35vmax',
              bottom: '-45vmax',
              background:
                'radial-gradient(closest-side, color-mix(in oklab, var(--club-secondary) 20%, transparent), transparent)',
              '--dur': '46s',
              '--delay': '-12s',
            } as CSSProperties
          }
        />

        {BEAMS.map((b) => (
          <div
            key={b.left}
            className="bg-beam"
            style={
              {
                left: b.left,
                '--from': b.from,
                '--to': b.to,
                '--dur': b.dur,
                '--delay': b.delay,
              } as CSSProperties
            }
          />
        ))}

        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="bg-particle"
            style={
              {
                '--x': p.x,
                '--y': p.y,
                '--s': p.s,
                '--o': p.o,
                '--dur': p.dur,
                '--delay': p.delay,
                '--dx': p.dx,
              } as CSSProperties
            }
          />
        ))}
      </div>
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
  const home = match?.venue.startsWith('DOM')
  const label = match
    ? `${weekday} ${day} novembre : ${home ? 'domicile' : 'extérieur'} contre ${match.opponentName}${match.competition ? `, ${match.competition}` : ''}`
    : `${weekday} ${day} novembre : pas de match`

  return (
    <li
      aria-label={label}
      aria-current={today ? 'date' : undefined}
      className={cn(
        'relative flex min-h-0 flex-1 items-center gap-2.5 border-b border-line px-3 last:border-b-0 short:gap-2 short:px-2',
        className,
      )}
    >
      {today && <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-club-rule" />}
      <span
        className={cn(
          'w-6 text-right font-mono text-[1.0625rem] font-bold leading-none short:w-5 short:text-[0.9375rem]',
          match || today ? 'text-ink' : 'text-ink-3',
        )}
      >
        {day}
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className={cn('caps text-xs short:text-[0.6875rem]', today ? 'text-ink' : 'text-ink-2')}>
          {weekday.replace('.', '')}
        </span>
        {match?.competition && (
          <span className="truncate text-[0.625rem] text-ink-3 short:hidden">{match.competition}</span>
        )}
      </span>
      {match && (
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              'caps flex h-[1.125rem] items-center px-1.5 text-[0.625rem] short:h-4',
              home ? 'bg-ink text-surface' : 'border border-line-strong text-ink-2',
            )}
          >
            {home ? 'DOM' : 'EXT'}
          </span>
          <Crest
            initials={match.opponent.initials}
            primary={match.opponent.primary}
            secondary={match.opponent.secondary}
            compact
            className="size-[1.375rem] short:size-5"
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
import { SectionHeader } from '@/components/data-panel'
import { CALENDAR, NEXT_MATCH } from '@/lib/mock-data'

export function CalendarPanel() {
  return (
    <aside aria-label="Calendrier" className="sheet flex min-h-0 flex-col overflow-hidden">
      <SectionHeader index="03" title="Calendrier" className="short:hidden" />

      <div className="flex items-start justify-between gap-2 bg-club px-3 py-2.5 text-club-on short:px-2 short:py-1.5">
        <div className="min-w-0">
          <p className="caps text-[0.625rem] opacity-80 short:hidden">Prochain match</p>
          <p className="mt-1 flex items-baseline gap-1.5 leading-none short:mt-0">
            <span className="font-display text-xl font-bold uppercase short:text-base short:max-[720px]:text-sm">
              {NEXT_MATCH.weekday}
            </span>
            <span className="whitespace-nowrap font-mono text-xl font-bold short:text-base short:max-[720px]:text-sm">
              {NEXT_MATCH.date}
            </span>
          </p>
          <p className="mt-1.5 whitespace-nowrap text-[0.8125rem] font-medium opacity-90 short:mt-1 short:text-xs short:max-[720px]:text-[0.6875rem]">
            {NEXT_MATCH.venue} · <span className="font-mono">{NEXT_MATCH.time}</span>
          </p>
          <p className="mt-1 font-display text-base font-bold uppercase leading-none tracking-tight text-club-accent-on short:mt-0.5 short:text-sm">
            {NEXT_MATCH.title}
          </p>
        </div>
        <Crest
          initials={NEXT_MATCH.opponent.initials}
          primary={NEXT_MATCH.opponent.primary}
          secondary={NEXT_MATCH.opponent.secondary}
          compact
          className="size-10 shrink-0 short:size-7 short:max-[720px]:size-6"
        />
      </div>

      <ol className="flex min-h-0 flex-1 flex-col">
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

/** Flat ink strip holding the top-bar tags, separated by thin vertical rules. */
export function ChipGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-stretch divide-x divide-inverse/20 bg-overlay text-inverse', className)}>
      {children}
    </div>
  )
}

interface ChipProps extends Omit<ComponentProps<'button'>, 'children' | 'value'> {
  label: string
  value?: ReactNode
  icon?: LucideIcon
  /** Keep the label for screen readers only on compact screens. */
  compactLabelHidden?: boolean
  interactive?: boolean
}

/** Rectangular tag: label in condensed caps, value in mono. */
export function Chip({
  label,
  value,
  icon: Icon,
  compactLabelHidden,
  interactive,
  className,
  ...props
}: ChipProps) {
  const classes = cn(
    'inline-flex h-8 items-center gap-2 px-3 text-inverse short:h-7 short:gap-1.5 short:px-2',
    interactive && 'transition-colors duration-150 hover:bg-inverse/10 active:bg-inverse/15 motion-reduce:transition-none',
    className,
  )
  const content = (
    <>
      {Icon && <Icon className="size-4 shrink-0 text-club-accent-dark short:size-3.5" strokeWidth={1.75} aria-hidden />}
      <span className={cn('caps whitespace-nowrap text-inverse/70', compactLabelHidden && 'short:sr-only')}>
        {label}
      </span>
      {value !== undefined && (
        <span className="whitespace-nowrap font-mono text-[0.8125rem] font-semibold text-inverse short:text-xs">
          {value}
        </span>
      )}
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
  BG_STORAGE_KEY,
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
  animatedBg: boolean
  setAnimatedBg: (on: boolean) => void
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
  const [animatedBg, setAnimatedBgState] = useState(true)
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const root = document.documentElement
    setAnimatedBgState(root.getAttribute('data-bg') !== 'static')
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

  const setAnimatedBg = useCallback((on: boolean) => {
    const root = document.documentElement
    if (on) root.removeAttribute('data-bg')
    else root.setAttribute('data-bg', 'static')
    setAnimatedBgState(on)
    try {
      localStorage.setItem(BG_STORAGE_KEY, on ? 'on' : 'off')
    } catch {}
  }, [])

  const value = useMemo(
    () => ({ club: getClub(clubId), theme, setClub, setTheme, animatedBg, setAnimatedBg }),
    [clubId, theme, setClub, setTheme, animatedBg, setAnimatedBg],
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
  /** Thin frame for small crests (calendar rows, lists). */
  compact?: boolean
}

/** Square placeholder crest: initials on the club color, framed in the secondary. */
export function Crest({ initials, primary, secondary, className, compact }: CrestProps) {
  const background = primary ?? 'var(--club-primary)'
  const frame = secondary ?? 'var(--club-secondary)'
  const color = primary ? (isLightColor(primary) ? '#111418' : '#FFFFFF') : 'var(--club-on-primary)'
  const fontSize = initials.length > 2 ? '34cqw' : '42cqw'

  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 select-none items-center justify-center rounded-[2px]', className)}
      style={{
        background,
        color,
        containerType: 'size',
        border: `${compact ? 1.5 : 2}px solid ${frame}`,
        outline: compact ? undefined : '1px solid var(--line-strong)',
        outlineOffset: compact ? undefined : '2px',
      }}
    >
      <span className="font-display font-bold uppercase leading-none tracking-tight" style={{ fontSize }}>
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

```

## `components/home-hub.tsx`

```tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarPanel } from '@/components/calendar-panel'
import { useClubTheme } from '@/components/club-theme-provider'
import { DataPanel, DataRows, DataTabs } from '@/components/data-panel'
import { InboxPanel } from '@/components/inbox-panel'
import { KeyHintBar } from '@/components/key-hint'
import { MenuTile } from '@/components/menu-tile'
import { NewsCarousel } from '@/components/news-carousel'
import { SettingsSheet } from '@/components/settings-sheet'
import { useToast } from '@/components/toast-provider'
import { TopBar } from '@/components/top-bar'
import { ADVANCE_SUBLINE, MENU, NEWS, SCORERS, STANDINGS } from '@/lib/mock-data'

const TABS = [
  { id: 'classement', label: 'Classement', rows: STANDINGS },
  { id: 'buteurs', label: 'Buteurs', rows: SCORERS },
]

const [advanceItem, ...rowItems] = MENU

export function HomeHub() {
  const { club } = useClubTheme()
  const toast = useToast()
  const router = useRouter()
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
      } else if (/^[1-9]$/.test(e.key)) {
        tileRefs.current[Number(e.key) - 1]?.focus()
      } else if (e.key === 'm' || e.key === 'M') {
        router.push('/messagerie')
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
  }, [settingsOpen, toast, router])

  const registerRef = (i: number) => (el: HTMLElement | null) => {
    tileRefs.current[i] = el
  }

  return (
    <main className="mx-auto flex h-dvh w-full flex-col gap-3.5 overflow-hidden p-6 short:gap-1.5 short:p-2 short:pb-[max(0.5rem,env(safe-area-inset-bottom))] short:pl-[max(0.5rem,env(safe-area-inset-left))] short:pr-[max(0.5rem,env(safe-area-inset-right))] short:pt-[max(0.5rem,env(safe-area-inset-top))]">
      <TopBar club={club} budget="84,5 M€" onOpenSettings={() => setSettingsOpen(true)} />

      <div className="grid min-h-0 flex-1 grid-cols-[14.5rem_minmax(0,1fr)_13.75rem] gap-4 short:grid-cols-[10.5rem_minmax(0,1fr)_9.375rem] short:gap-2 short:max-[720px]:grid-cols-[10.5rem_minmax(0,1fr)_8.5rem]">
        <nav aria-label="Menu principal" className="flex min-h-0 flex-col gap-2.5 short:gap-1">
          <MenuTile
            ref={registerRef(0)}
            label={advanceItem.label}
            icon={advanceItem.icon}
            subline={ADVANCE_SUBLINE}
            primary
            shortcut="1"
            onClick={() => handleTile(advanceItem.id)}
          />

          <InboxPanel className="flex-1 short:flex-none" />

          <div className="paper flex shrink-0 flex-col short:min-h-0 short:flex-1">
            {rowItems.map((item, i) => (
              <MenuTile
                key={item.id}
                ref={registerRef(i + 1)}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                href={item.href}
                index={String(i + 2).padStart(2, '0')}
                shortcut={String(i + 2)}
                onClick={() => handleTile(item.id)}
              />
            ))}
          </div>
        </nav>

        <div className="flex min-h-0 min-w-0 flex-col gap-3 short:gap-1.5">
          <NewsCarousel stories={NEWS} index={storyIndex} onIndexChange={setStoryIndex} className="min-h-0 flex-1" />

          <div className="grid grid-cols-2 gap-3 short:hidden">
            <DataPanel index="01" title="Classement · LaLiga · J11">
              <DataRows rows={STANDINGS} />
            </DataPanel>
            <DataPanel index="02" title="Buteurs · LaLiga">
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

## `components/inbox-panel.tsx`

```tsx
import Link from 'next/link'
import { MESSAGES } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const unreadCount = MESSAGES.filter((m) => m.unread).length
const latest = MESSAGES.slice(0, 3)

function UnreadTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-[1.125rem] min-w-[1.125rem] shrink-0 items-center justify-center bg-club px-1 font-mono text-[0.6875rem] font-bold leading-none text-club-on short:h-3.5 short:min-w-3.5 short:text-[0.625rem]',
        className,
      )}
    >
      {unreadCount}
      <span className="sr-only"> non lus</span>
    </span>
  )
}

/** Large inbox on desktop (3 latest messages); a single compact row on phones in landscape. */
export function InboxPanel({ className }: { className?: string }) {
  return (
    <section aria-labelledby="inbox-title" className={cn('sheet flex min-h-0 flex-col', className)}>
      <div className="flex min-h-0 flex-1 flex-col short:hidden">
        <header className="flex items-center gap-2 px-3 pb-1.5 pt-2.5">
          <h3 id="inbox-title" className="caps flex-1 truncate text-ink">
            Boîte de réception
          </h3>
          <kbd
            aria-hidden
            className="flex h-4 min-w-4 items-center justify-center border border-line-strong px-1 font-mono text-[0.625rem] font-medium text-ink-3"
          >
            M
          </kbd>
          <UnreadTag />
        </header>

        <ul className="flex min-h-0 flex-1 flex-col">
          {latest.map((m) => (
            <li key={m.id} className="min-h-0 flex-1 border-t border-line">
              <Link
                href={`/messagerie?id=${m.id}`}
                className="group flex h-full min-h-0 items-center gap-2 overflow-hidden px-3 transition-colors duration-150 hover:bg-raised/80 focus-visible:bg-raised/80 focus-visible:outline-offset-[-2px] motion-reduce:transition-none"
              >
                <span aria-hidden className={cn('size-1.5 shrink-0', m.unread ? 'bg-club' : 'bg-transparent')} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={cn('caps truncate', m.unread ? 'text-ink' : 'text-ink-2')}>{m.sender}</span>
                    <span className="shrink-0 font-mono text-[0.6875rem] text-ink-3">{m.time}</span>
                  </span>
                  <span
                    className={cn(
                      'truncate text-[0.8125rem] leading-tight',
                      m.unread ? 'font-semibold text-ink' : 'text-ink-2',
                    )}
                  >
                    {m.subject}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/messagerie"
          className="caps flex h-8 shrink-0 items-center justify-between border-t border-line px-3 text-club-ink transition-colors duration-150 hover:bg-raised/80 focus-visible:outline-offset-[-2px] motion-reduce:transition-none"
        >
          <span>Tout voir →</span>
        </Link>
      </div>

      <Link
        href="/messagerie"
        aria-label="Boîte de réception"
        className="hidden h-[2.125rem] min-h-0 flex-col justify-center gap-px px-2 transition-colors hover:bg-raised/80 focus-visible:outline-offset-[-2px] short:flex"
      >
        <span className="flex items-center justify-between gap-1.5">
          <span className="caps truncate text-[0.625rem] text-ink">Boîte de réception</span>
          <UnreadTag />
        </span>
        <span className="truncate text-[0.6875rem] leading-tight text-ink-2">{latest[0].subject}</span>
      </Link>
    </section>
  )
}

```

## `components/key-hint.tsx`

```tsx
import { HINTS } from '@/lib/mock-data'

export function KeyHint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <kbd className="flex h-[1.125rem] min-w-[1.125rem] items-center justify-center border border-inverse/45 px-1.5 font-mono text-[0.6875rem] font-medium leading-none text-inverse">
        {keys}
      </kbd>
      <span className="caps text-inverse/75">{label}</span>
    </span>
  )
}

/** Desktop-only footer: shortcuts + a warning about the squad. Hidden on compact screens. */
export function KeyHintBar() {
  return (
    <footer
      aria-label="Raccourcis clavier"
      className="mx-auto flex items-center gap-5 bg-overlay px-5 py-2 short:hidden"
    >
      {HINTS.map((h) => (
        <KeyHint key={h.keys} keys={h.keys} label={h.label} />
      ))}
      <span className="h-4 w-px bg-inverse/25" aria-hidden />
      <span className="caps flex items-center gap-2 text-inverse">
        <span className="size-2 bg-warning" aria-hidden />
        <span>
          <span className="font-mono">2</span> titulaires fatigués
        </span>
      </span>
    </footer>
  )
}

```

## `components/mail-view.tsx`

```tsx
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

```

## `components/menu-tile.tsx`

```tsx
import Link from 'next/link'
import type { Ref } from 'react'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuTileProps {
  label: string
  icon: LucideIcon
  badge?: number
  /** Main call to action: solid club-colored block. Every other entry is a compact row. */
  primary?: boolean
  /** Mono line under the primary label, e.g. the next fixture. */
  subline?: string
  /** Two-digit mono index shown on rows (matches the keyboard digit). */
  index?: string
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
  subline,
  index,
  href,
  onClick,
  shortcut,
  ref,
}: MenuTileProps) {
  const className = cn(
    'group relative flex w-full min-w-0 text-left outline-none transition-colors duration-150 motion-reduce:transition-none',
    'focus-visible:outline-2 focus-visible:outline-club-ink',
    primary
      ? 'h-16 shrink-0 flex-col justify-center bg-club px-3.5 text-club-on hover:bg-[color-mix(in_oklab,var(--club-primary)_88%,black)] focus-visible:outline-offset-2 active:bg-[color-mix(in_oklab,var(--club-primary)_78%,black)] short:h-8 short:flex-row short:items-center short:px-2.5'
      : 'h-[2.375rem] shrink-0 items-center gap-2.5 border-b border-line px-3 last:border-b-0 hover:bg-raised/80 focus-visible:bg-raised/80 focus-visible:outline-offset-[-2px] active:bg-raised short:h-auto short:min-h-0 short:flex-1 short:gap-1.5 short:px-2',
  )

  const content = primary ? (
    <>
      <span className="flex w-full items-center justify-between gap-2">
        <span className="font-display text-[1.375rem] font-bold uppercase leading-none tracking-tight short:text-[0.9375rem]">
          {label}
        </span>
        <ArrowRight className="size-7 shrink-0 short:size-4" strokeWidth={2.25} aria-hidden />
      </span>
      {subline && (
        <span className="block w-full truncate font-mono text-[0.625rem] font-medium uppercase tracking-tight opacity-90 short:hidden">
          {subline}
        </span>
      )}
    </>
  ) : (
    <>
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 bg-club-rule opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
      />
      <span
        aria-hidden
        className="w-5 shrink-0 font-mono text-[0.6875rem] font-medium text-ink-3 transition-colors duration-150 group-hover:text-club-ink group-focus-visible:text-club-ink short:w-4 short:text-[0.625rem]"
      >
        {index}
      </span>
      <span className="min-w-0 flex-1 truncate text-[0.875rem] font-semibold leading-tight text-ink-2 transition-colors duration-150 group-hover:text-ink group-focus-visible:text-ink short:text-[0.6875rem]">
        {label}
      </span>
      {badge ? <Badge count={badge} /> : null}
      <Icon className="size-4 shrink-0 text-ink-3 short:size-3.5" strokeWidth={1.5} aria-hidden />
    </>
  )

  const shortcutProps = shortcut ? { 'aria-keyshortcuts': shortcut } : {}

  if (href) {
    return (
      <Link href={href} ref={ref as Ref<HTMLAnchorElement>} className={className} onClick={onClick} {...shortcutProps}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" ref={ref as Ref<HTMLButtonElement>} className={className} onClick={onClick} {...shortcutProps}>
      {content}
    </button>
  )
}

function Badge({ count }: { count: number }) {
  return (
    <span
      className="flex h-[1.125rem] min-w-[1.125rem] shrink-0 items-center justify-center bg-danger px-1 font-mono text-[0.6875rem] font-bold leading-none text-inverse short:h-3.5 short:min-w-3.5 short:px-0.5 short:text-[0.625rem]"
      aria-label={`${count} notification${count > 1 ? 's' : ''}`}
    >
      {count}
    </span>
  )
}

```

## `components/news-carousel.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NumericText } from '@/components/numeric-text'
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
  const [reduceMotion, setReduceMotion] = useState(false)
  const count = stories.length

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  // Without animation there is no animationend, so fall back to a plain timer.
  useEffect(() => {
    if (!reduceMotion || paused || count < 2) return
    const timer = setTimeout(() => onIndexChange((index + 1) % count), AUTO_ADVANCE_MS)
    return () => clearTimeout(timer)
  }, [reduceMotion, index, paused, count, onIndexChange])

  const go = (delta: number) => onIndexChange((index + delta + count) % count)

  return (
    <section
      aria-roledescription="carousel"
      aria-label="À la une"
      data-paused={paused}
      className={cn('group relative min-h-0 overflow-hidden bg-raised', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {stories.map((story, i) => (
        <Slide key={story.id} story={story} active={i === index} position={`${i + 1} / ${count}`} />
      ))}

      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 bg-club-rule" />

      <div
        className="absolute inset-x-0 bottom-0 z-10 flex gap-0.5"
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
            className="flex h-3 flex-1 items-end focus-visible:outline-offset-[-2px] short:h-2.5"
          >
            <span className="relative block h-[3px] w-full overflow-hidden bg-inverse/25">
              {i < index && <span className="absolute inset-0 bg-inverse/70" />}
              {i === index && (
                <span
                  key={`${index}-${story.id}`}
                  className="seg-fill absolute inset-0 bg-club-accent-dark"
                  onAnimationEnd={() => !reduceMotion && count > 1 && go(1)}
                />
              )}
            </span>
          </button>
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

function Slide({ story, active, position }: { story: NewsStory; active: boolean; position: string }) {
  const Icon = story.icon
  return (
    <article
      role="group"
      aria-roledescription="diapositive"
      aria-label={position}
      aria-hidden={!active}
      className={cn(
        'absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none',
        active ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      {story.image ? (
        <SafeImage
          src={story.image}
          alt=""
          className="absolute inset-0 size-full object-[50%_18%]"
          fallback={<StripedBackdrop icon={Icon} />}
        />
      ) : (
        <StripedBackdrop icon={Icon} />
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-overlay px-6 pb-5 pt-3.5 short:gap-0.5 short:px-3 short:pb-3.5 short:pt-2">
        <p className="caps text-[0.75rem] text-club-accent-dark short:text-[0.625rem]">
          <NumericText>{story.meta}</NumericText>
        </p>
        <h2 className="font-display text-[1.875rem] font-bold uppercase leading-[1.02] tracking-tight text-inverse text-balance short:text-[1.375rem]">
          <NumericText>{story.headline}</NumericText>
        </h2>
        <p className="line-clamp-2 max-w-[44rem] text-[0.9375rem] leading-snug text-inverse/80 text-pretty short:text-xs">
          <NumericText>{story.lead}</NumericText>
        </p>
      </div>
    </article>
  )
}

/** Flat club color with faint pitch-mowing stripes and a large ghost icon. */
function StripedBackdrop({ icon: Icon }: { icon: NewsStory['icon'] }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: 'var(--club-primary)',
        backgroundImage:
          'repeating-linear-gradient(90deg, rgb(255 255 255 / .06) 0 3.5rem, transparent 3.5rem 7rem)',
      }}
    >
      <Icon
        className="absolute -top-6 right-6 size-[17rem] text-club-on opacity-[0.14] short:-top-2 short:size-36"
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
        'absolute top-[38%] z-10 flex size-9 -translate-y-1/2 items-center justify-center bg-overlay text-inverse opacity-0 transition-[opacity,background-color] duration-150 hover:bg-club focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100 motion-reduce:transition-none short:size-7',
        side === 'left' ? 'left-3 short:left-1.5' : 'right-3 short:right-1.5',
      )}
    >
      <Icon className="size-5 short:size-4" aria-hidden />
    </button>
  )
}

```

## `components/numeric-text.tsx`

```tsx
import { Fragment } from 'react'

const NUMBER = /(\d+(?:[-:/.,]\d+)*)/g

/** Sets every number found in a string in JetBrains Mono, leaving the words in Archivo. */
export function NumericText({ children }: { children: string }) {
  const parts = children.split(NUMBER)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-mono text-[0.92em] tracking-normal">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
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
    <article className="sheet grid h-[min(34rem,100%)] w-[62rem] max-w-full grid-cols-[1.1fr_1fr] overflow-hidden short:h-full short:w-full short:grid-cols-[45fr_55fr]">
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
          className="caps absolute left-3 top-3 flex h-8 items-center gap-2 bg-overlay px-3 text-inverse transition-colors hover:bg-club hover:text-club-on short:left-[max(0.5rem,env(safe-area-inset-left))] short:top-[max(0.5rem,env(safe-area-inset-top))] short:h-8 short:px-2.5"
        >
          <ArrowLeft className="size-4 text-club-accent-dark" aria-hidden />
          <span className="short:sr-only">Retour</span>
        </Link>

        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-overlay px-4 py-2.5 short:py-1.5 short:pl-[max(0.75rem,env(safe-area-inset-left))]"
        >
          <p className="flex shrink-0 items-center gap-4 whitespace-nowrap font-mono text-sm font-semibold text-inverse short:gap-3 short:text-xs">
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
            className="caps border border-inverse/45 px-2.5 py-1.5 text-inverse transition-colors hover:bg-inverse/15 short:px-2 short:py-1 short:text-[0.625rem]"
          >
            {commentsHidden ? 'Afficher les commentaires' : 'Masquer les commentaires'}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-col short:pr-[max(0rem,env(safe-area-inset-right))]">
        <header className="flex items-center gap-3 px-5 pt-4 short:gap-2 short:px-3 short:pt-2">
          <Crest initials={club.initials} compact className="size-10 shrink-0 short:size-7" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 font-display text-lg font-bold uppercase leading-none tracking-tight text-ink short:text-[1rem]">
              <span className="truncate">{club.name}</span>
              <BadgeCheck className="size-4 shrink-0 text-club-ink" aria-label="Compte certifié" />
            </p>
            <p className="mt-1 font-mono text-xs text-ink-3 short:mt-0.5">{post.date}</p>
          </div>
          {controls}
        </header>

        <div className="flex flex-col items-start gap-2 px-5 pb-3 pt-3 short:gap-1 short:px-3 short:pb-2 short:pt-1.5">
          {post.isNew && (
            <span className="caps bg-club-2 px-2 py-0.5 text-club-on-2">
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
        className="flex size-8 shrink-0 items-center justify-center border border-line-strong bg-raised font-display text-xs font-bold uppercase text-ink-2 short:size-6 short:text-[0.625rem]"
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-2 text-[0.8125rem] short:text-xs">
          <span className="font-semibold text-ink">{comment.author}</span>
          <span className="font-mono text-ink-3">{comment.time}</span>
        </p>
        <p className="mt-0.5 text-[0.9375rem] leading-snug text-ink-2 text-pretty short:text-[0.8125rem]">
          {comment.text}
        </p>
        <p className="mt-1 flex items-center gap-1 font-mono text-xs text-ink-3 short:hidden">
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
        backgroundColor: 'var(--club-primary)',
        backgroundImage:
          'repeating-linear-gradient(90deg, rgb(255 255 255 / .06) 0 3.5rem, transparent 3.5rem 7rem)',
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
            <span className="min-w-9 text-center font-mono text-xs font-semibold text-ink-2" aria-live="polite">
              {index + 1} / {count}
            </span>
            <NavButton label="Publication suivante" onClick={() => setIndex((index + 1) % count)}>
              <ChevronRight className="size-4" aria-hidden />
            </NavButton>
          </div>
        }
      />

      <div className="flex items-center gap-5 bg-overlay px-5 py-2 short:hidden">
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
      className="flex size-8 items-center justify-center border border-line-strong text-ink-2 transition-colors hover:bg-raised hover:text-ink short:size-6"
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
            className="animate-in fade-in slide-in-from-bottom-2 border-l-4 border-club-rule bg-overlay px-5 py-2.5 text-[0.9375rem] font-medium text-inverse duration-150 short:px-4 short:py-1.5 short:text-sm"
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
export const BG_STORAGE_KEY = 'om-bg-anim'

export function getClub(id: string | null | undefined): Club {
  return CLUBS.find((c) => c.id === id) ?? CLUBS[0]
}

const SURFACE = { light: '#F5F3EF', dark: '#121417' }
const SCRIM = '#111418'
const INK_DARK = '#111418'

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
  // Rules and bars are fills, so they only need non-text contrast against the sheet.
  const rule = mode === 'light' ? club.primary : ensureContrast(club.primary, surface, 3, '#FFFFFF')

  return [
    `--club-rule:${rule}`,
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
  return `try{var d=document.documentElement,c=localStorage.getItem('${CLUB_STORAGE_KEY}'),t=localStorage.getItem('${THEME_STORAGE_KEY}');if(c&&${ids}.indexOf(c)>-1)d.setAttribute('data-club',c);if(t==='dark')d.classList.add('dark');if(localStorage.getItem('${BG_STORAGE_KEY}')==='off')d.setAttribute('data-bg','static')}catch(e){}`
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
  Dumbbell,
  FastForward,
  Goal,
  HeartPulse,
  Newspaper,
  Trophy,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'

export const IMAGES = {
  background: '/images/stadium-bg-vivid.jpg',
  backgroundBlurred: '/images/stadium-bg.png',
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
  { id: 'entrainement', label: 'Entraînement', icon: Dumbbell },
  { id: 'transferts', label: 'Transferts', icon: ArrowLeftRight, badge: 3 },
  { id: 'competition', label: 'Compétition', icon: Trophy },
  { id: 'medias', label: 'Médias', icon: Newspaper, badge: 5, href: '/medias/fil' },
  { id: 'carriere', label: 'Carrière coach', icon: UserRound },
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
  weekday: 'Dim.',
  date: '23/11',
  venue: 'Domicile',
  time: '21:00',
  title: 'El Clásico',
  opponent: TEAMS.barca,
}

export const ADVANCE_SUBLINE = 'J12 · DIM 23/11 · vs FC BARCELONE'

export const HINTS = [
  { keys: 'Espace', label: 'Avancer' },
  { keys: 'Entrée', label: 'Valider' },
  { keys: 'Échap', label: 'Retour' },
  { keys: '← →', label: 'Changer d’actu' },
  { keys: '1-9', label: 'Menu' },
  { keys: 'M', label: 'Messagerie' },
]

export type MessageCategory = 'direction' | 'staff' | 'transferts' | 'presse'

export interface Message {
  id: string
  sender: string
  category: MessageCategory
  subject: string
  /** Short stamp for lists: hour, weekday or date. */
  time: string
  /** Full stamp for the reading pane. */
  received: string
  unread?: boolean
  body: string[]
  actions: string[]
}

export const MESSAGES: Message[] = [
  {
    id: 'objectif',
    sender: 'Direction',
    category: 'direction',
    subject: 'Objectif de la saison : top 4',
    time: '09:12',
    received: 'Dim. 23/11 · 09:12',
    unread: true,
    body: [
      'Après onze journées, le conseil d’administration confirme son objectif pour la saison : une qualification pour la Ligue des champions, soit une place dans les quatre premiers de LaLiga.',
      'Le Real Madrid occupe actuellement la deuxième place avec 27 points, à deux longueurs du FC Barcelone. Le Clásico de dimanche sera un rendez-vous déterminant.',
      'Nous vous demandons de nous confirmer que cet objectif est compatible avec votre projet de jeu.',
    ],
    actions: ['Répondre'],
  },
  {
    id: 'pret-felix',
    sender: 'Agent · J. Félix',
    category: 'transferts',
    subject: 'Proposition de prêt jusqu’en juin',
    time: 'HIER',
    received: 'Sam. 22/11 · 18:40',
    unread: true,
    body: [
      'Bonjour coach, mon client souhaite plus de temps de jeu. Un club de milieu de tableau est prêt à l’accueillir en prêt jusqu’en juin, avec une option d’achat.',
      'Les conditions : salaire pris en charge à 80 %, clause de rappel en janvier. Je vous laisse examiner l’offre avant le week-end.',
    ],
    actions: ['Accepter', 'Refuser', 'Répondre'],
  },
  {
    id: 'rudiger',
    sender: 'Staff médical',
    category: 'staff',
    subject: 'Rüdiger incertain pour le Clásico',
    time: 'VEN',
    received: 'Ven. 21/11 · 17:05',
    unread: true,
    body: [
      'Rüdiger a ressenti une gêne à la cuisse en fin de séance. Les examens du jour ne révèlent pas de lésion, mais le risque de rechute est réel s’il enchaîne un match à haute intensité.',
      'Nous réévaluerons son état samedi matin. Dans le doute, nous recommandons de préparer une alternative en défense centrale.',
    ],
    actions: ['Répondre', 'Voir l’infirmerie'],
  },
  {
    id: 'scout',
    sender: 'Cellule de recrutement',
    category: 'transferts',
    subject: 'Rapport : milieu de terrain suivi au Portugal',
    time: 'JEU',
    received: 'Jeu. 20/11 · 11:30',
    body: [
      'Nos observateurs ont suivi le joueur lors de deux rencontres consécutives. Profil : milieu relayeur de 22 ans, excellent dans la récupération et la première relance.',
      'Le rapport complet est disponible. Il ressort une clause libératoire élevée mais négociable à la baisse en janvier.',
    ],
    actions: ['Ouvrir le rapport', 'Répondre'],
  },
  {
    id: 'sponsor',
    sender: 'Partenaire · Sponsor maillot',
    category: 'direction',
    subject: 'Renouvellement du contrat maillot',
    time: 'MER',
    received: 'Mer. 19/11 · 15:20',
    unread: true,
    body: [
      'Notre partenaire propose de renouveler le contrat de sponsoring maillot pour trois saisons, avec une hausse de 8 % du montant annuel.',
      'En contrepartie, il demande deux apparitions supplémentaires des joueurs lors d’événements commerciaux.',
    ],
    actions: ['Accepter', 'Refuser', 'Répondre'],
  },
  {
    id: 'academie',
    sender: 'Académie',
    category: 'staff',
    subject: 'Trois jeunes à intégrer à l’entraînement',
    time: 'MAR',
    received: 'Mar. 18/11 · 10:00',
    body: [
      'Trois joueurs de l’équipe réserve se sont distingués ces dernières semaines. Nous proposons de les intégrer aux séances de la semaine afin de les évaluer au contact du groupe professionnel.',
    ],
    actions: ['Accepter', 'Refuser'],
  },
  {
    id: 'presse',
    sender: 'Service presse',
    category: 'presse',
    subject: 'Demande d’interview avant le Clásico',
    time: 'LUN',
    received: 'Lun. 17/11 · 16:45',
    body: [
      'Une chaîne nationale souhaite réaliser une interview de dix minutes avec vous avant le Clásico. La diffusion serait prévue la veille du match.',
      'Nous vous conseillons d’accepter : cela permettrait de cadrer le discours avant la rencontre.',
    ],
    actions: ['Accepter', 'Refuser', 'Répondre'],
  },
  {
    id: 'temps-de-jeu',
    sender: 'Joueur · B. Díaz',
    category: 'staff',
    subject: 'Temps de jeu : je souhaite en parler',
    time: '15/11',
    received: 'Sam. 15/11 · 20:10',
    body: [
      'Coach, je n’ai pas été utilisé lors des trois derniers matchs et je ne comprends pas votre choix. Je voudrais en discuter avec vous cette semaine.',
      'Je reste motivé et à disposition du groupe, mais j’ai besoin de savoir quel rôle vous me réservez.',
    ],
    actions: ['Répondre'],
  },
]

export const MESSAGE_FILTERS = [
  { id: 'tous', label: 'Tous' },
  { id: 'non-lus', label: 'Non lus' },
  { id: 'direction', label: 'Direction' },
  { id: 'staff', label: 'Staff' },
  { id: 'transferts', label: 'Transferts' },
  { id: 'presse', label: 'Presse' },
] as const

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

