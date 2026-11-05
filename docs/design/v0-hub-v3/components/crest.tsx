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
