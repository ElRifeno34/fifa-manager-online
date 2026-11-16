
import { useCallback, useEffect, useRef, useState } from 'react'
import { FastForward } from 'lucide-react'
import { CalendarPanel } from '@/components/om/calendar-panel'
import { useClubTheme } from '@/components/om/club-theme-provider'
import { DataPanel, DataRows, DataTabs } from '@/components/om/data-panel'
import { KeyHintBar } from '@/components/om/key-hint'
import { MenuTile } from '@/components/om/menu-tile'
import { NewsCarousel } from '@/components/om/news-carousel'
import { SettingsSheet } from '@/components/om/settings-sheet'
import { useToast } from '@/components/om/toast-provider'
import { TopBar } from '@/components/om/top-bar'
import { InboxPanel } from '@/components/om/inbox-panel'
import { MENU, getClubNews, getNextMatch, SCORERS, STANDINGS } from '@/data/mock'

const TABS = [
  { id: 'classement', label: 'Classement', rows: STANDINGS },
  { id: 'buteurs', label: 'Buteurs', rows: SCORERS },
]

export function HomeHub() {
  const { club } = useClubTheme()
  const NEWS = getClubNews(club)
  const nextMatch = getNextMatch(club)
  const toast = useToast()
  const [storyIndex, setStoryIndex] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const tileRefs = useRef<(HTMLElement | null)[]>([])

  const closeSettings = useCallback(() => setSettingsOpen(false), [])

  const handleTile = (id: string) => {
    if (id === 'avancer') toast.show('Journée suivante…')
    else if (id !== 'medias') toast.show('Écran hors périmètre de ce prototype')
  }

  useEffect(() => {
    if (settingsOpen) return

    const isTyping = (el: EventTarget | null) =>
      el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return

      if (e.code === 'Space') {
        e.preventDefault()
        if (!e.repeat) toast.show('Journée suivante…')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setStoryIndex((i) => (i + 1) % NEWS.length)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setStoryIndex((i) => (i - 1 + NEWS.length) % NEWS.length)
      } else if (/^[1-9]$/.test(e.key)) {
        tileRefs.current[Number(e.key) - 1]?.focus()
      } else if (e.key === 'Enter' && document.activeElement === document.body) {
        toast.show('Validé')
      }
    }
    // Stops a focused button from also being "clicked" when Space is used as the advance shortcut.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTyping(e.target)) e.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [settingsOpen, toast])

  return (
    <main id="main-content" className="hub-layout mx-auto flex h-dvh w-full flex-col gap-4 overflow-hidden p-6 short:gap-2 short:p-2 short:pb-[max(0.5rem,env(safe-area-inset-bottom))] short:pl-[max(0.5rem,env(safe-area-inset-left))] short:pr-[max(0.5rem,env(safe-area-inset-right))] short:pt-[max(0.5rem,env(safe-area-inset-top))]">
      <a href="#main-content" className="skip-link">Aller au contenu</a>
      <TopBar club={club} budget="84,5 M€" onOpenSettings={() => setSettingsOpen(true)} />

      <div className="hub-grid grid min-h-0 flex-1 grid-cols-[20rem_minmax(0,1fr)_13.75rem] gap-4 short:gap-2">
        <div className="hub-left flex min-h-0 flex-col gap-4 short:gap-2">
        <div className="advance-block"><MenuTile label="Avancer" icon={FastForward} primary shortcut="1" subline={`J12 · ${nextMatch.date} · vs ${nextMatch.opponentName}`} onClick={() => handleTile('avancer')} ref={el => { tileRefs.current[0] = el }} /></div>
        <InboxPanel />
        <nav aria-label="Menu principal" className="menu-rows sheet flex shrink-0 flex-col">
          {MENU.slice(1).map((item, i) => (
            <MenuTile
              key={item.id}
              ref={(el) => {
                tileRefs.current[i + 1] = el
              }}
              label={item.label}
              icon={item.icon}
              badge={item.badge}
              primary={item.primary}
              href={item.href}
              shortcut={String(i + 2)}
              index={String(i + 2).padStart(2, '0')}
              onClick={() => handleTile(item.id)}
            />
          ))}
        </nav>
        </div>

        <div className="hub-center flex min-h-0 min-w-0 flex-col gap-4 short:gap-2">
          <NewsCarousel
            stories={NEWS}
            index={storyIndex}
            onIndexChange={setStoryIndex}
            className="min-h-0 flex-1"
          />

          <div className="grid grid-cols-2 gap-4 short:hidden">
            <DataPanel title="Classement · LaLiga · J11">
              <DataRows rows={STANDINGS} />
            </DataPanel>
             <DataPanel title="Buteurs · LaLiga">
              <DataRows rows={SCORERS} />
            </DataPanel>
          </div>
          <DataTabs tabs={TABS} className="hidden short:flex" />
        </div>

        <CalendarPanel />
      </div>

      <KeyHintBar />
      <SettingsSheet open={settingsOpen} onClose={closeSettings} />
    </main>
  )
}

