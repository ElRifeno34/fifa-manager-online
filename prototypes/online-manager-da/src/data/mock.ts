import stadium from '../../public/images/stadium-bg-vivid.jpg.asset.json'
import blurred from '../../public/images/stadium-bg.png.asset.json'
import press from '../../public/images/press-conference.png.asset.json'
import type { Club } from '@/lib/clubs'
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
  background: stadium.url,
  backgroundBlurred: blurred.url,
  backgroundRemote:
    'https://www.figma.com/api/mcp/asset/ce022aaf-111e-457e-994e-145a22df2861.png',
  press: press.url,
  pressRemote: 'https://www.figma.com/api/mcp/asset/187c390e-c303-48fb-955e-e9860d37a057.png',
}

export interface MenuItem {
  id: string
  label: string
  icon: LucideIcon
  badge?: number
  primary?: boolean
  href?: '/medias/fil'
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
      competition: 'Ligue des champions',
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
    time: 'Hier',
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
    time: 'Ven.',
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
    time: 'Jeu.',
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
    time: 'Mer.',
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
    time: 'Mar.',
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
    time: 'Lun.',
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

export const READINESS_WARNINGS = ['2 titulaires fatigués', 'Compo non validée']
export function getNextMatch(club: Club) {
 const rivals: Record<string, {name:string;team:Team}> = {
  'real-madrid': {name:'FC Barcelone',team:TEAMS.barca}, barcelone:{name:'Real Madrid',team:TEAMS.madrid},
  liverpool:{name:'Everton',team:{initials:'EVE',primary:'#003399',secondary:'#FFFFFF'}},
  psg:{name:'Marseille',team:{initials:'OM',primary:'#009DCE',secondary:'#FFFFFF'}},
  bayern:{name:'Dortmund',team:{initials:'BVB',primary:'#FDE100',secondary:'#111418'}},
  'online-manager':{name:'Athletic Club',team:TEAMS.athletic}
 }
 const rival=rivals[club.id] ?? rivals['real-madrid']
 if (!rival) throw new Error('Adversaire manquant')
 return {...NEXT_MATCH, opponent:rival.team, opponentName:rival.name, title:['real-madrid','barcelone'].includes(club.id)?'El Clásico':'Match de championnat', competition:club.competition}
}
export function getClubCalendar(club:Club) { const match=getNextMatch(club); return CALENDAR.map((entry,i)=> i===0? {...entry,match:{venue:'DOM.' as const,opponent:match.opponent,opponentName:match.opponentName}}:entry) }
export function getClubNews(club:Club) { const next=getNextMatch(club);return NEWS.map((n,i)=>i===0? {...n,headline:next.title==='El Clásico'?n.headline:'Le prochain rendez-vous se prépare',lead:`${club.name} prépare la réception de ${next.opponentName}, dimanche à ${next.time}. Le groupe reste concentré sur ce rendez-vous.`}:i===1?{...n,headline:`${club.name} : retour sur la dernière victoire`,lead:'Le groupe poursuit sa préparation avant la prochaine journée de championnat.'}:n) }
export function getClubPosts(club:Club) { const next=getNextMatch(club);return POSTS.map((p,i)=>({...p,text:i===0?`Le groupe a repris l’entraînement avant ${next.title==='El Clásico'?'le Clásico':'le prochain match'} 💪`:i===1?`Pelouse impeccable. Dimanche à 21 h, nous recevons ${next.opponentName} 🏟️`:p.text,comments:p.comments.map(c=>({...c,text:c.text.replace('les Merengues !!! Hala Madrid 🤍',club.name+' !').replace(/le Clásico/g,next.title==='El Clásico'?'le Clásico':'le prochain match')}))})) }
export function getClubMessages(club:Club) {const next=getNextMatch(club);return MESSAGES.map(m=>({...m,subject:m.subject.replace(/le Clásico/g,next.title==='El Clásico'?'le Clásico':'le prochain match'),body:m.body.map(p=>p.replace('Le Real Madrid occupe actuellement la deuxième place avec 27 points, à deux longueurs du FC Barcelone. Le Clásico de dimanche sera un rendez-vous déterminant.',`${club.name} prépare la réception de ${next.opponentName}. Le prochain match sera un rendez-vous déterminant.`).replace(/de LaLiga/g,`de ${club.competition}`).replace(/le Clásico/g,next.title==='El Clásico'?'le Clásico':'le prochain match'))}))}

// Career V1: fictional 2026–27 data, never persisted or used as a game engine.
export type Nationality = 'FR' | 'ES' | 'BR' | 'DE' | 'PT' | 'MA' | 'BE'
export interface CareerPlayer {
 id: string; name: string; age: number; position: string; nation: Nationality;
 status: string; mood: string; form: number; fatigue: number; minutes: number;
 contract: string; salary: number; value: number; rating: number; number: number;
}
const PLAYER_SEEDS: [string, number, string, Nationality][] = [
 ['Adrien Morel',27,'GB','FR'],['Diego Serrano',24,'DD','ES'],['Lucas Vieira',25,'DC','BR'],
 ['Jonas Keller',29,'DC','DE'],['Mateo Ruiz',23,'DG','ES'],['Hugo Fontaine',26,'MDC','FR'],
 ['Tiago Santos',24,'MC','PT'],['Yanis El Amrani',22,'MC','MA'],['Gabriel Costa',25,'AD','BR'],
 ['Antoine Delcourt',26,'BU','BE'],['Rafael Mendes',23,'AG','PT'],['Pablo Navarro',21,'GB','ES'],
 ['Louis Garnier',20,'DC','FR'],['Bruno Alves',28,'DG','BR'],['Noah Weber',22,'DD','DE'],
 ['Sergio Vidal',30,'MDC','ES'],['Adam Benali',21,'MOC','MA'],['Enzo Perrin',19,'MC','FR'],
 ['Pedro Duarte',24,'AD','PT'],['Nicolas Laurent',22,'BU','FR'],['Leo Martin',18,'AG','FR'],
 ['Carlos Molina',31,'DC','ES'],
]
export const CAREER_PLAYERS: CareerPlayer[] = PLAYER_SEEDS.map(([name,age,position,nation],i)=>({
 id:`p${i+1}`, name, age, position, nation, status:i===3?'Incertain':i===13?'Blessé':i<11?'Titulaire':'Rotation',
 mood:i===16?'Préoccupé':i%4===0?'Très heureux':'Satisfait', form:92-i%5*4,
 fatigue:i===3?76:i===6?72:18+i%6*7, minutes:i<11?720+i*18:90+(i-11)*25,
 contract:`30/06/${i%3===0?2027:2029}`, salary:35000+i%7*12000, value:8+i%8*4,
 rating:84-i%9, number:i+1,
}))
export const TRANSFER_TARGET: CareerPlayer = {id:'target',name:'Alexandre Silva',age:22,position:'MC',nation:'PT',status:'À recruter',mood:'Intéressé',form:88,fatigue:24,minutes:840,contract:'30/06/2029',salary:55000,value:18,rating:81,number:28}
export interface CareerFixture { id: string; date: string; day: number; opponent: string; home: boolean; result: string }
const CAREER_DATES = ['2026-08-16','2026-08-23','2026-08-30','2026-09-13','2026-09-20','2026-09-27','2026-10-04','2026-10-18','2026-10-25','2026-11-01','2026-11-08','2026-11-22','2026-11-29','2026-12-06','2026-12-13','2026-12-20','2027-01-03','2027-01-10','2027-01-17','2027-01-24','2027-01-31','2027-02-07','2027-02-14','2027-02-21','2027-02-28','2027-03-07','2027-03-14','2027-03-21','2027-04-04','2027-04-11','2027-04-18','2027-04-21','2027-04-25','2027-05-02','2027-05-09','2027-05-16','2027-05-23','2027-05-30']
export const CAREER_FIXTURES: CareerFixture[] = CAREER_DATES.map((date,i)=>({id:`f${i+1}`,date,day:i+1,opponent:['Valence','Séville','Villarreal','Athletic Club','Betis','Osasuna','Celta','Getafe','Girona','Atlético','Espanyol','Rival'][i%12] ?? 'Valence',home:i%2===1,result:['2–0','1–1','3–1','0–1','2–1','1–0'][i%6] ?? '2–1'}))
export const MATCH_SCRIPT = [
 {minute:0,home:0,away:0,text:'Coup d’envoi. Le groupe se place en 4-3-3.'},
 {minute:15,home:0,away:0,text:'Première occasion : la frappe de Mendes passe au-dessus.'},
 {minute:30,home:1,away:0,text:'28′ · But de Delcourt, servi dans la surface par Santos.'},
 {minute:45,home:1,away:0,text:'Mi-temps. Une avance méritée, mais la rencontre reste ouverte.'},
 {minute:60,home:1,away:1,text:'52′ · Égalisation adverse sur un corner au second poteau.'},
 {minute:75,home:2,away:1,text:'71′ · Costa reprend un centre de Serrano. Le club reprend l’avantage.'},
 {minute:90,home:2,away:1,text:'Fin du match. Victoire 2–1 dans ce scénario de démonstration.'},
]
// Illustrative formation coordinates; never a real-time tracking feed.
export const MATCH_PITCH_POSITIONS = [[10,50],[27,15],[25,38],[25,62],[27,85],[43,50],[52,28],[52,72],[74,18],[81,50],[74,82]] as const
export const CAREER_TABLE = [
 {name:'FC Barcelone',played:11,won:9,drawn:2,lost:0,gf:28,ga:8,points:29},
 {name:'Real Madrid',played:11,won:8,drawn:3,lost:0,gf:25,ga:9,points:27},
 {name:'Atlético',played:11,won:7,drawn:3,lost:1,gf:22,ga:11,points:24},
 {name:'Villarreal',played:11,won:6,drawn:3,lost:2,gf:20,ga:13,points:21},
 {name:'Athletic Club',played:11,won:6,drawn:2,lost:3,gf:18,ga:12,points:20},
 ...['Betis','Séville','Celta','Osasuna','Girona','Getafe','Valence','Espanyol','Majorque','Alavés','Levante','Elche','Rayo','Oviedo','Real Sociedad'].map((name,i)=>({name,played:11,won:Math.max(0,5-Math.floor(i/3)),drawn:2,lost:4+Math.floor(i/3),gf:17-i,ga:15+i,points:Math.max(2,17-i)})),
]
export const CAREER_INITIAL_FEED = [
 {id:'welcome',title:'Un rendez-vous à préparer',body:'Le staff remet son rapport : deux titulaires présentent une fatigue élevée.',type:'Staff',destination:'/equipe/tactique'},
 {id:'player',title:'El Amrani souhaite échanger',body:'Le milieu demande davantage de visibilité sur son temps de jeu.',type:'Vestiaire',destination:'/gestion/discussions'},
 {id:'scout',title:'Silva suivi par le recrutement',body:'Un milieu de 22 ans est disponible pour une négociation de démonstration.',type:'Mercato',destination:'/gestion/transferts'},
] as const
export const CAREER_SAVE_EXAMPLES = [{id:'save1',label:'Real Madrid · Journée 12',clubId:'real-madrid' as const,index:11},{id:'save2',label:'FC Barcelone · Journée 12',clubId:'barcelone' as const,index:11}]
export const CAREER_BUDGET = 84.5
export const TRANSFER_DEMO = {fee:18,salary:55000,years:4,agent:1.2}
