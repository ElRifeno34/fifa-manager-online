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
} from "lucide-react";
import type { Club, ClubId } from "./clubs";

/*
 * Mock season for the hub prototype. Everything that names the managed club, its rival or its
 * league is derived from the selected club, so switching club in the settings keeps the copy
 * coherent. People in the inbox and the feed are fictional (see GAME_DESIGN.md, section 9).
 */

export const IMAGES = {
  background: "/images/stadium-bg-vivid.jpg",
  backgroundBlurred: "/images/stadium-bg.png",
  press: "/images/press-conference.png",
};

export interface Team {
  name: string;
  initials: string;
  primary: string;
  secondary: string;
}

const T = {
  realMadrid: { name: "Real Madrid", initials: "RM", primary: "#00529F", secondary: "#FEBE10" },
  barcelone: { name: "FC Barcelone", initials: "FCB", primary: "#A50044", secondary: "#004D98" },
  atletico: {
    name: "Atlético de Madrid",
    initials: "ATM",
    primary: "#CB3524",
    secondary: "#272E61",
  },
  villarreal: { name: "Villarreal", initials: "VIL", primary: "#F2C500", secondary: "#005187" },
  athletic: { name: "Athletic Club", initials: "ATH", primary: "#EE2523", secondary: "#121A23" },
  sevilla: { name: "Séville FC", initials: "SEV", primary: "#D4001F", secondary: "#FFFFFF" },
  liverpool: { name: "Liverpool", initials: "LFC", primary: "#C8102E", secondary: "#00B2A9" },
  arsenal: { name: "Arsenal", initials: "ARS", primary: "#EF0107", secondary: "#063672" },
  manCity: { name: "Manchester City", initials: "MCI", primary: "#6CABDD", secondary: "#1C2C5B" },
  chelsea: { name: "Chelsea", initials: "CHE", primary: "#034694", secondary: "#DBA111" },
  everton: { name: "Everton", initials: "EVE", primary: "#003399", secondary: "#FFFFFF" },
  psg: { name: "Paris SG", initials: "PSG", primary: "#004170", secondary: "#DA291C" },
  marseille: { name: "Marseille", initials: "OM", primary: "#2FAEE0", secondary: "#FFFFFF" },
  monaco: { name: "Monaco", initials: "ASM", primary: "#E51B22", secondary: "#FFFFFF" },
  lille: { name: "Lille", initials: "LOSC", primary: "#E01E13", secondary: "#24216A" },
  lyon: { name: "Lyon", initials: "OL", primary: "#1A2A6C", secondary: "#E3001B" },
  bayern: { name: "Bayern", initials: "FCB", primary: "#DC052D", secondary: "#0066B2" },
  leverkusen: { name: "Leverkusen", initials: "B04", primary: "#E32221", secondary: "#121A23" },
  dortmund: { name: "Dortmund", initials: "BVB", primary: "#FDE100", secondary: "#121A23" },
  leipzig: { name: "Leipzig", initials: "RBL", primary: "#DD0741", secondary: "#001F47" },
  stuttgart: { name: "Stuttgart", initials: "VFB", primary: "#E32219", secondary: "#FFFFFF" },
  onlineManager: {
    name: "Online Manager",
    initials: "OM",
    primary: "#0FA47A",
    secondary: "#121A23",
  },
  nord: { name: "FC Nord", initials: "FCN", primary: "#1F4E9C", secondary: "#F2C500" },
  rives: { name: "Rives United", initials: "RU", primary: "#7A1F3D", secondary: "#F5F3EF" },
  collines: { name: "AS Collines", initials: "ASC", primary: "#2E7D32", secondary: "#121A23" },
  littoral: { name: "Littoral FC", initials: "LFC", primary: "#0277BD", secondary: "#FFFFFF" },
  inter: { name: "Inter", initials: "INT", primary: "#0068A8", secondary: "#121A23" },
  benfica: { name: "Benfica", initials: "SLB", primary: "#E20E0E", secondary: "#FFFFFF" },
} satisfies Record<string, Team>;

