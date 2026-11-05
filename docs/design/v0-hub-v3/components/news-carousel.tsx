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
