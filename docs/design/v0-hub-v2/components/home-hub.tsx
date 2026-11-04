'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CalendarPanel } from '@/components/calendar-panel'
import { useClubTheme } from '@/components/club-theme-provider'
import { DataPanel, DataRows, DataTabs } from '@/components/data-panel'
import { KeyHintBar } from '@/components/key-hint'
import { MenuTile } from '@/components/menu-tile'
import { NewsCarousel } from '@/components/news-carousel'
import { SettingsSheet } from '@/components/settings-sheet'
import { useToast } from '@/components/toast-provider'
import { TopBar } from '@/components/top-bar'
import { MENU, NEWS, SCORERS, STANDINGS } from '@/lib/mock-data'

const TABS = [
  { id: 'classement', label: 'Classement', rows: STANDINGS },
  { id: 'buteurs', label: 'Buteurs', rows: SCORERS },
]

export function HomeHub() {
  const { club } = useClubTheme()
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
      } else if (/^[1-6]$/.test(e.key)) {
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
    <main className="mx-auto flex h-dvh w-full flex-col gap-3.5 overflow-hidden p-6 short:gap-1.5 short:p-2 short:pb-[max(0.5rem,env(safe-area-inset-bottom))] short:pl-[max(0.5rem,env(safe-area-inset-left))] short:pr-[max(0.5rem,env(safe-area-inset-right))] short:pt-[max(0.5rem,env(safe-area-inset-top))]">
      <TopBar club={club} budget="84,5 M€" onOpenSettings={() => setSettingsOpen(true)} />

      <div className="grid min-h-0 flex-1 grid-cols-[14.5rem_minmax(0,1fr)_13.75rem] gap-4 short:grid-cols-[10.5rem_minmax(0,1fr)_9.375rem] short:gap-2 short:max-[720px]:grid-cols-[10.5rem_minmax(0,1fr)_8.5rem]">
        <nav aria-label="Menu principal" className="flex min-h-0 flex-col gap-2.5 short:gap-1">
          {MENU.map((item, i) => (
            <MenuTile
              key={item.id}
              ref={(el) => {
                tileRefs.current[i] = el
              }}
              label={item.label}
              icon={item.icon}
              badge={item.badge}
              primary={item.primary}
              href={item.href}
              shortcut={String(i + 1)}
              onClick={() => handleTile(item.id)}
            />
          ))}
        </nav>

        <div className="flex min-h-0 min-w-0 flex-col gap-3 short:gap-1.5">
          <NewsCarousel
            stories={NEWS}
            index={storyIndex}
            onIndexChange={setStoryIndex}
            className="min-h-0 flex-1"
          />

          <div className="grid grid-cols-2 gap-3 short:hidden">
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
