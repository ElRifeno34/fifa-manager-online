import { useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Shield } from "lucide-react";
import { Link } from "react-router";

type WireframeScreen = {
  id: string;
  group: string;
  title: string;
  purpose: string;
  metrics: [string, string][];
  tableTitle: string;
  columns: string[];
  rows: string[][];
  sideTitle: string;
  sideText: string;
  actions: string[];
  next: string;
};

const SCREENS: WireframeScreen[] = [
  {
    id: "menu",
    group: "Démarrer",
    title: "Menu principal",
    purpose: "Entrer dans une carrière solo hors ligne.",
    metrics: [
      ["Partie active", "Liga · 2026-27"],
      ["Sauvegardes", "2 / 3"],
    ],
    tableTitle: "Actions principales",
    columns: ["Action", "Fonction", "Suite"],
    rows: [
      ["Nouvelle carrière", "Créer une partie", "Choix du championnat"],
      ["Continuer", "Reprendre la partie active", "Hub du club"],
      ["Charger", "Choisir un emplacement", "Sauvegardes"],
      ["Réglages", "Langue et affichage", "Préférences"],
    ],
    sideTitle: "Principe V1",
    sideText: "Une partie solo, locale et sauvegardable. Les autres clubs sont gérés par l’IA.",
    actions: ["Nouvelle carrière", "Continuer", "Sauvegardes"],
    next: "Nouvelle carrière ouvre la configuration de partie.",
  },
  {
    id: "new-career",
    group: "Démarrer",
    title: "Nouvelle carrière",
    purpose: "Choisir un pack, une compétition puis un club.",
    metrics: [
      ["Saison", "2026-27"],
      ["Packs", "25 compétitions"],
    ],
    tableTitle: "Sélection du club",
    columns: ["Étape", "Choix", "Aperçu"],
    rows: [
      ["Pays / compétition", "Espagne · Liga", "20 clubs · calendrier chargé"],
      ["Club", "Club sélectionné", "Réputation · effectif · stade"],
      ["Difficulté", "Objectif du CA", "Maintien / Europe / titre"],
      ["Vérification", "Budget et joueurs", "Données estimées signalées"],
    ],
    sideTitle: "Avant de commencer",
    sideText:
      "Afficher l’objectif, le budget, le niveau de l’effectif et les données manquantes avant création.",
    actions: ["Choisir compétition", "Choisir club", "Créer la partie"],
    next: "La création charge l’effectif, le calendrier et la première boîte de réception.",
  },
  {
    id: "saves",
    group: "Démarrer",
    title: "Sauvegardes",
    purpose: "Reprendre, créer, exporter ou importer une carrière.",
    metrics: [
      ["Emplacements", "3"],
      ["Sauvegarde auto", "Activée"],
    ],
    tableTitle: "Parties locales",
    columns: ["Emplacement", "Club / saison", "Dernière activité", "Action"],
    rows: [
      ["Autosauvegarde", "Club sélectionné · J12", "Aujourd’hui, 18:42", "Charger"],
      ["Partie 2", "Autre club · J6", "Hier, 20:10", "Charger"],
      ["Emplacement libre", "—", "—", "Créer"],
    ],
    sideTitle: "Portabilité",
    sideText: "Un fichier exporté permet de déplacer une partie vers un autre appareil.",
    actions: ["Charger", "Exporter fichier", "Importer fichier"],
    next: "Charger une partie restaure la date, l’effectif, les finances et les décisions en attente.",
  },
  {
    id: "hub",
    group: "Piloter le club",
    title: "Hub du club",
    purpose: "Voir l’état du club et décider de la prochaine action.",
    metrics: [
      ["Prochain match", "Séville · J12"],
      ["Classement", "3e · 27 pts"],
      ["Confiance CA", "82 %"],
    ],
    tableTitle: "Tableau de bord",
    columns: ["Bloc", "Information", "Accès"],
    rows: [
      ["Échéance", "Match samedi, 20 h", "Préparer"],
      ["À faire", "Onze à confirmer", "Composition"],
      ["Effectif", "1 blessé · 2 contrats à suivre", "Équipe"],
      ["Messages", "Joueur + adjoint", "Discussions"],
      ["À la une", "Résumé du dernier résultat", "Presse"],
    ],
    sideTitle: "Actions rapides",
    sideText: "Le hub hiérarchise urgences, échéances proches et nouveautés de la carrière.",
    actions: ["Préparer match", "Voir l’effectif", "Avancer le calendrier"],
    next: "Les sections de gestion ramènent au hub après décision ou lecture.",
  },
  {
    id: "roster",
    group: "Gérer l’équipe",
    title: "Effectif",
    purpose: "Comparer la disponibilité, la forme, le moral, les contrats et les rôles.",
    metrics: [
      ["Joueurs", "25"],
      ["Disponibles", "23"],
      ["Moral moyen", "76 / 100"],
    ],
    tableTitle: "Équipe A · effectif filtrable",
    columns: ["Joueur", "Poste", "Rôle", "Forme", "Fatigue", "Contrat"],
    rows: [
      ["Joueur A", "GB", "Indiscutable", "Bonne", "18 %", "2028"],
      ["Joueur B", "DC", "Titulaire", "Neutre", "41 %", "2027"],
      ["Joueur C", "MC", "Rotation", "Très bonne", "22 %", "2029"],
      ["Joueur D", "BU", "À développer", "Bonne", "16 %", "2028"],
    ],
    sideTitle: "Filtres et vue",
    sideText:
      "Équipe A / réserve, poste, note, âge, fatigue, moral, forme, contrat et disponibilité.",
    actions: ["Trier les joueurs", "Ouvrir la fiche", "Composer le onze"],
    next: "La sélection d’un joueur ouvre sa fiche ; l’action composition mène à la feuille tactique.",
  },
  {
    id: "player",
    group: "Gérer l’équipe",
    title: "Fiche joueur",
    purpose: "Comprendre l’identité, le niveau et l’état d’un joueur.",
    metrics: [
      ["Âge", "24 ans"],
      ["Général", "78"],
      ["Potentiel estimé", "★★★★☆"],
    ],
    tableTitle: "Informations joueur",
    columns: ["Domaine", "Valeur", "Effet carrière"],
    rows: [
      ["Identité", "Nationalité · poste · pied", "Profil stable"],
      ["Attributs", "Technique · physique · mental", "Performance par poste"],
      ["État", "Forme · moral · fatigue", "Disponibilité et match"],
      ["Contrat", "Salaire · durée restante", "Négociation / départ libre"],
      ["Parcours", "Stats saison · progression", "Évolution et historique"],
    ],
    sideTitle: "Actions liées",
    sideText:
      "Les notes de jeu et le potentiel restent des estimations. Les données réelles disponibles sont indiquées séparément.",
    actions: [
      "Choisir un axe individuel",
      "Parler du temps de jeu",
      "Prolonger",
      "Suivre au mercato",
    ],
    next: "Les actions passent par entraînement, discussions ou transferts.",
  },
  {
    id: "tactics",
    group: "Gérer l’équipe",
    title: "Composition et tactique",
    purpose: "Sélectionner le onze, le banc, une formation et trois consignes.",
    metrics: [
      ["Formation", "4-3-3"],
      ["Onze", "10 / 11"],
      ["Familiarité", "78 %"],
    ],
    tableTitle: "Feuille de match",
    columns: ["Zone du terrain", "Poste", "Titulaire", "Remplaçant"],
    rows: [
      ["Gardien", "GB", "Joueur A", "Joueur B"],
      ["Défense", "DD · DC · DC · DG", "Quatre joueurs", "Quatre remplaçants"],
      ["Milieu", "MDC · MC · MC", "Trois joueurs", "Trois remplaçants"],
      ["Attaque", "AD · BU · AG", "Trois joueurs", "Trois remplaçants"],
    ],
    sideTitle: "Consignes V1",
    sideText:
      "Pressing, largeur et rythme. La familiarité tactique baisse si la structure change souvent.",
    actions: ["Changer de formation", "Ajuster consignes", "Auto-composer", "Valider la feuille"],
    next: "La feuille confirmée est transmise au moteur avant le match.",
  },
  {
    id: "pre-match",
    group: "Jouer les matchs",
    title: "Avant-match",
    purpose: "Comparer les équipes et confirmer la préparation.",
    metrics: [
      ["Forme", "V · N · V · D · V"],
      ["Adversaire", "8e"],
      ["Absents", "1 blessé"],
    ],
    tableTitle: "Comparaison",
    columns: ["Repère", "Notre club", "Adversaire"],
    rows: [
      ["Niveau du onze", "78", "74"],
      ["Style", "Possession · pressing", "Bloc bas · direct"],
      ["Joueur clé", "Milieu A", "Attaquant B"],
      ["Indisponibles", "1 blessé", "1 suspendu"],
    ],
    sideTitle: "Décision tactique",
    sideText:
      "L’adversaire et le contexte aident à ajuster le plan. Ils ne garantissent pas le résultat.",
    actions: ["Retour à la compo", "Modifier consignes", "Lancer le match", "Simulation rapide"],
    next: "Lancer démarre le compte-rendu texte et les statistiques en direct.",
  },
  {
    id: "match",
    group: "Jouer les matchs",
    title: "Match en direct",
    purpose: "Suivre le score, les temps forts, les statistiques et les décisions de match.",
    metrics: [
      ["Score", "2 — 1"],
      ["Minute", "67e"],
      ["Possession", "61 %"],
    ],
    tableTitle: "Temps forts et stats",
    columns: ["Minute", "Événement", "Impact"],
    rows: [
      ["24’", "Occasion · arrêt du gardien", "Score inchangé"],
      ["51’", "But après débordement", "2 — 0"],
      ["64’", "Transition adverse · but", "2 — 1"],
      ["67’", "Fatigue en hausse", "Joueur à surveiller"],
    ],
    sideTitle: "Pendant le match V1",
    sideText:
      "Le texte et les statistiques sont interactifs en V1. La visionneuse 2D arrive en phase 4.",
    actions: ["Voir les stats", "Simuler jusqu’à la fin", "Terminer le match"],
    next: "Le résultat final déclenche le résumé, les réactions et la mise à jour de la saison.",
  },
  {
    id: "review",
    group: "Jouer les matchs",
    title: "Résumé après-match",
    purpose: "Comprendre le résultat et ses effets sur la carrière.",
    metrics: [
      ["Résultat", "Victoire · 3 pts"],
      ["Homme du match", "Milieu A"],
      ["Fatigue", "+18"],
    ],
    tableTitle: "Bilan de la rencontre",
    columns: ["Indicateur", "Nous", "Adversaire"],
    rows: [
      ["Tirs / cadrés", "13 / 6", "7 / 3"],
      ["Possession", "61 %", "39 %"],
      ["Note collective", "7,2", "6,4"],
      ["Discipline", "2 jaunes", "1 jaune"],
    ],
    sideTitle: "Conséquences",
    sideText:
      "Classement, forme, fatigue, moral, blessures, suspensions et réactions sont recalculés après le match.",
    actions: ["Voir les notes", "Lire les réactions", "Continuer la carrière"],
    next: "Continuer revient au hub avec une nouvelle date de carrière.",
  },
  {
    id: "calendar",
    group: "Suivre la saison",
    title: "Calendrier",
    purpose: "Parcourir les journées, les résultats et les matchs à venir.",
    metrics: [
      ["Journée", "12 / 38"],
      ["Matchs joués", "11"],
      ["À venir", "27"],
    ],
    tableTitle: "Journées récentes et futures",
    columns: ["Date", "J", "Rencontre", "Score / statut"],
    rows: [
      ["15 août", "12", "Club — Séville", "À jouer"],
      ["8 août", "11", "Real Sociedad — Club", "1 — 2"],
      ["1 août", "10", "Club — Betis", "3 — 0"],
      ["25 juillet", "9", "Valence — Club", "2 — 2"],
    ],
    sideTitle: "Filtres",
    sideText: "Saison, compétition, matchs du club, journée et résultats de tous les clubs.",
    actions: [
      "Journée précédente",
      "Prochaine journée",
      "Ouvrir le classement",
      "Simuler jusqu’à la date",
    ],
    next: "Les journées sélectionnées donnent accès aux résultats ou à la préparation du prochain match.",
  },
  {
    id: "standings",
    group: "Suivre la saison",
    title: "Classement",
    purpose: "Suivre la course au titre, l’Europe, le maintien et les buteurs.",
    metrics: [
      ["Position", "3e"],
      ["Points", "27"],
      ["Objectif", "Qualification européenne"],
    ],
    tableTitle: "Classement de la compétition",
    columns: ["Pos.", "Club", "J", "Pts", "Diff.", "Forme"],
    rows: [
      ["1", "Club A", "11", "27", "+18", "V V N V V"],
      ["2", "Club B", "11", "25", "+15", "V V V D V"],
      ["3", "Ton club", "11", "24", "+12", "V N V D V"],
      ["4", "Club D", "11", "20", "+7", "V D V V N"],
    ],
    sideTitle: "Classements associés",
    sideText:
      "Vue forme, meilleurs buteurs et résultats de la journée, avec l’objectif de la direction.",
    actions: ["Classement", "Meilleurs buteurs", "Forme récente", "Résultats du tour"],
    next: "Le rang et l’écart à l’objectif alimentent les réunions avec le CA.",
  },
  {
    id: "quick-sim",
    group: "Suivre la saison",
    title: "Simulation rapide",
    purpose: "Faire avancer le calendrier sans ouvrir chaque match.",
    metrics: [
      ["Prochaine échéance", "Match samedi"],
      ["Alertes en attente", "2"],
    ],
    tableTitle: "Choisir la destination",
    columns: ["Jusqu’à", "Traitement", "Arrêt prévu"],
    rows: [
      ["Prochain match", "Jours et entraînements", "Avant la rencontre"],
      ["Prochaine date clé", "Matchs et mercato", "Résumé avec alertes"],
      ["Date choisie", "Jusqu’à la date", "Décisions importantes"],
    ],
    sideTitle: "Garde-fous",
    sideText:
      "Les blessures, offres, promesses ou choix de conversation interrompent l’avance quand une décision du joueur est requise.",
    actions: ["Jusqu’au prochain match", "Jusqu’à dimanche", "Choisir une date", "Annuler"],
    next: "Un résumé récapitule les résultats, changements de classement et événements clés.",
  },
  {
    id: "season-end",
    group: "Suivre la saison",
    title: "Fin de saison",
    purpose: "Clore l’année sportive et préparer la saison suivante.",
    metrics: [
      ["Objectif", "Atteint"],
      ["Position finale", "3e"],
      ["Bilan", "72 pts"],
    ],
    tableTitle: "Bilan annuel",
    columns: ["Domaine", "Résultat", "Transition"],
    rows: [
      ["Équipe", "Meilleur joueur et statistiques", "Récompenses"],
      ["Progression", "Attributs et vieillissement", "Nouvelle note"],
      ["Jeunes", "2 à 4 joueurs générés", "Intégration"],
      ["Contrats", "Échéances à venir", "Négociations"],
      ["Division", "Montée / maintien / descente", "Nouvelle ligue"],
    ],
    sideTitle: "Réunion du CA",
    sideText:
      "Le bilan fixe confiance, budget, nouvel objectif et attentes pour la prochaine saison.",
    actions: ["Bilan joueurs", "Réunion direction", "Préparer saison suivante"],
    next: "La carrière repart au menu de pré-saison avec les nouvelles données appliquées.",
  },
  {
    id: "press",
    group: "Vie du club",
    title: "Presse",
    purpose: "Lire les unes et articles racontant les événements de la partie.",
    metrics: [
      ["Journaux suivis", "3"],
      ["Nouveautés", "5"],
    ],
    tableTitle: "Kiosque sportif",
    columns: ["Journal", "Une", "Sujet", "Lien"],
    rows: [
      ["Journal A", "Le club prend la tête", "Victoire du week-end", "Résumé"],
      ["Journal B", "Le milieu fait la différence", "Joueur du match", "Fiche joueur"],
      ["Journal C", "Prochain choc européen", "Avant-match", "Préparer"],
    ],
    sideTitle: "Contenu",
    sideText:
      "Textes modèles liés aux résultats, au championnat et aux joueurs. La reformulation IA est prévue plus tard.",
    actions: ["Lire l’article", "Filtrer par journal", "Articles précédents"],
    next: "Les articles renvoient vers le match, le joueur ou le classement concernés.",
  },
  {
    id: "feed",
    group: "Vie du club",
    title: "Fil du club",
    purpose: "Lire les réactions simulées des supporters, des joueurs et des médias.",
    metrics: [
      ["Publications", "12"],
      ["Tendance", "#Championnat"],
    ],
    tableTitle: "Publications récentes",
    columns: ["Auteur", "Publication", "Événement"],
    rows: [
      ["Supporters", "Belle victoire à domicile !", "Résultat"],
      ["Presse", "Le pressing a fait basculer la rencontre.", "Statistiques"],
      ["Vestiaire", "On continue, prochain match samedi.", "Calendrier"],
    ],
    sideTitle: "Rôle du fil",
    sideText:
      "Likes, partages et tendances donnent de l’ambiance. Ils ne changent pas eux-mêmes les règles de carrière.",
    actions: ["Fil club", "Fil championnat", "Événements récents"],
    next: "Les publications se renouvellent à partir des événements de la sauvegarde.",
  },
  {
    id: "transfers",
    group: "Gestion",
    title: "Transferts et contrats",
    purpose: "Rechercher, suivre, négocier et prolonger des joueurs.",
    metrics: [
      ["Budget transfert", "82 M€"],
      ["Fenêtre", "Ouverte · été"],
      ["Contrats à suivre", "5"],
    ],
    tableTitle: "Cibles et négociations",
    columns: ["Joueur", "Poste / âge", "Prix demandé", "État"],
    rows: [
      ["Cible A", "MDC · 25 ans", "32 M€", "À observer"],
      ["Cible B", "DC · 22 ans", "18 M€", "Contre-offre"],
      ["Joueur du club", "MC · 28 ans", "—", "Prolongation"],
    ],
    sideTitle: "Négociation en deux étapes",
    sideText:
      "D’abord l’indemnité avec le club vendeur ; ensuite salaire, durée, rôle et promesses avec le joueur. Jusqu’à trois tours.",
    actions: [
      "Rechercher",
      "Envoyer une offre",
      "Répondre à une contre-offre",
      "Prolonger un joueur",
    ],
    next: "Une transaction modifie l’effectif, les contrats, le budget et la boîte de réception.",
  },
  {
    id: "finances",
    group: "Gestion",
    title: "Finances",
    purpose: "Suivre budget transfert, salaires, revenus et dépenses.",
    metrics: [
      ["Transferts", "82 M€"],
      ["Salaires", "3,8 M€ / semaine"],
      ["Solde saison", "+12 M€"],
    ],
    tableTitle: "Comptes du club",
    columns: ["Poste", "Entrées", "Sorties", "Solde"],
    rows: [
      ["Droits TV", "3,2 M€", "—", "+3,2 M€"],
      ["Billetterie", "1,1 M€", "—", "+1,1 M€"],
      ["Salaires", "—", "3,8 M€", "−3,8 M€"],
      ["Transferts", "—", "12 M€", "−12 M€"],
    ],
    sideTitle: "Suivi budgétaire",
    sideText:
      "Les budgets de départ sont estimés selon la réputation et la valeur de l’effectif, puis ajustés par le CA.",
    actions: [
      "Voir le budget",
      "Masse salariale",
      "Historique des opérations",
      "Demander une enveloppe",
    ],
    next: "Les dépenses et résultats influencent la confiance et le budget de la saison suivante.",
  },
  {
    id: "training",
    group: "Gestion",
    title: "Entraînement",
    purpose: "Organiser la semaine et suivre l’évolution, la fatigue et la familiarité tactique.",
    metrics: [
      ["Intensité", "Normale"],
      ["Charge moyenne", "62 / 100"],
      ["Familiarité", "78 %"],
    ],
    tableTitle: "Semaine d’entraînement",
    columns: ["Jour", "Séance", "Axe joueur", "Effet principal"],
    rows: [
      ["Lun", "Récupération", "—", "Fatigue en baisse"],
      ["Mar", "Tactique", "Consigne équipe", "Familiarité en hausse"],
      ["Mer", "Technique", "Passe / finition", "Progression"],
      ["Jeu", "Repos", "—", "Blessure moins probable"],
      ["Ven", "Pré-match", "Titulaires", "Préparation"],
    ],
    sideTitle: "Plan de l’adjoint",
    sideText:
      "L’adjoint conseille une charge et un thème. Le joueur peut déléguer ou ajuster chaque axe individuel.",
    actions: ["Choisir intensité", "Choisir thème", "Axes individuels", "Appliquer le plan"],
    next: "Le plan agit sur attributs, fatigue, risque de blessure et familiarité.",
  },
  {
    id: "coach",
    group: "Relations",
    title: "Carrière coach",
    purpose: "Suivre la réputation, le contrat, les résultats et l’avenir du manager.",
    metrics: [
      ["Réputation", "74 / 100"],
      ["Confiance CA", "82 %"],
      ["Contrat", "Juin 2028"],
    ],
    tableTitle: "Historique",
    columns: ["Saison", "Club", "Résultat", "Objectif"],
    rows: [
      ["2026-27", "Club actuel", "3e · 72 pts", "Atteint"],
      ["2025-26", "Club actuel", "Première saison", "—"],
      ["Palmarès", "—", "0 trophée", "À construire"],
    ],
    sideTitle: "Avenir du manager",
    sideText:
      "Les objectifs, résultats, finances et réunions influencent la confiance. Une perte de confiance peut mener au licenciement.",
    actions: ["Contrat actuel", "Historique de carrière", "Offres de clubs", "Réunion avec le CA"],
    next: "Une offre acceptée transfère la carrière vers le nouveau club.",
  },
  {
    id: "talks",
    group: "Relations",
    title: "Discussions et promesses",
    purpose: "Répondre aux joueurs, à l’adjoint et à la direction.",
    metrics: [
      ["Messages à traiter", "3"],
      ["Promesses actives", "2"],
      ["Confiance CA", "82 %"],
    ],
    tableTitle: "Conversations",
    columns: ["Interlocuteur", "Sujet", "Décision", "Effet suivi"],
    rows: [
      ["Joueur A", "Temps de jeu", "Promettre / expliquer", "Moral et promesse"],
      ["Adjoint", "Fatigue du onze", "Rotation / maintien", "Condition et résultat"],
      ["Direction", "Objectif européen", "Confirmer / demander budget", "Confiance et finances"],
    ],
    sideTitle: "Promesses vérifiables",
    sideText:
      "Chaque promesse a une échéance. La tenir ou la manquer modifie moral, confiance et relations.",
    actions: ["Répondre au joueur", "Demander conseil", "Parler à la direction", "Voir promesses"],
    next: "Les conversations importantes interrompent la simulation rapide en attente d’une décision.",
  },
];

