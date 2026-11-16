import { Button } from '@/components/om/button'
import { Link } from '@tanstack/react-router'
import type { Ref } from 'react'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuTileProps {
  label: string
  icon: LucideIcon
  badge?: number | undefined
  /** Main call to action: solid club-colored block. Every other entry is a compact row. */
  primary?: boolean | undefined
  /** Mono line under the primary label, e.g. the next fixture. */
  subline?: string
  /** Two-digit mono index shown on rows (matches the keyboard digit). */
  index?: string
  href?: '/medias/fil' | undefined
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
      : 'menu-row h-[2.375rem] shrink-0 items-center gap-2 border-b border-line px-4 last:border-b-0 hover:bg-raised/80 focus-visible:bg-raised/80 focus-visible:outline-offset-[-2px] active:bg-raised short:h-auto short:min-h-0 short:flex-1 short:gap-1.5 short:px-2',
  )

  const content = primary ? (
    <>
      <span className="flex w-full items-center justify-between gap-2">
        <span className="font-display text-[1.375rem] font-bold uppercase leading-none tracking-normal short:text-[0.9375rem]">
          {label}
        </span>
        <ArrowRight className="size-7 shrink-0 short:size-4" strokeWidth={1.5} aria-hidden />
      </span>
      {subline && (
        <span className="block w-full truncate font-mono text-[0.6875rem] font-medium uppercase tracking-normal opacity-90 short:hidden">
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
        className="w-5 shrink-0 font-mono text-[0.6875rem] font-medium text-ink-3 transition-colors duration-150 group-hover:text-club-ink group-focus-visible:text-club-ink short:w-4 short:text-[0.6875rem]"
      >
        {index}
      </span>
      <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-semibold leading-tight text-ink-2 transition-colors duration-150 group-hover:text-ink group-focus-visible:text-ink short:text-[0.6875rem]">
        {label}
      </span>
      {badge ? <Badge count={badge} /> : null}
      <Icon className="size-4 shrink-0 text-ink-3 short:size-3.5" strokeWidth={1.5} aria-hidden />
    </>
  )

  const shortcutProps = shortcut ? { 'aria-keyshortcuts': shortcut } : {}

  if (href) {
    return (
      <Link to={href} ref={ref as Ref<HTMLAnchorElement>} className={className} onClick={onClick} {...shortcutProps}>
        {content}
      </Link>
    )
  }
  return (
    <Button type="button" ref={ref as Ref<HTMLButtonElement>} className={className} onClick={onClick} {...shortcutProps}>
      {content}
    </Button>
  )
}

function Badge({ count }: { count: number }) {
  return (
    <span
      className="flex h-[1.125rem] min-w-[1.125rem] shrink-0 items-center justify-center bg-raised px-1 font-mono text-[0.6875rem] font-bold leading-none text-ink short:h-3.5 short:min-w-3.5 short:px-0.5 short:text-[0.6875rem]"
      aria-label={`${count} notification${count > 1 ? 's' : ''}`}
    >
      {count}
    </span>
  )
}
