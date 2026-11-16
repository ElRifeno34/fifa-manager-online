import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ClubThemeProvider, useClubTheme } from '@/components/om/club-theme-provider'
import { AppBackground } from '@/components/om/app-background'
import { MENU } from '@/data/mock'
import { CLUBS } from '@/lib/clubs'

afterEach(cleanup)
beforeEach(() => { localStorage.clear(); document.documentElement.classList.remove('dark'); document.documentElement.setAttribute('data-club', 'real-madrid') })

describe('Owner presentation requirements', () => {
  it('keeps exactly nine menu destinations in the requested order', () => {
    expect(MENU.map(item => item.id)).toEqual(['avancer', 'effectif', 'tactique', 'entrainement', 'transferts', 'competition', 'medias', 'carriere', 'bureau'])
  })
  it('gives transfers three notifications', () => { expect(MENU.find(item => item.id === 'transferts')?.badge).toBe(3) })
  it('keeps six available club palettes', () => { expect(CLUBS.length).toBe(6) })
  it('persists and restores the animated background preference', () => {
    let current: ReturnType<typeof useClubTheme> | undefined
    function Probe() { current = useClubTheme(); return null }
    const view = render(<ClubThemeProvider><Probe /></ClubThemeProvider>)
    act(() => current?.setAnimatedBackground(false))
    expect(localStorage.getItem('om-animated-background')).toBe('off')
    view.unmount()
    render(<ClubThemeProvider><Probe /></ClubThemeProvider>)
    expect(current?.animatedBackground).toBe(false)
  })
  it('pauses stadium layers when the tab is hidden', () => {
    const view = render(<ClubThemeProvider><AppBackground /></ClubThemeProvider>)
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(view.container.querySelector('.stadium-background')?.getAttribute('data-paused')).toBe('true')
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  })
})