const NOT_V1 = [
  "Photos sociales générées",
  "Visionneuse de match 2D",
  "Coupes et barrages",
  "Prêts et clauses",
  "Multijoueur en ligne",
];

function CareerV1Wireframes() {
  const [screenId, setScreenId] = useState("overview");
  const [mode, setMode] = useState<"wireframe" | "mockup">("wireframe");
  const [notice, setNotice] = useState("");
  const selected = SCREENS.find((screen) => screen.id === screenId) ?? SCREENS[0]!;
  const groups = [...new Set(SCREENS.map((screen) => screen.group))];
  const orderedScreens = SCREENS.filter((screen) => screen.id !== "overview");
  const currentIndex = orderedScreens.findIndex((screen) => screen.id === screenId);
  const isMockup = mode === "mockup";
  const shell = isMockup
    ? "border-white/10 bg-[#111923] text-white shadow-2xl"
    : "border-dashed border-slate-400 bg-white text-slate-800";
  const panel = isMockup
    ? "border-white/10 bg-white/[0.045]"
    : "border-dashed border-slate-300 bg-slate-50";
  const muted = isMockup ? "text-slate-400" : "text-slate-500";
  const accent = isMockup ? "text-emerald-300" : "text-slate-600";
  function selectScreen(id: string) {
    setScreenId(id);
    setNotice("");
  }

  function moveScreen(direction: number) {
    const index = currentIndex < 0 ? 0 : currentIndex;
    const next =
      orderedScreens[(index + direction + orderedScreens.length) % orderedScreens.length]!;
    selectScreen(next.id);
  }

  return (
    <main className="min-h-dvh bg-[#0c1118] px-3 py-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1680px]">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              Online Manager · carrière solo V1
            </p>
            <h1 className="mt-1 font-display text-2xl font-black uppercase sm:text-3xl">
              Structure et wireframes
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              Vue d’ensemble et 21 écrans V1 détaillés. Utilise le menu pour explorer le parcours.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/5"
          >
            <ArrowLeft size={16} aria-hidden /> Retour au jeu
          </Link>
        </header>

        <div className="grid gap-4 xl:grid-cols-[245px_minmax(0,1fr)_275px]">
          <nav
            className="max-h-[calc(100dvh-9rem)] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] p-3"
            aria-label="Structure des écrans de carrière"
          >
            <button
              type="button"
              aria-current={screenId === "overview" ? "page" : undefined}
              onClick={() => selectScreen("overview")}
              className={`mb-3 w-full rounded-lg px-3 py-2 text-left text-sm font-bold ${screenId === "overview" ? "bg-emerald-300 text-slate-950" : "text-slate-200 hover:bg-white/5"}`}
            >
              Vue d’ensemble V1
            </button>
            {groups.map((group) => (
              <div key={group} className="mb-4">
                <p className="px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-slate-500">
                  {group}
                </p>
                {SCREENS.filter((screen) => screen.group === group).map((screen) => (
                  <button
                    key={screen.id}
                    type="button"
                    aria-current={screenId === screen.id ? "page" : undefined}
                    onClick={() => selectScreen(screen.id)}
                    className={`mt-1 w-full rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition-colors ${screenId === screen.id ? "bg-emerald-300 text-slate-950" : "text-slate-300 hover:bg-white/5"}`}
                  >
                    {screen.title}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <section className="min-w-0">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  {selected.group}
                </p>
                <h2 className="mt-1 text-xl font-bold">{selected.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{selected.purpose}</p>
              </div>
              <div
                className="flex rounded-lg border border-white/15 p-1"
                role="group"
                aria-label="Mode d’affichage"
              >
                <button
                  type="button"
                  aria-pressed={mode === "wireframe"}
                  onClick={() => setMode("wireframe")}
                  className={`rounded-md px-3 py-1.5 text-sm font-bold ${mode === "wireframe" ? "bg-white text-slate-950" : "text-slate-300"}`}
                >
                  Wireframe
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "mockup"}
                  onClick={() => setMode("mockup")}
                  className={`rounded-md px-3 py-1.5 text-sm font-bold ${mode === "mockup" ? "bg-emerald-300 text-slate-950" : "text-slate-300"}`}
                >
                  Aperçu visuel
                </button>
              </div>
            </div>

            <div className={`min-h-[650px] rounded-2xl border-2 p-4 sm:p-6 ${shell}`}>
              <div
                className={`mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${isMockup ? "border-white/10" : "border-dashed border-slate-300"}`}
              >
                <div className="flex items-center gap-2">
                  <Shield size={18} className={accent} aria-hidden />
                  <span className="font-black uppercase tracking-wide">Club sélectionné</span>
                  <span className={muted}>· Liga · Saison 2026-27</span>
                </div>
                <div className={`flex items-center gap-4 text-xs ${muted}`}>
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} aria-hidden /> Samedi · 15 août
                  </span>
                  <span>Carrière locale</span>
                </div>
              </div>

              {screenId === "overview" ? (
                <Overview
                  groups={groups}
                  screens={SCREENS.filter((screen) => screen.id !== "overview")}
                  notV1={NOT_V1}
                  panel={panel}
                  muted={muted}
                  accent={accent}
                  onSelect={selectScreen}
                />
              ) : (
                <>
                  <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {selected.metrics.map(([label, value]) => (
                      <div key={label} className={`rounded-xl border p-3 ${panel}`}>
                        <p className={`text-xs uppercase tracking-wide ${muted}`}>{label}</p>
                        <p className="mt-1 font-display text-lg font-bold">{value}</p>
                      </div>
                    ))}
                  </div>

                  <section className={`overflow-hidden rounded-xl border ${panel}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/10 px-4 py-3">
                      <h3 className="font-bold">{selected.tableTitle}</h3>
                      <span className={`text-xs ${muted}`}>
                        Exemple de structure · données de démonstration
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[620px] text-left text-sm">
                        <thead>
                          <tr
                            className={`border-b border-current/10 text-xs uppercase tracking-wide ${muted}`}
                          >
                            {selected.columns.map((column) => (
                              <th key={column} className="px-3 py-3 font-bold">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selected.rows.map((row, rowIndex) => (
                            <tr
                              key={`${row[0]}-${rowIndex}`}
                              className="border-b border-current/5 last:border-0"
                            >
                              {row.map((value, cellIndex) => (
                                <td
                                  key={`${value}-${cellIndex}`}
                                  className={`px-3 py-3 ${cellIndex === 0 ? "font-semibold" : muted}`}
                                >
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className={`mt-4 rounded-xl border p-4 ${panel}`}>
                    <h3 className="font-bold">Décisions et actions disponibles</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.actions.map((action, index) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() =>
                            setNotice(`${action} · action représentée par le wireframe.`)
                          }
                          className={`rounded-lg px-3 py-2 text-sm font-semibold ${index === 0 ? action : `border ${panel}`}`}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </section>
                  {notice ? (
                    <p
                      role="status"
                      className="mt-3 rounded-lg bg-emerald-300/10 p-3 text-sm text-emerald-100"
                    >
                      {notice}
                    </p>
                  ) : null}
                </>
              )}

              <div
                className={`mt-5 flex items-center justify-between border-t pt-4 ${isMockup ? "border-white/10" : "border-dashed border-slate-300"}`}
              >
                <button
                  type="button"
                  onClick={() => moveScreen(-1)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${panel}`}
                >
                  <ArrowLeft size={15} aria-hidden /> Précédent
                </button>
                <span className={`text-xs ${muted}`}>
                  {screenId === "overview"
                    ? "Plan global · 21 écrans V1"
                    : `Écran ${currentIndex + 1} sur ${orderedScreens.length}`}
                </span>
                <button
                  type="button"
                  onClick={() => moveScreen(1)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${panel}`}
                >
                  Suivant <ArrowRight size={15} aria-hidden />
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-3">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                Fonction de l’écran
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{selected.purpose}</p>
            </section>
            {screenId !== "overview" ? (
              <>
                <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                    Structure à prévoir
                  </p>
                  <h3 className="mt-2 font-bold">{selected.sideTitle}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{selected.sideText}</p>
                </section>
                <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                    Étape suivante
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{selected.next}</p>
                </section>
              </>
            ) : null}
            <section className="rounded-2xl border border-amber-300/20 bg-amber-200/[0.05] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
                Prototype de parcours
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Ces écrans expliquent la structure fonctionnelle. Ils ne créent pas encore de
                sauvegarde et leurs actions sont illustratives.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Overview({
  groups,
  screens,
  notV1,
  panel,
  muted,
  accent,
  onSelect,
}: {
  groups: string[];
  screens: WireframeScreen[];
  notV1: string[];
  panel: string;
  muted: string;
  accent: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <section className={`rounded-xl border p-4 ${panel}`}>
        <p className={`text-xs font-bold uppercase tracking-[0.18em] ${accent}`}>
          Boucle principale de carrière
        </p>
        <div className="mt-3 grid gap-2 md:grid-cols-6">
          {[
            "Créer partie",
            "Hub du club",
            "Gérer l’équipe",
            "Préparer & jouer",
            "Bilan / progression",
            "Avancer au prochain jour",
          ].map((step, index) => (
            <div
              key={step}
              className={`flex min-h-20 items-center justify-center rounded-lg border p-3 text-center text-sm font-semibold ${panel}`}
            >
              <span>
                <span className={`mb-1 block text-xs ${muted}`}>0{index + 1}</span>
                {step}
              </span>
            </div>
          ))}
        </div>
        <p className={`mt-3 text-xs ${muted}`}>
          La boucle continue jusqu’à la fin de saison : bilan, contrats, progression, jeunes et
          nouvelle campagne.
        </p>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.18em] ${accent}`}>
              Carte des écrans
            </p>
            <h3 className="mt-1 text-lg font-bold">21 écrans inclus en V1</h3>
          </div>
          <p className={`text-xs ${muted}`}>Sélectionne une carte pour voir son wireframe.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {groups.map((group) => {
            const entries = screens.filter((screen) => screen.group === group);
            if (!entries.length) return null;
            return (
              <section key={group} className={`rounded-xl border p-3 ${panel}`}>
                <h4 className="mb-2 px-1 text-sm font-bold uppercase tracking-wide">{group}</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {entries.map((screen) => (
                    <button
                      key={screen.id}
                      type="button"
                      onClick={() => onSelect(screen.id)}
                      className={`rounded-lg border p-3 text-left transition-colors hover:border-emerald-300/70 ${panel}`}
                    >
                      <span className="block text-sm font-semibold">{screen.title}</span>
                      <span className={`mt-1 block text-xs leading-5 ${muted}`}>
                        {screen.purpose}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-amber-300/20 bg-amber-200/[0.05] p-4">
        <h3 className="font-bold text-amber-100">Hors V1 · phases suivantes</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {notV1.map((item) => (
            <span
              key={item}
              className="rounded-lg border border-amber-200/20 px-3 py-2 text-sm text-slate-300"
            >
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

export { CareerV1Wireframes };