export interface RankRow {
  pos: number;
  name: string;
  value: number;
  color: string;
  highlight?: boolean;
}

interface ClubSeason {
  rival: Team;
  /** The fixture against the rival: display title and the form used inside a sentence. */
  derby: { title: string; ref: string };
  table: [Team, number][];
  scorers: [string, Team, number][];
  european: Team;
  awayLeague: Team;
  newsOutlet: string;
}

const SEASONS: Record<ClubId, ClubSeason> = {
  "real-madrid": {
    rival: T.barcelone,
    derby: { title: "El Clásico", ref: "le Clásico" },
    table: [
      [T.barcelone, 29],
      [T.realMadrid, 27],
      [T.atletico, 24],
      [T.villarreal, 21],
      [T.athletic, 20],
    ],
    scorers: [
      ["K. Mbappé", T.realMadrid, 11],
      ["R. Lewandowski", T.barcelone, 9],
      ["J. Álvarez", T.atletico, 7],
      ["Vinícius Jr", T.realMadrid, 6],
      ["Raphinha", T.barcelone, 6],
    ],
    european: T.inter,
    awayLeague: T.sevilla,
    newsOutlet: "Marca",
  },
  barcelone: {
    rival: T.realMadrid,
    derby: { title: "El Clásico", ref: "le Clásico" },
    table: [
      [T.barcelone, 29],
      [T.realMadrid, 27],
      [T.atletico, 24],
      [T.villarreal, 21],
      [T.athletic, 20],
    ],
    scorers: [
      ["K. Mbappé", T.realMadrid, 11],
      ["R. Lewandowski", T.barcelone, 9],
      ["J. Álvarez", T.atletico, 7],
      ["Vinícius Jr", T.realMadrid, 6],
      ["Raphinha", T.barcelone, 6],
    ],
    european: T.benfica,
    awayLeague: T.villarreal,
    newsOutlet: "Mundo Deportivo",
  },
  liverpool: {
    rival: T.everton,
    derby: { title: "Le derby du Merseyside", ref: "le derby du Merseyside" },
    table: [
      [T.arsenal, 28],
      [T.liverpool, 27],
      [T.manCity, 25],
      [T.chelsea, 22],
      [T.everton, 17],
    ],
    scorers: [
      ["E. Haaland", T.manCity, 13],
      ["M. Salah", T.liverpool, 9],
      ["B. Saka", T.arsenal, 7],
      ["C. Palmer", T.chelsea, 7],
      ["C. Gakpo", T.liverpool, 6],
    ],
    european: T.inter,
    awayLeague: T.chelsea,
    newsOutlet: "The Athletic",
  },
  psg: {
    rival: T.marseille,
    derby: { title: "Le Classique", ref: "le Classique" },
    table: [
      [T.psg, 30],
      [T.marseille, 25],
      [T.monaco, 23],
      [T.lille, 21],
      [T.lyon, 19],
    ],
    scorers: [
      ["O. Dembélé", T.psg, 10],
      ["M. Greenwood", T.marseille, 9],
      ["J. David", T.lille, 7],
      ["B. Barcola", T.psg, 6],
      ["A. Lacazette", T.lyon, 5],
    ],
    european: T.benfica,
    awayLeague: T.lille,
    newsOutlet: "L'Équipe",
  },
  bayern: {
    rival: T.dortmund,
    derby: { title: "Der Klassiker", ref: "le Klassiker" },
    table: [
      [T.bayern, 31],
      [T.leverkusen, 26],
      [T.dortmund, 24],
      [T.leipzig, 22],
      [T.stuttgart, 19],
    ],
    scorers: [
      ["H. Kane", T.bayern, 14],
      ["S. Guirassy", T.dortmund, 9],
      ["P. Schick", T.leverkusen, 8],
      ["J. Musiala", T.bayern, 6],
      ["L. Openda", T.leipzig, 6],
    ],
    european: T.inter,
    awayLeague: T.stuttgart,
    newsOutlet: "Kicker",
  },
  "online-manager": {
    rival: T.nord,
    derby: { title: "Le choc au sommet", ref: "le choc au sommet" },
    table: [
      [T.nord, 28],
      [T.onlineManager, 27],
      [T.rives, 23],
      [T.collines, 20],
      [T.littoral, 18],
    ],
    scorers: [
      ["T. Morel", T.onlineManager, 10],
      ["K. Adjei", T.nord, 9],
      ["L. Varga", T.rives, 7],
      ["S. Okafor", T.onlineManager, 6],
      ["M. Brandt", T.collines, 5],
    ],
    european: T.benfica,
    awayLeague: T.collines,
    newsOutlet: "Online Sport",
  },
};

