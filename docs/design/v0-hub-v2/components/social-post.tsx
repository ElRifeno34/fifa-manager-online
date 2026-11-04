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
