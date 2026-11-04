import { contrast, ensureContrast, firstReadable, mix } from './color'

export type ClubId =
  | 'real-madrid'
  | 'barcelone'
  | 'liverpool'
  | 'psg'
  | 'bayern'
  | 'online-manager'

export interface Club {
  id: ClubId
  name: string
  initials: string
  competition: string
  primary: string
  onPrimary: string
  secondary: string
  subtle: string
}

export const CLUBS: Club[] = [
  {
    id: 'real-madrid',
    name: 'Real Madrid',
    initials: 'RM',
    competition: 'LaLiga',
    primary: '#00529F',
    onPrimary: '#FFFFFF',
    secondary: '#FEBE10',
    subtle: '#E5EEF8',
  },
  {
    id: 'barcelone',
    name: 'FC Barcelone',
    initials: 'FCB',
    competition: 'LaLiga',
    primary: '#A50044',
    onPrimary: '#FFFFFF',
    secondary: '#004D98',
    subtle: '#F8E5EE',
  },
  {
    id: 'liverpool',
    name: 'Liverpool',
    initials: 'LFC',
    competition: 'Premier League',
    primary: '#C8102E',
    onPrimary: '#FFFFFF',
    secondary: '#00B2A9',
    subtle: '#FBE6E9',
  },
  {
    id: 'psg',
    name: 'Paris SG',
    initials: 'PSG',
    competition: 'Ligue 1',
    primary: '#004170',
    onPrimary: '#FFFFFF',
    secondary: '#DA291C',
    subtle: '#E3ECF3',
  },
  {
    id: 'bayern',
    name: 'Bayern',
    initials: 'FCB',
    competition: 'Bundesliga',
    primary: '#DC052D',
    onPrimary: '#FFFFFF',
    secondary: '#0066B2',
    subtle: '#FCE4E8',
  },
  {
    id: 'online-manager',
    name: 'Online Manager',
    initials: 'OM',
    competition: 'Online League',
    primary: '#0FA47A',
    onPrimary: '#FFFFFF',
    secondary: '#121A23',
    subtle: '#E3F7EF',
  },
]

export const DEFAULT_CLUB_ID: ClubId = 'real-madrid'
export const CLUB_STORAGE_KEY = 'om-club'
export const THEME_STORAGE_KEY = 'om-theme'

export function getClub(id: string | null | undefined): Club {
  return CLUBS.find((c) => c.id === id) ?? CLUBS[0]
}

const SURFACE = { light: '#FFFFFF', dark: '#111821' }
const SCRIM = '#0B1118'
const INK_DARK = '#121A23'

/**
 * The raw club colors are only used for fills. Text, rings and accents that sit
 * on a known background get a derived variant so they stay readable for every
 * palette (e.g. Online Manager's near-black secondary on a dark scrim).
 */
function clubVars(club: Club, mode: 'light' | 'dark') {
  const surface = SURFACE[mode]
  const ink = ensureContrast(club.primary, surface, 4.5, mode === 'light' ? '#000000' : '#FFFFFF')
  const accentOnDark = firstReadable([club.secondary, club.primary], SCRIM, 4.5, '')
  const accentDark =
    accentOnDark || ensureContrast(club.secondary, SCRIM, 4.5, '#FFFFFF')
  const accentOnPrimary = firstReadable([club.secondary], club.primary, 3, club.onPrimary)
  const onSecondary = contrast('#FFFFFF', club.secondary) >= contrast(INK_DARK, club.secondary) ? '#FFFFFF' : INK_DARK
  const subtle = mode === 'light' ? club.subtle : mix(club.primary, surface, 0.82)

  return [
    `--club-primary:${club.primary}`,
    `--club-on-primary:${club.onPrimary}`,
    `--club-secondary:${club.secondary}`,
    `--club-primary-subtle:${subtle}`,
    `--club-ink:${ink}`,
    `--club-accent-dark:${accentDark}`,
    `--club-accent-on-primary:${accentOnPrimary}`,
    `--club-on-secondary:${onSecondary}`,
  ].join(';')
}

/** Static CSS for every club in both themes, keyed on `html[data-club]`. */
export function buildClubThemeCss() {
  return CLUBS.map(
    (c) =>
      `html[data-club="${c.id}"]{${clubVars(c, 'light')}}html[data-club="${c.id}"].dark{${clubVars(c, 'dark')}}`,
  ).join('')
}

export function buildThemeBootScript() {
  const ids = JSON.stringify(CLUBS.map((c) => c.id))
  return `try{var d=document.documentElement,c=localStorage.getItem('${CLUB_STORAGE_KEY}'),t=localStorage.getItem('${THEME_STORAGE_KEY}');if(c&&${ids}.indexOf(c)>-1)d.setAttribute('data-club',c);if(t==='dark')d.classList.add('dark')}catch(e){}`
}