// ---------------------------------------------------------------- menu

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  href?: string;
}

export const MENU: MenuItem[] = [
  { id: "avancer", label: "Avancer", icon: FastForward },
  { id: "effectif", label: "Effectif", icon: Users, badge: 2, href: "/effectif" },
  { id: "tactique", label: "Tactique", icon: ClipboardList, href: "/banc-de-test" },
  { id: "entrainement", label: "Entraînement", icon: Dumbbell },
  { id: "transferts", label: "Transferts", icon: ArrowLeftRight, badge: 3 },
  { id: "competition", label: "Compétition", icon: Trophy },
  { id: "medias", label: "Médias", icon: Newspaper, badge: 5, href: "/medias/fil" },
  { id: "carriere", label: "Carrière coach", icon: UserRound },
  { id: "bureau", label: "Bureau du manager", icon: Briefcase },
];

/** Issues the manager should look at before advancing to the match. */
export const READINESS_WARNINGS = ["2 titulaires fatigués", "Compo non validée"];

export const HINTS = [
  { keys: "Espace", label: "Avancer" },
  { keys: "Ctrl K", label: "Rechercher" },
  { keys: "← →", label: "Changer d'actu" },
  { keys: "1-9", label: "Menu" },
  { keys: "M", label: "Messagerie" },
];

// ---------------------------------------------------------------- season view

export interface NewsStory {
  id: string;
  meta: string;
  headline: string;
  lead: string;
  image?: string;
  icon: LucideIcon;
}

export interface CalendarEntry {
  day: number;
  weekday: string;
  today?: boolean;
  match?: { home: boolean; opponent: Team; competition?: string };
}

export type MessageCategory = "direction" | "staff" | "transferts" | "presse";

