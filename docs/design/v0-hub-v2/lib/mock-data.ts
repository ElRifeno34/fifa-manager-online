import {
  ArrowLeftRight,
  Briefcase,
  ClipboardList,
  FastForward,
  Goal,
  HeartPulse,
  Newspaper,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react'

export const IMAGES = {
  background: '/images/stadium-bg.png',
  backgroundRemote:
    'https://www.figma.com/api/mcp/asset/ce022aaf-111e-457e-994e-145a22df2861.png',
  press: '/images/press-conference.png',
  pressRemote: 'https://www.figma.com/api/mcp/asset/187c390e-c303-48fb-955e-e9860d37a057.png',
}

export interface MenuItem {
  id: string
  label: string
  icon: LucideIcon
  badge?: number
  primary?: boolean
  href?: string
}

export const MENU: MenuItem[] = [
  { id: 'avancer', label: 'Avancer', icon: FastForward, primary: true },
  { id: 'effectif', label: 'Effectif', icon: Users, badge: 2 },
  { id: 'tactique', label: 'Tactique', icon: ClipboardList },
  { id: 'competition', label: 'Compétition', icon: Trophy },
  { id: 'medias', label: 'Médias', icon: Newspaper, badge: 5, href: '/medias/fil' },
  { id: 'bureau', label: 'Bureau du manager', icon: Briefcase },
]

export interface NewsStory {
  id: string
  meta: string
  headline: string
  lead: string
  image?: string
  icon: LucideIcon
}

export const NEWS: NewsStory[] = [
  {
    id: 'classico',
    meta: 'MARCA · CONFÉRENCE DE PRESSE · IL Y A 2 H',
    headline: 'Le Clásico se prépare dès ce soir',
    lead: 'Après la victoire 2-0 contre Valence, l’entraîneur madrilène appelle au calme avant de recevoir le Barça dimanche.',
    image: IMAGES.press,
    icon: Newspaper,
  },
  {
    id: 'resume',
    meta: 'LALIGA · RÉSUMÉ · HIER',
    headline: 'Valence 0-2 Real Madrid : le résumé',
    lead: 'Deux buts en seconde période suffisent au Real pour s’installer à la deuxième place, à deux longueurs du leader.',
    icon: Goal,
  },
  {
    id: 'mercato',
    meta: 'L’ÉQUIPE · MERCATO · IL Y A 5 H',
    headline: 'Mercato : le club suit un milieu de terrain',
    lead: 'La cellule de recrutement a envoyé plusieurs observateurs pour suivre le joueur lors des deux prochaines rencontres.',
    icon: ArrowLeftRight,
  },
]

export interface Team {
  initials: string
  primary: string
  secondary: string
}

export const TEAMS = {
  barca: { initials: 'FCB', primary: '#A50044', secondary: '#004D98' },
  madrid: { initials: 'RM', primary: '#00529F', secondary: '#FEBE10' },
  atletico: { initials: 'ATM', primary: '#CB3524', secondary: '#272E61' },
  villarreal: { initials: 'VIL', primary: '#F2C500', secondary: '#005187' },
  athletic: { initials: 'ATH', primary: '#EE2523', secondary: '#121A23' },
  osasuna: { initials: 'OSA', primary: '#D91A21', secondary: '#0A346F' },
  inter: { initials: 'INT', primary: '#0068A8', secondary: '#121A23' },
  sevilla: { initials: 'SEV', primary: '#D4001F', secondary: '#FFFFFF' },
} satisfies Record<string, Team>

export interface StandingRow {
  pos: number
  name: string
  value: number
  color: string
  highlight?: boolean
}

export const STANDINGS: StandingRow[] = [
  { pos: 1, name: 'FC Barcelone', value: 29, color: TEAMS.barca.primary },
  { pos: 2, name: 'Real Madrid', value: 27, color: TEAMS.madrid.primary, highlight: true },
  { pos: 3, name: 'Atlético de Madrid', value: 24, color: TEAMS.atletico.primary },
  { pos: 4, name: 'Villarreal', value: 21, color: TEAMS.villarreal.primary },
  { pos: 5, name: 'Athletic Club', value: 20, color: TEAMS.athletic.primary },
]

export const SCORERS: StandingRow[] = [
  { pos: 1, name: 'K. Mbappé', value: 11, color: TEAMS.madrid.primary, highlight: true },
  { pos: 2, name: 'R. Lewandowski', value: 9, color: TEAMS.barca.primary },
  { pos: 3, name: 'J. Álvarez', value: 7, color: TEAMS.atletico.primary },
  { pos: 4, name: 'A. Budimir', value: 6, color: TEAMS.osasuna.primary },
  { pos: 5, name: 'Vinícius Jr', value: 6, color: TEAMS.madrid.primary, highlight: true },
]

export interface CalendarEntry {
  day: number
  weekday: string
  today?: boolean
  match?: {
    venue: 'DOM.' | 'EXT.'
    opponent: Team
    opponentName: string
    competition?: string
  }
}

export const CALENDAR: CalendarEntry[] = [
  {
    day: 23,
    weekday: 'Dim.',
    today: true,
    match: { venue: 'DOM.', opponent: TEAMS.barca, opponentName: 'FC Barcelone' },
  },
  { day: 24, weekday: 'Lun.' },
  { day: 25, weekday: 'Mar.' },
  {
    day: 26,
    weekday: 'Mer.',
    match: {
      venue: 'EXT.',
      opponent: TEAMS.inter,
      opponentName: 'Inter',
      competition: 'Champions League',
    },
  },
  { day: 27, weekday: 'Jeu.' },
  { day: 28, weekday: 'Ven.' },
  { day: 29, weekday: 'Sam.' },
  {
    day: 30,
    weekday: 'Dim.',
    match: { venue: 'EXT.', opponent: TEAMS.sevilla, opponentName: 'Séville FC' },
  },
]

export const NEXT_MATCH = {
  date: 'Dim. 23 nov.',
  venue: 'Domicile · 21:00',
  title: 'El Clásico',
  opponent: TEAMS.barca,
}

export const HINTS = [
  { keys: 'Espace', label: 'Avancer' },
  { keys: 'Entrée', label: 'Valider' },
  { keys: 'Échap', label: 'Retour' },
  { keys: '← →', label: 'Changer d’actu' },
  { keys: '1-6', label: 'Menu' },
]

export interface Comment {
  id: string
  author: string
  text: string
  time: string
  likes: number
}

export interface Post {
  id: string
  date: string
  text: string
  image?: string
  icon: LucideIcon
  likes: string
  commentCount: string
  isNew?: boolean
  comments: Comment[]
}

export const POSTS: Post[] = [
  {
    id: 'entrainement',
    date: '23/11',
    text: 'Le groupe a repris l’entraînement avant le Clásico 💪',
    image: IMAGES.press,
    icon: Newspaper,
    likes: '12,4 k',
    commentCount: '842',
    isNew: true,
    comments: [
      { id: 'c1', author: 'Camille R.', text: 'Enfin ! Hâte d’être à dimanche, on va les écraser 🔥', time: '12 min', likes: 214 },
      { id: 'c2', author: 'Sofia B.', text: 'Pourvu qu’il n’y ait pas de blessé avant le Clásico… j’ai tellement peur.', time: '18 min', likes: 96 },
      { id: 'c3', author: 'Karim D.', text: 'Tout ça pour que je rate le match parce que ma belle-mère vient dîner 😭', time: '26 min', likes: 388 },
      { id: 'c4', author: 'Julien M.', text: 'Ça sent le 3-0, je le sens dans mes genoux.', time: '31 min', likes: 57 },
      { id: 'c5', author: 'Léa P.', text: 'Allez les Merengues !!! Hala Madrid 🤍', time: '45 min', likes: 143 },
      { id: 'c6', author: 'Thomas L.', text: 'Si on aligne la même équipe que contre Valence, on ne change pas une équipe qui gagne.', time: '1 h', likes: 72 },
      { id: 'c7', author: 'Nadia K.', text: 'Mon chat porte le maillot, il valide la préparation 🐱', time: '1 h', likes: 301 },
    ],
  },
  {
    id: 'stade',
    date: '22/11',
    text: 'Pelouse impeccable, tribunes en préparation. Rendez-vous dimanche à 21h pour recevoir le Barça 🏟️',
    image: IMAGES.background,
    icon: Newspaper,
    likes: '8,9 k',
    commentCount: '416',
    isNew: true,
    comments: [
      { id: 'd1', author: 'Hugo V.', text: 'Cette pelouse, on dirait un tapis de billard. Les joueurs vont se régaler.', time: '2 h', likes: 88 },
      { id: 'd2', author: 'Inès A.', text: 'J’ai mes places, j’ai déjà pris ma journée. Le patron ne sait pas encore 🤫', time: '2 h', likes: 176 },
      { id: 'd3', author: 'Marc T.', text: 'Un peu inquiet pour la défense centrale, honnêtement…', time: '3 h', likes: 41 },
      { id: 'd4', author: 'Élodie S.', text: 'Quelqu’un a une place en trop ? Je promets d’être raisonnable 😅', time: '3 h', likes: 129 },
      { id: 'd5', author: 'Paul G.', text: 'L’ambiance va être folle, je suis déjà enroué rien que d’y penser.', time: '4 h', likes: 64 },
    ],
  },
  {
    id: 'infirmerie',
    date: '21/11',
    text: 'Point médical : deux joueurs suivis de près, la décision sera prise samedi.',
    icon: HeartPulse,
    likes: '5,2 k',
    commentCount: '1,1 k',
    comments: [
      { id: 'e1', author: 'Romain F.', text: 'Dites-moi que le groupe sera au complet, s’il vous plaît 🙏', time: '5 h', likes: 233 },
      { id: 'e2', author: 'Chloé D.', text: 'Le staff médical est au top cette saison, faisons-leur confiance.', time: '5 h', likes: 118 },
      { id: 'e3', author: 'Yanis B.', text: 'Moi à chaque communiqué médical : *respire dans un sac en papier*', time: '6 h', likes: 412 },
      { id: 'e4', author: 'Anaïs C.', text: 'On a un banc solide, ça ira. Courage à eux !', time: '7 h', likes: 54 },
      { id: 'e5', author: 'Victor N.', text: 'Rien de grave j’espère. Un Clásico sans nos meilleurs, ce serait cruel.', time: '8 h', likes: 80 },
    ],
  },
]
