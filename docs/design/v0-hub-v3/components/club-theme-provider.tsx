'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  BG_STORAGE_KEY,
  CLUB_STORAGE_KEY,
  DEFAULT_CLUB_ID,
  THEME_STORAGE_KEY,
  getClub,
  type Club,
  type ClubId,
} from '@/lib/clubs'

type Theme = 'light' | 'dark'

interface ClubThemeContextValue {
  club: Club
  theme: Theme
  setClub: (id: ClubId) => void
  setTheme: (theme: Theme) => void
  animatedBg: boolean
  setAnimatedBg: (on: boolean) => void
}

const ClubThemeContext = createContext<ClubThemeContextValue | null>(null)

/**
 * Owns the club palette + light/dark theme. The CSS variables themselves are
 * emitted statically (see `buildClubThemeCss`); this provider only flips
 * `data-club` / `.dark` on <html>, persists the choice and animates the change.
 */
export function ClubThemeProvider({ children }: { children: ReactNode }) {
  const [clubId, setClubId] = useState<ClubId>(DEFAULT_CLUB_ID)
  const [theme, setThemeState] = useState<Theme>('light')
  const [animatedBg, setAnimatedBgState] = useState(true)
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const root = document.documentElement
    setAnimatedBgState(root.getAttribute('data-bg') !== 'static')
    setClubId(getClub(root.getAttribute('data-club')).id)
    setThemeState(root.classList.contains('dark') ? 'dark' : 'light')
  }, [])

  const animate = useCallback(() => {
    const root = document.documentElement
    root.classList.add('theme-anim')
    if (animTimer.current) clearTimeout(animTimer.current)
    animTimer.current = setTimeout(() => root.classList.remove('theme-anim'), 280)
  }, [])

  const setClub = useCallback(
    (id: ClubId) => {
      animate()
      document.documentElement.setAttribute('data-club', id)
      setClubId(id)
      try {
        localStorage.setItem(CLUB_STORAGE_KEY, id)
      } catch {}
    },
    [animate],
  )

  const setTheme = useCallback(
    (next: Theme) => {
      animate()
      document.documentElement.classList.toggle('dark', next === 'dark')
      setThemeState(next)
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch {}
    },
    [animate],
  )

  const setAnimatedBg = useCallback((on: boolean) => {
    const root = document.documentElement
    if (on) root.removeAttribute('data-bg')
    else root.setAttribute('data-bg', 'static')
    setAnimatedBgState(on)
    try {
      localStorage.setItem(BG_STORAGE_KEY, on ? 'on' : 'off')
    } catch {}
  }, [])

  const value = useMemo(
    () => ({ club: getClub(clubId), theme, setClub, setTheme, animatedBg, setAnimatedBg }),
    [clubId, theme, setClub, setTheme, animatedBg, setAnimatedBg],
  )

  return <ClubThemeContext.Provider value={value}>{children}</ClubThemeContext.Provider>
}

export function useClubTheme() {
  const ctx = useContext(ClubThemeContext)
  if (!ctx) throw new Error('useClubTheme must be used inside ClubThemeProvider')
  return ctx
}
