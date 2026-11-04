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
