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
