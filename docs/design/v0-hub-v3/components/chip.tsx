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
