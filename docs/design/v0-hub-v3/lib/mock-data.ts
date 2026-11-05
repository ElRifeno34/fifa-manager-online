import {
  ArrowLeftRight,
  Briefcase,
  ClipboardList,
  Dumbbell,
  FastForward,
  Goal,
  HeartPulse,
  Newspaper,
  Trophy,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'

export const IMAGES = {
  background: '/images/stadium-bg-vivid.jpg',
  backgroundBlurred: '/images/stadium-bg.png',
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
  { id: 'entrainement', label: 'Entraînement', icon: Dumbbell },
  { id: 'transferts', label: 'Transferts', icon: ArrowLeftRight, badge: 3 },
  { id: 'competition', label: 'Compétition', icon: Trophy },
  { id: 'medias', label: 'Médias', icon: Newspaper, badge: 5, href: '/medias/fil' },
  { id: 'carriere', label: 'Carrière coach', icon: UserRound },
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
  weekday: 'Dim.',
  date: '23/11',
  venue: 'Domicile',
  time: '21:00',
  title: 'El Clásico',
  opponent: TEAMS.barca,
}

export const ADVANCE_SUBLINE = 'J12 · DIM 23/11 · vs FC BARCELONE'

export const HINTS = [
  { keys: 'Espace', label: 'Avancer' },
  { keys: 'Entrée', label: 'Valider' },
  { keys: 'Échap', label: 'Retour' },
  { keys: '← →', label: 'Changer d’actu' },
  { keys: '1-9', label: 'Menu' },
  { keys: 'M', label: 'Messagerie' },
]

export type MessageCategory = 'direction' | 'staff' | 'transferts' | 'presse'

export interface Message {
  id: string
  sender: string
  category: MessageCategory
  subject: string
  /** Short stamp for lists: hour, weekday or date. */
  time: string
  /** Full stamp for the reading pane. */
  received: string
  unread?: boolean
  body: string[]
  actions: string[]
}

export const MESSAGES: Message[] = [
  {
    id: 'objectif',
    sender: 'Direction',
    category: 'direction',
    subject: 'Objectif de la saison : top 4',
    time: '09:12',
    received: 'Dim. 23/11 · 09:12',
    unread: true,
    body: [
      'Après onze journées, le conseil d’administration confirme son objectif pour la saison : une qualification pour la Ligue des champions, soit une place dans les quatre premiers de LaLiga.',
      'Le Real Madrid occupe actuellement la deuxième place avec 27 points, à deux longueurs du FC Barcelone. Le Clásico de dimanche sera un rendez-vous déterminant.',
      'Nous vous demandons de nous confirmer que cet objectif est compatible avec votre projet de jeu.',
    ],
    actions: ['Répondre'],
  },
  {
    id: 'pret-felix',
    sender: 'Agent · J. Félix',
    category: 'transferts',
    subject: 'Proposition de prêt jusqu’en juin',
    time: 'HIER',
    received: 'Sam. 22/11 · 18:40',
    unread: true,
    body: [
      'Bonjour coach, mon client souhaite plus de temps de jeu. Un club de milieu de tableau est prêt à l’accueillir en prêt jusqu’en juin, avec une option d’achat.',
      'Les conditions : salaire pris en charge à 80 %, clause de rappel en janvier. Je vous laisse examiner l’offre avant le week-end.',
    ],
    actions: ['Accepter', 'Refuser', 'Répondre'],
  },
  {
    id: 'rudiger',
    sender: 'Staff médical',
    category: 'staff',
    subject: 'Rüdiger incertain pour le Clásico',
    time: 'VEN',
    received: 'Ven. 21/11 · 17:05',
    unread: true,
    body: [
      'Rüdiger a ressenti une gêne à la cuisse en fin de séance. Les examens du jour ne révèlent pas de lésion, mais le risque de rechute est réel s’il enchaîne un match à haute intensité.',
      'Nous réévaluerons son état samedi matin. Dans le doute, nous recommandons de préparer une alternative en défense centrale.',
    ],
    actions: ['Répondre', 'Voir l’infirmerie'],
  },
  {
    id: 'scout',
    sender: 'Cellule de recrutement',
    category: 'transferts',
    subject: 'Rapport : milieu de terrain suivi au Portugal',
    time: 'JEU',
    received: 'Jeu. 20/11 · 11:30',
    body: [
      'Nos observateurs ont suivi le joueur lors de deux rencontres consécutives. Profil : milieu relayeur de 22 ans, excellent dans la récupération et la première relance.',
      'Le rapport complet est disponible. Il ressort une clause libératoire élevée mais négociable à la baisse en janvier.',
    ],
    actions: ['Ouvrir le rapport', 'Répondre'],
  },
  {
    id: 'sponsor',
    sender: 'Partenaire · Sponsor maillot',
    category: 'direction',
    subject: 'Renouvellement du contrat maillot',
    time: 'MER',
    received: 'Mer. 19/11 · 15:20',
    unread: true,
    body: [
      'Notre partenaire propose de renouveler le contrat de sponsoring maillot pour trois saisons, avec une hausse de 8 % du montant annuel.',
      'En contrepartie, il demande deux apparitions supplémentaires des joueurs lors d’événements commerciaux.',
    ],
    actions: ['Accepter', 'Refuser', 'Répondre'],
  },
  {
    id: 'academie',
    sender: 'Académie',
    category: 'staff',
    subject: 'Trois jeunes à intégrer à l’entraînement',
    time: 'MAR',
    received: 'Mar. 18/11 · 10:00',
    body: [
      'Trois joueurs de l’équipe réserve se sont distingués ces dernières semaines. Nous proposons de les intégrer aux séances de la semaine afin de les évaluer au contact du groupe professionnel.',
    ],
    actions: ['Accepter', 'Refuser'],
  },
  {
    id: 'presse',
    sender: 'Service presse',
    category: 'presse',
    subject: 'Demande d’interview avant le Clásico',
    time: 'LUN',
    received: 'Lun. 17/11 · 16:45',
    body: [
      'Une chaîne nationale souhaite réaliser une interview de dix minutes avec vous avant le Clásico. La diffusion serait prévue la veille du match.',
      'Nous vous conseillons d’accepter : cela permettrait de cadrer le discours avant la rencontre.',
    ],
    actions: ['Accepter', 'Refuser', 'Répondre'],
  },
  {
    id: 'temps-de-jeu',
    sender: 'Joueur · B. Díaz',
    category: 'staff',
    subject: 'Temps de jeu : je souhaite en parler',
    time: '15/11',
    received: 'Sam. 15/11 · 20:10',
    body: [
      'Coach, je n’ai pas été utilisé lors des trois derniers matchs et je ne comprends pas votre choix. Je voudrais en discuter avec vous cette semaine.',
      'Je reste motivé et à disposition du groupe, mais j’ai besoin de savoir quel rôle vous me réservez.',
    ],
    actions: ['Répondre'],
  },
]

export const MESSAGE_FILTERS = [
  { id: 'tous', label: 'Tous' },
  { id: 'non-lus', label: 'Non lus' },
  { id: 'direction', label: 'Direction' },
  { id: 'staff', label: 'Staff' },
  { id: 'transferts', label: 'Transferts' },
  { id: 'presse', label: 'Presse' },
] as const

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