export interface Message {
  id: string;
  sender: string;
  category: MessageCategory;
  subject: string;
  /** Short stamp for lists: hour, weekday or date. */
  time: string;
  /** Full stamp for the reading pane. */
  received: string;
  unread?: boolean;
  body: string[];
  actions: string[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
  likes: number;
}

export interface Post {
  id: string;
  date: string;
  text: string;
  image?: string;
  icon: LucideIcon;
  likes: string;
  commentCount: string;
  isNew?: boolean;
  comments: Comment[];
}

export interface SeasonView {
  rival: Team;
  derby: string;
  position: number;
  points: number;
  standings: RankRow[];
  scorers: RankRow[];
  nextMatch: {
    weekday: string;
    date: string;
    venue: string;
    time: string;
    title: string;
    opponent: Team;
  };
  advanceSubline: string;
  calendar: CalendarEntry[];
  news: NewsStory[];
  messages: Message[];
  posts: Post[];
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const ORDINAL = (n: number) => (n === 1 ? "1er" : `${n}e`);

export function getSeason(club: Club): SeasonView {
  const s = SEASONS[club.id];
  const rival = s.rival;
  const standings = s.table.map(([team, pts], i) => ({
    pos: i + 1,
    name: team.name,
    value: pts,
    color: team.primary,
    highlight: team.name === club.name,
  }));
  const scorers = s.scorers.map(([name, team, goals], i) => ({
    pos: i + 1,
    name,
    value: goals,
    color: team.primary,
    highlight: team.name === club.name,
  }));
  const mine = standings.find((r) => r.highlight) ?? standings[0]!;
  const leader = standings[0]!;
  const isLeader = mine.pos === 1;
  const gapLine = isLeader
    ? `${club.name} est en tête avec ${mine.value} points.`
    : `${club.name} est ${ORDINAL(mine.pos)} avec ${mine.value} points, à ${leader.value - mine.value} longueurs de ${leader.name}.`;
  const derbyRef = s.derby.ref;

  return {
    rival,
    derby: s.derby.title,
    position: mine.pos,
    points: mine.value,
    standings,
    scorers,
    nextMatch: {
      weekday: "Dim.",
      date: "23/11",
      venue: "Domicile",
      time: "21:00",
      title: s.derby.title,
      opponent: rival,
    },
    advanceSubline: `J12 · DIM 23/11 · vs ${rival.name.toUpperCase()}`,
    calendar: [
      { day: 23, weekday: "Dim.", today: true, match: { home: true, opponent: rival } },
      { day: 24, weekday: "Lun." },
      { day: 25, weekday: "Mar." },
      {
        day: 26,
        weekday: "Mer.",
        match: { home: false, opponent: s.european, competition: "Ligue des champions" },
      },
      { day: 27, weekday: "Jeu." },
      { day: 28, weekday: "Ven." },
      { day: 29, weekday: "Sam." },
      { day: 30, weekday: "Dim.", match: { home: false, opponent: s.awayLeague } },
    ],
    news: [
      {
        id: "conference",
        meta: `${s.newsOutlet} · Conférence de presse · il y a 2 h`,
        headline: `${capitalize(derbyRef)} se prépare dès ce soir`,
        lead: `Après la victoire 2-0 du week-end, l'entraîneur de ${club.name} appelle au calme avant de recevoir ${rival.name} dimanche.`,
        image: IMAGES.press,
        icon: Newspaper,
      },
      {
        id: "resume",
        meta: `${club.competition} · Résumé · hier`,
        headline: `${club.name} s'impose 2-0 : le résumé`,
        lead: `Deux buts en seconde période suffisent. ${gapLine}`,
        icon: Goal,
      },
      {
        id: "mercato",
        meta: `${s.newsOutlet} · Mercato · il y a 5 h`,
        headline: "Mercato : le club suit un milieu de terrain",
        lead: "La cellule de recrutement a envoyé plusieurs observateurs pour suivre le joueur lors des deux prochaines rencontres.",
        icon: ArrowLeftRight,
      },
    ],
    messages: buildMessages(club, s, gapLine),
    posts: buildPosts(club, s),
  };
}

function buildMessages(club: Club, s: ClubSeason, gapLine: string): Message[] {
  return [
    {
      id: "objectif",
      sender: "Direction",
      category: "direction",
      subject: "Objectif de la saison : top 4",
      time: "09:12",
      received: "Dim. 23/11 · 09:12",
      unread: true,
      body: [
        `Après onze journées, le conseil d'administration confirme son objectif : une qualification pour la Ligue des champions, soit une place dans les quatre premiers de ${club.competition}.`,
        `${gapLine} ${capitalize(s.derby.ref)} de dimanche contre ${s.rival.name} sera un rendez-vous déterminant.`,
        "Nous vous demandons de nous confirmer que cet objectif est compatible avec votre projet de jeu.",
      ],
      actions: ["Répondre"],
    },
    {
      id: "pret",
      sender: "Agent · L. Moreau",
      category: "transferts",
      subject: "Proposition de prêt jusqu'en juin",
      time: "Hier",
      received: "Sam. 22/11 · 18:40",
      unread: true,
      body: [
        "Bonjour coach, mon client souhaite plus de temps de jeu. Un club de milieu de tableau est prêt à l'accueillir en prêt jusqu'en juin, avec une option d'achat.",
        "Les conditions : salaire pris en charge à 80 %, clause de rappel en janvier. Je vous laisse examiner l'offre avant le week-end.",
      ],
      actions: ["Accepter", "Refuser", "Répondre"],
    },
    {
      id: "infirmerie",
      sender: "Staff médical",
      category: "staff",
      subject: `D. Ferreira incertain contre ${s.rival.name}`,
      time: "Ven.",
      received: "Ven. 21/11 · 17:05",
      unread: true,
      body: [
        "D. Ferreira a ressenti une gêne à la cuisse en fin de séance. Les examens du jour ne révèlent pas de lésion, mais le risque de rechute est réel s'il enchaîne un match à haute intensité.",
        "Nous réévaluerons son état samedi matin. Dans le doute, nous recommandons de préparer une alternative en défense centrale.",
      ],
      actions: ["Répondre", "Voir l'infirmerie"],
    },
    {
      id: "scout",
      sender: "Cellule de recrutement",
      category: "transferts",
      subject: "Rapport : milieu de terrain suivi au Portugal",
      time: "Jeu.",
      received: "Jeu. 20/11 · 11:30",
      body: [
        "Nos observateurs ont suivi le joueur lors de deux rencontres consécutives. Profil : milieu relayeur de 22 ans, excellent dans la récupération et la première relance.",
        "Il ressort une clause libératoire élevée, mais négociable à la baisse en janvier.",
      ],
      actions: ["Ouvrir le rapport", "Répondre"],
    },
    {
      id: "sponsor",
      sender: "Partenaire · Sponsor maillot",
      category: "direction",
      subject: "Renouvellement du contrat maillot",
      time: "Mer.",
      received: "Mer. 19/11 · 15:20",
      unread: true,
      body: [
        "Notre partenaire propose de renouveler le contrat de sponsoring maillot pour trois saisons, avec une hausse de 8 % du montant annuel.",
        "En contrepartie, il demande deux apparitions supplémentaires des joueurs lors d'événements commerciaux.",
      ],
      actions: ["Accepter", "Refuser", "Répondre"],
    },
    {
      id: "academie",
      sender: "Académie",
      category: "staff",
      subject: "Trois jeunes à intégrer à l'entraînement",
      time: "Mar.",
      received: "Mar. 18/11 · 10:00",
      body: [
        "Trois joueurs de l'équipe réserve se sont distingués ces dernières semaines. Nous proposons de les intégrer aux séances de la semaine afin de les évaluer au contact du groupe professionnel.",
      ],
      actions: ["Accepter", "Refuser"],
    },
    {
      id: "presse",
      sender: "Service presse",
      category: "presse",
      subject: `Demande d'interview avant ${s.derby.ref}`,
      time: "Lun.",
      received: "Lun. 17/11 · 16:45",
      body: [
        `Une chaîne nationale souhaite réaliser une interview de dix minutes avec vous avant ${s.derby.ref}. La diffusion serait prévue la veille du match.`,
        "Nous vous conseillons d'accepter : cela permettrait de cadrer le discours avant la rencontre.",
      ],
      actions: ["Accepter", "Refuser", "Répondre"],
    },
    {
      id: "temps-de-jeu",
      sender: "Joueur · B. Díaz",
      category: "staff",
      subject: "Temps de jeu : je souhaite en parler",
      time: "15/11",
      received: "Sam. 15/11 · 20:10",
      body: [
        "Coach, je n'ai pas été utilisé lors des trois derniers matchs et je ne comprends pas votre choix. Je voudrais en discuter avec vous cette semaine.",
        "Je reste motivé et à disposition du groupe, mais j'ai besoin de savoir quel rôle vous me réservez.",
      ],
      actions: ["Répondre"],
    },
  ];
}

function buildPosts(club: Club, s: ClubSeason): Post[] {
  return [
    {
      id: "entrainement",
      date: "23/11",
      text: `Le groupe a repris l'entraînement avant ${s.derby.ref} 💪`,
      image: IMAGES.press,
      icon: Newspaper,
      likes: "12,4 k",
      commentCount: "842",
      isNew: true,
      comments: [
        {
          id: "c1",
          author: "Camille R.",
          text: "Enfin ! Hâte d'être à dimanche 🔥",
          time: "12 min",
          likes: 214,
        },
        {
          id: "c2",
          author: "Sofia B.",
          text: "Pourvu qu'il n'y ait pas de blessé d'ici là… j'ai tellement peur.",
          time: "18 min",
          likes: 96,
        },
        {
          id: "c3",
          author: "Karim D.",
          text: "Tout ça pour que je rate le match parce que ma belle-mère vient dîner 😭",
          time: "26 min",
          likes: 388,
        },
        {
          id: "c4",
          author: "Julien M.",
          text: "Ça sent le 3-0, je le sens dans mes genoux.",
          time: "31 min",
          likes: 57,
        },
        {
          id: "c5",
          author: "Léa P.",
          text: `Allez ${club.name} !!! 🤍`,
          time: "45 min",
          likes: 143,
        },
        {
          id: "c6",
          author: "Thomas L.",
          text: "On ne change pas une équipe qui gagne, gardez le même onze.",
          time: "1 h",
          likes: 72,
        },
        {
          id: "c7",
          author: "Nadia K.",
          text: "Mon chat porte le maillot, il valide la préparation 🐱",
          time: "1 h",
          likes: 301,
        },
      ],
    },
    {
      id: "stade",
      date: "22/11",
      text: `Pelouse impeccable, tribunes en préparation. Rendez-vous dimanche à 21 h pour recevoir ${s.rival.name} 🏟️`,
      image: IMAGES.background,
      icon: Newspaper,
      likes: "8,9 k",
      commentCount: "416",
      isNew: true,
      comments: [
        {
          id: "d1",
          author: "Hugo V.",
          text: "Cette pelouse, on dirait un tapis de billard.",
          time: "2 h",
          likes: 88,
        },
        {
          id: "d2",
          author: "Inès A.",
          text: "J'ai mes places, j'ai déjà pris ma journée. Le patron ne sait pas encore 🤫",
          time: "2 h",
          likes: 176,
        },
        {
          id: "d3",
          author: "Marc T.",
          text: "Un peu inquiet pour la défense centrale, honnêtement…",
          time: "3 h",
          likes: 41,
        },
        {
          id: "d4",
          author: "Élodie S.",
          text: "Quelqu'un a une place en trop ? Je promets d'être raisonnable 😅",
          time: "3 h",
          likes: 129,
        },
        {
          id: "d5",
          author: "Paul G.",
          text: "L'ambiance va être folle, je suis déjà enroué rien que d'y penser.",
          time: "4 h",
          likes: 64,
        },
      ],
    },
    {
      id: "infirmerie",
      date: "21/11",
      text: "Point médical : deux joueurs suivis de près, la décision sera prise samedi.",
      icon: HeartPulse,
      likes: "5,2 k",
      commentCount: "1,1 k",
      comments: [
        {
          id: "e1",
          author: "Romain F.",
          text: "Dites-moi que le groupe sera au complet, s'il vous plaît 🙏",
          time: "5 h",
          likes: 233,
        },
        {
          id: "e2",
          author: "Chloé D.",
          text: "Le staff médical est au top cette saison, faisons-leur confiance.",
          time: "5 h",
          likes: 118,
        },
        {
          id: "e3",
          author: "Yanis B.",
          text: "Moi à chaque communiqué médical : *respire dans un sac en papier*",
          time: "6 h",
          likes: 412,
        },
        {
          id: "e4",
          author: "Anaïs C.",
          text: "On a un banc solide, ça ira. Courage à eux !",
          time: "7 h",
          likes: 54,
        },
      ],
    },
  ];
}

export const MESSAGE_FILTERS = [
  { id: "tous", label: "Tous" },
  { id: "non-lus", label: "Non lus" },
  { id: "direction", label: "Direction" },
  { id: "staff", label: "Staff" },
  { id: "transferts", label: "Transferts" },
  { id: "presse", label: "Presse" },
] as const;

export type FilterId = (typeof MESSAGE_FILTERS)[number]["id"];
