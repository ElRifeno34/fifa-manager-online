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
