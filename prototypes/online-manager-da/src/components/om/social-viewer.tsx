import { Button } from '@/components/om/button'

import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useClubTheme } from '@/components/om/club-theme-provider'
import { KeyHint } from '@/components/om/key-hint'
import { SocialPost } from '@/components/om/social-post'
import { getClubPosts } from '@/data/mock'

export function SocialViewer() {
  const navigate = useNavigate()
  const { club } = useClubTheme()
  const [index, setIndex] = useState(0)
  const [commentsHidden, setCommentsHidden] = useState(false)
  const posts = getClubPosts(club)
  const count = posts.length

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector('[data-state="open"][role="dialog"]') || (e.target instanceof HTMLElement && e.target.closest('input,textarea,button,a'))) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setIndex((i) => (i + 1) % count)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setIndex((i) => (i - 1 + count) % count)
      } else if (e.key === 'Escape') {
        navigate({ to: '/' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [count, navigate])

  const post = posts[index]
  if (!post) return <main className="p-8 text-ink">Aucune publication pour le moment.</main>

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-3 p-6 short:p-0">
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
            <span className="min-w-9 text-center font-mono text-[0.6875rem] font-semibold text-ink-2" aria-live="polite">
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
    </div>
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
    <Button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center border border-line-strong text-ink-2 transition-colors hover:bg-raised hover:text-ink short:size-6"
    >
      {children}
    </Button>
  )
}
