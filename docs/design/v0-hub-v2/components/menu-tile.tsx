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
