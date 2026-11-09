# Architecture

## Vue d'ensemble

```
apps/
  web/            Vite + React + Tailwind : l'UI du jeu, emballée en app mobile par Capacitor
packages/
  engine/         Moteur de match en TypeScript pur
  career/         Logique de carrière : calendrier, saisons, montées-descentes, sauvegarde
  data/           Schéma des packs de données et scripts d'import
docs/             Plan, game design, architecture
data/             Sources brutes et packs générés (ignoré par git)
```

À venir :

- `apps/web/ios`, `apps/web/android` : projets natifs générés par Capacitor
- `apps/ai-relay` : petit serveur relais pour le contenu IA (cache la clé d'API)
- `apps/server` : API + jobs planifiés pour la version online (phase 7)

## Stack

| Couche             | Choix                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------- |
| Langage            | TypeScript partout, monorepo npm workspaces                                           |
| UI                 | Vite + React + Tailwind (+ shadcn/ui), mobile paysage                                 |
| App mobile         | **Capacitor** : la même app web emballée pour iOS et Android                          |
| Desktop (éventuel) | Tauri, à partir de la même app web                                                    |
| Rendu 2D           | PixiJS                                                                                |
| Stockage offline   | SQLite via plugin Capacitor sur mobile ; IndexedDB dans le navigateur (développement) |
| Contenu IA         | Claude API, appelée via `apps/ai-relay` (jamais depuis l'app)                         |
| Online (phase 7)   | Serveur Node + Postgres (Supabase envisagé)                                           |
| Tests              | Vitest                                                                                |

Pourquoi SQLite sur mobile : sur iOS, le système peut vider le stockage du navigateur intégré
(IndexedDB) quand l'appareil manque de place. Une base SQLite dans les fichiers de l'app est
plus sûre pour des sauvegardes de carrière.

## Principe clé : un même jeu, offline puis online

La logique de jeu ne sait pas où vivent les données. Elle dépend d'une interface de stockage :

```
          UI (apps/web)
               │
       packages/career ──►  interface de stockage
               │                  │
        packages/engine     ┌─────┴───────────┬────────────────┐
                            │                 │                │
                     SQLite (mobile)   IndexedDB (dev)   Base de données
                         offline          offline        (online, serveur)
```

- **Offline** : `packages/career` tourne dans l'app avec un adaptateur local.
- **Online** : le même `packages/career` tourne sur le serveur avec un adaptateur base de données ; l'UI
  passe par l'API.

Conséquence : `packages/career` et `packages/engine` n'importent jamais rien de React, du DOM, de
Capacitor, du réseau ou d'une base de données.

## Packs de données

Les clubs et joueurs (réels ou fictifs) viennent d'un **pack de données**, jamais du code.

- Un pack = un fichier JSON versionné : métadonnées (nom, version, saison), championnats, clubs,
  joueurs avec leurs attributs, références vers les blasons et photos, et **médias** (journaux par
  pays avec leur ton et leurs clubs favoris).
- Le schéma est défini et validé dans `packages/data/src/schema.ts`.
- Au lancement d'une partie, le pack est copié dans la sauvegarde : une carrière ne casse pas si le
  pack est mis à jour ensuite.
- Le jeu peut charger un pack fourni avec l'app ou importé par le joueur.

### Packs réels 2026-27

Il y a un pack par championnat, soit 20 au total :

- **Premières divisions européennes :** LaLiga, Premier League, Ligue 1, Bundesliga, Serie A,
  Eredivisie, Primeira Liga, Pro League, Superligaen, Süper Lig et Super League grecque.
- **Deuxièmes divisions :** Championship, Ligue 2, 2. Bundesliga, Serie B et LaLiga Hypermotion.
- **Hors d'Europe :** MLS, Série A brésilienne, Saudi Pro League et Qatar Stars League.

Ils sont générés en local, à partir de sources gratuites :

```bash
npm run pack:fetch   # télécharge les sources dans data/raw (--refresh pour relire les effectifs)
npm run pack:build   # écrit data/packs/<pack>.json et un rapport de couverture par championnat
```

Les deux commandes acceptent des identifiants de championnat, par exemple `npm run pack:build -- ligue-1`.

| Donnée                                         | Source                                    |
| ---------------------------------------------- | ----------------------------------------- |
| Liste des clubs, initiales, journaux           | `packages/data/sources/<pack>.json`       |
| Effectifs, numéros, nationalités               | Wikipédia en anglais (pages saison, club) |
| Couleurs                                       | Infobox Wikipédia du club                 |
| Lien entre une page et une fiche Transfermarkt | Wikidata (propriété P2446)                |
| Naissance, pied, taille, poste, valeur         | transfermarkt-datasets (arrêté en 2026)   |
| Matchs, buts, passes décisives 2025-26         | transfermarkt-datasets                    |
| Calendrier                                     | openfootball, sinon généré                |

- openfootball n'a de calendrier que pour sept premières divisions européennes, le Championship et
  le Brésil. Les autres packs ont un aller-retour généré, une journée par semaine
  (`league.fixturesSource`). Les vraies dates, les play-offs et les conférences de la MLS n'y
  figurent pas : la MLS générée compte 58 journées.
- La MLS et le Brésil se jouent sur l'année civile : leurs effectifs viennent des pages « 2026 »
  (`wikipediaSeason`) et le calendrier brésilien est celui de 2026.
- La liste des clubs qataris est déduite de 2025-26, faute de page 2026-27 sur Wikipédia.
- Le niveau vient de la valeur marchande, corrigée par l'âge. Finition, passe et vision réagissent
  aux stats réelles, la force à la taille, la vitesse et l'endurance à l'âge. Le reste est **estimé**
  selon le poste : les sources gratuites n'ont ni tacles, ni duels, ni vitesse.
- transfermarkt-datasets ne suit ni les deuxièmes divisions ni le Qatar : seuls les joueurs passés
  par un championnat suivi ont une valeur (40 à 60 %). Les autres prennent un niveau proche de la
  médiane de leur club. Au Qatar, cette médiane vient surtout des joueurs étrangers et surestime
  sans doute les joueurs locaux.
- Un fichier local `data/exclusions.json` (non versionné) peut écarter des joueurs par nationalité
  à la construction des packs : `{ "nationalities": ["XXX"] }`. Les joueurs écartés sont listés dans
  le rapport du pack.
- Le dépôt étant public, **les packs et les sources brutes ne sont pas versionnés**. Seuls le schéma,
  les scripts et la configuration le sont.
- Ces packs ne sont pas destinés à la publication (voir les licences dans [PLAN.md](PLAN.md)).

## Contenu IA

```
 App (mobile)  ──►  apps/ai-relay  ──►  Claude API
      │                (clé d'API,
      │                 limites d'usage)
      ▼
 Textes modèles (hors connexion ou en cas d'échec)
```

- Après chaque journée, l'app envoie **un seul paquet** : résultats et événements marquants de la
  journée (déjà calculés par le moteur), classement, situation du club, journaux du pays.
- Le relais renvoie, en **JSON structuré**, les unes et articles de chaque journal et les messages du
  fil social. L'app valide ce JSON avant de l'afficher.
- Le relais **filtre** le contenu (insultes, propos attribués à de vraies personnes) avant de le
  renvoyer.
- La génération tourne en arrière-plan ; le contenu est sauvegardé avec la partie.
- En cas d'absence de réseau ou d'erreur, l'app utilise les textes modèles, sans bloquer le joueur.
- Le relais applique des limites par appareil pour maîtriser le coût.

## Moteur de match

Principes non négociables :

1. **Déterministe** : `simulate(seed, inputs)` produit toujours le même match. Tout l'aléatoire passe
   par `createRng(seed)`, jamais par `Math.random()`.
2. **Pur** : aucune dépendance au DOM, au réseau ou à l'horloge. Il tourne à l'identique partout.
3. **En online, le serveur fait foi** : il simule et stocke le résultat ; le client rejoue la même
   simulation à partir de la seed et des compos pour l'afficher.

Deux couches :

- **Moteur d'événements** : chaîne de possession (passe, dribble, tir, faute…) avec les coordonnées
  de la balle, et des probabilités pondérées par les attributs et les tactiques.
- **Chorégraphie** : les positions des 22 joueurs sont dérivées de la formation, de la balle et de la
  phase de jeu ; le client interpole entre les instants clés.

La simulation rapide utilise le même moteur sans la couche chorégraphie : elle doit être assez
rapide pour simuler une saison entière en quelques secondes sur un téléphone.

### Implémentation (phase 2)

Le moteur d'événements est en place dans `packages/engine`, sans interface :

| Module         | Rôle                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| `positions.ts` | Les 5 formations, la pénalité hors poste (−10 % poste voisin, −25 % poste éloigné) |
| `lineup.ts`    | Compo de l'adjoint et de l'IA : meilleure formation, onze, banc, style de jeu      |
| `match.ts`     | `simulateMatch(seed, home, away)` : événements, stats, notes, homme du match       |
| `season.ts`    | Journées, fatigue et forme d'un match à l'autre, classement avec départages        |

- **Un match est une suite de possessions.** Chacune passe par le milieu (relance contre
  récupération), le dernier tiers (attaque contre défense) puis, éventuellement, un tir. Chaque
  étape est un tirage pondéré par les attributs des joueurs concernés, leur poste, leur fatigue et
  leur forme. Les types d'occasion sont la passe en profondeur, le centre, le dribble, la frappe de
  loin, le contre, le corner, le coup franc et le penalty.
- **Tactique :** chaque consigne a un coût et un bénéfice, et aucune n'est la meilleure partout.
  Des tests vérifient les quatre interactions du game design : ligne haute contre attaquants
  rapides, jeu direct contre bloc bas, pressing contre bons passeurs, pressing sans endurance.
- **Fatigue :** elle monte pendant le match, plus vite en pressing haut et pour les joueurs peu
  endurants. Il faut environ trois jours pour récupérer. L'adjoint fait jusqu'à cinq changements
  et laisse au repos les joueurs fatigués.
- **Situation de match :** en fin de match, une équipe qui mène gère et celle qui est menée pousse.
- **IA des clubs :** son style dépend de son rang dans le championnat, pas de sa réputation
  absolue : en deuxième division, les favoris jouent donc aussi la possession. Elle l'adapte à
  l'adversaire, avec plus de prudence face à une équipe nettement plus forte.
- **Écart de niveau :** son effet sature, pour qu'un gros écart pèse sans tout décider.
- **Réglages ajustés sur la réalité :** les paramètres (`TUNING` dans `match.ts`) sont ajustés sur
  la saison réelle 2026-27 de [football-data.co.uk](https://football-data.co.uk) : résultats, tirs,
  corners, fautes, cartons, expected goals et cotes de clôture de 18 championnats (l'Arabie
  saoudite et le Qatar n'y sont pas).

| Commande             | Rôle                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| `npm run benchmark`  | Rejoue chaque match réel de 2026-27, compare avec la réalité et les cotes |
| `npm run tune`       | Ajuste les paramètres sur ces données et affiche les valeurs à reporter   |
| `npm run tune:clubs` | Ajuste le niveau collectif de chaque club sur les cotes de 2026-27        |
| `npm run calibrate`  | Simule des saisons entières : titres, points, classements                 |

Résultat sur 2 382 matchs réels de 2026-27 (40 simulations chacun) :

| Mesure                                    | Réalité          | Moteur           |
| ----------------------------------------- | ---------------- | ---------------- |
| Buts par équipe et par match              | 1,50             | 1,50             |
| Tirs / tirs cadrés par équipe             | 13,8 / 4,6       | 13,8 / 4,5       |
| Corners / fautes / jaunes par équipe      | 4,9 / 12,3 / 2,0 | 4,9 / 12,3 / 2,0 |
| Nuls                                      | 25 %             | 25 %             |
| Favori donné à 30-45 % par les cotes      | 30-45 %          | 40 %             |
| Favori donné à 65-75 % par les cotes      | 65-75 %          | 69 %             |
| Favori donné à plus de 75 % par les cotes | plus de 75 %     | 78 %             |
| Score de Brier (plus bas = mieux)         | 0,590 (cotes)    | 0,604            |

**Niveau collectif des clubs.** La valeur marchande des joueurs ne dit pas tout : entraîneur,
forme, cohésion. `npm run tune:clubs` donne à chaque club un ajustement (`levelAdjustment`, en
pourcentage de tous les attributs, borné à ±25 %) pour que le moteur lui donne autant de points que
les cotes de ses matchs de 2026-27. L'ajustement est centré par championnat : le niveau d'un
championnat reste celui de ses joueurs. Il est stocké dans `data/fit/<pack>.json`, que
`pack:build` réapplique. L'Arabie saoudite et le Qatar, sans cotes, n'en ont pas.

La tendance est nette : la valeur marchande exagère les écarts. Les promus et les petits budgets
montent (Paderborn, Castellón, Le Mans, Lincoln), les clubs riches descendent (Ajax, Porto,
Galatasaray, PSG).

Avec ces ajustements, l'écart moyen aux cotes passe d'environ 11 à 6 points par match, ce qui est
proche du bruit de 40 simulations. Le score de Brier passe de 0,630 à 0,604, contre 0,590 pour les
cotes. Ce gain est mesuré sur les matchs qui ont servi à l'ajustement, il est donc un peu flatteur.
L'ajustement est à relancer au fil de la saison.

Les données de football-data.co.uk sont gratuites pour un **usage privé uniquement**, pas pour un
produit commercial. Elles restent dans `data/raw`, qui n'est pas versionné. Si le jeu est un jour
vendu, cet ajustement devra être vérifié ou refait avec une autre source.

Une saison de 380 matchs prend 0,5 à 1 seconde sur ordinateur. Les gros clubs finissent en haut,
avec des surprises. Les meilleurs buteurs marquent 20 à 35 buts.

`npm run play -- <championnat> [domicile extérieur]` joue un match ou une saison dans le terminal.

Pas encore fait : les blessures, les suspensions, le moral et la familiarité tactique (carrière
v1, phase 3), la couche chorégraphie (phase 4), les changements tactiques en cours de match
(phase 5).

## Carrière (phase 3)

`packages/career` porte la logique de carrière, sans interface. Comme le moteur, elle est
déterministe : la même graine et les mêmes décisions redonnent la même carrière.

- **Un seul objet d'état** (`CareerState`, dans `types.ts`), en JSON pur : date du jour, saison,
  clubs, joueurs (attributs, fatigue, forme, stats de la saison, historique), calendrier de la
  saison, boîte de réception, tables des saisons passées. `saveCareer` et `loadCareer` le sauvent
  et le relisent, avec un numéro de version. Une sauvegarde pèse environ 1 à 1,5 Mo.
- **Le monde d'une carrière** : le championnat du club et, s'il fait partie d'une paire D1/D2, la
  division liée (`worldOf`). Les cinq paires échangent 3 clubs chaque saison.
- **La boucle** :
  - `advance` fait avancer le calendrier jour par jour et joue les journées des autres. Il s'arrête
    le matin du prochain match du joueur, ou en fin de saison.
  - `playToday` joue les matchs du jour avec la compo choisie par le joueur, ou celle de l'adjoint
    avec la tactique du joueur. Il renvoie le match complet pour l'écran d'après-match.
  - `simulateToSeasonEnd` sert à la simulation rapide.
- **Fin de saison** (`season-end.ts`) :
  - tables finales, montées et descentes ;
  - progression vers le potentiel (plus forte pour les jeunes qui jouent), stagnation de 24 à 29
    ans, déclin après 30 ans (vitesse et endurance d'abord) ;
  - retraites dès 33-34 ans, 2 à 4 jeunes générés par club ;
  - nouveau calendrier (aller-retour, une journée par semaine), messages de bilan.
- **Vie de l'effectif** :
  - **Personnalité** cachée (ambition, loyauté, tempérament, professionnalisme), tirée une fois
    pour toutes à partir de l'identifiant du joueur.
  - **Moral** (0 à 100) : il bouge après chaque match selon le résultat et le temps de jeu attendu.
    Le rôle de chacun vient du meilleur onze par poste : un deuxième gardien est remplaçant, pas
    titulaire frustré. Le moral s'ajoute à la forme dans le moteur.
  - **Contrats** (salaire, dernière saison) et **valeur** de marché recalculée chaque été selon le
    niveau et l'âge.
  - **Finances** : revenus déduits de la valeur de l'effectif et de la division, masse salariale
    d'environ 60 % des revenus, frais de fonctionnement d'environ 33 %. Les comptes sont réglés
    chaque semaine. Une relégation baisse les salaires de 30 %.
  - **Blessures** (plus fréquentes avec la fatigue, de quelques jours à plusieurs mois) et
    **suspensions** (rouge, ou 5 jaunes) : ces joueurs sont écartés des compos.
  - **Fin de contrat** : les clubs de l'IA prolongent les joueurs dont ils ont besoin, les autres
    partent libres. Au club du joueur, seuls partent ceux qu'il n'a pas prolongés lui-même ; l'adjoint
    les liste à l'ouverture du mercato d'hiver.
- **Entraînement** (`training.ts`) : une séance par semaine, en milieu de semaine.
  - Le plan (intensité légère, normale ou forte ; thème physique, technique, tactique, coups de
    pied arrêtés ou récupération) vient du joueur, ou de l'adjoint s'il le laisse faire. Les autres
    clubs suivent le même conseil : récupération pour un effectif fatigué, séance légère la veille
    d'un match, tactique quand le système est mal connu, forte intensité seulement avec une semaine
    libre.
  - Effets : progression vers le potentiel (forte avant 21 ans, nulle après 27), renforcée sur le
    thème et sur l'axe individuel du joueur ; fatigue et risque de blessure selon l'intensité.
  - **Familiarité tactique** (0 à 100 par formation et par jeu de consignes) : elle monte à
    l'entraînement et en match, et baisse lentement pour les systèmes délaissés. Le moteur la
    traduit en ±quelques % sur les attributs (`familiarity`, 0,7 par défaut).
  - L'été n'ajoute plus que ce que le temps de jeu apporte : l'entraînement fait l'essentiel de la
    progression. Sur 8 saisons simulées, le niveau moyen reste stable (Ligue 1 vers 75, Ligue 2
    vers 61).
- **Transferts** (`transfers.ts`, `market.ts`) :
  - Deux fenêtres : l'été (jusqu'à deux semaines après la reprise) et un mois en milieu de saison.
    Les joueurs libres signent à tout moment.
  - **Prix demandé** : la valeur du joueur, multipliée par son importance dans son club (de 0,8
    pour un remplaçant à 1,6 pour un joueur clé), et réduite quand son contrat se termine.
  - **Salaire demandé** : le prix du marché selon sa valeur (environ 250 k€ par semaine à 100 M€),
    plus élevé s'il est ambitieux ou si le club est moins prestigieux que le sien, plus bas s'il est
    fidèle et prolonge, ou si on lui promet d'être titulaire.
  - **Négociation** : d'abord l'indemnité avec le club, puis le contrat avec le joueur, trois tours
    au plus chacun. Une offre trop basse est contrée par le prix demandé, une offre proche fait
    couper la poire en deux, et au troisième refus les discussions sont rompues pour 30 jours. La
    direction bloque ce qui dépasse le budget transferts ou la masse salariale.
  - **IA des clubs** : chaque semaine de mercato, un club achète là où il manque de joueurs, ou
    tente d'améliorer son titulaire le plus faible, dans ses budgets (trois recrues au plus par
    fenêtre). Elle fait des offres pour les joueurs du joueur comme pour les autres ; il peut
    accepter, refuser ou demander plus.
  - Le joueur peut aussi prolonger ses joueurs, libérer un joueur contre une indemnité (la moitié
    des salaires restants) et chercher sur le marché par poste, âge, niveau et valeur.
- **Effectifs trop grands** : au-delà de 30 joueurs, un club de l'IA libère les moins utiles.
- **Discussions** (`talk.ts`, `player-talk.ts`, `board.ts`, `assistant.ts`, `conversations.ts`) :
  une conversation a des répliques et des choix de réponse ; `reply` applique la réponse, dont les
  effets sont décidés par les règles. `advance` s'arrête tant qu'une conversation attend une
  réponse ; en simulation rapide, l'adjoint répond à la place du joueur avec la réponse la plus
  neutre.
  - **Joueurs** : au plus un par semaine vient parler. Ce sont soit un remplaçant frustré (temps de
    jeu), soit un titulaire en fin de contrat (une fois par saison), soit un joueur malheureux et
    ambitieux qui veut partir (une fois par saison). D'autres conversations naissent ailleurs :
    après une offre refusée d'un club plus prestigieux, ou quand l'entraîneur félicite ou critique
    un joueur (jugé sur sa forme récente). Le ton dépend du tempérament ; les répliques restent
    dans le monde du jeu.
  - **Promesses** (temps de jeu promis en discussion ou à la signature) : elles sont jugées après
    huit matchs. Tenues, elles remontent le moral ; trahies, elles le font chuter. À la deuxième
    trahison, le joueur demande à partir. Un joueur placé sur la liste des transferts coûte 15 %
    de moins, et les autres clubs le regardent en premier.
  - **Direction** : objectif de la saison selon le rang de l'effectif dans le championnat (titre,
    top 4, première moitié, milieu de tableau, maintien, montée). On peut l'accepter, viser plus
    haut ou demander plus de budget. La confiance suit tous les mois le classement par rapport à
    l'objectif, et les comptes. Sous 35, la direction avertit ; sous 15 en cours de saison, ou
    sous 25 en fin de saison, l'entraîneur est licencié et choisit parmi les offres de clubs moins
    prestigieux. Une saison très au-dessus de l'objectif peut attirer un club plus prestigieux.
  - **Adjoint** : conseils d'avant-match dans la boîte de réception (adversaire, fatigue,
    indisponibles). À la demande, il propose aussi un plan d'entraînement, signale les jeunes à
    suivre, les joueurs à vendre et les contrats qui se terminent, et peut gérer l'entraînement. L'ajustement collectif des clubs (ajusté sur les cotes 2026-27) est divisé
    par deux à chaque saison, car la forme ne dure pas.

`npm run career -- <championnat> <club> [--seasons N]` joue des saisons entières dans le terminal,
l'adjoint dirigeant le club. Une saison de deux divisions (612 matchs) prend environ une seconde.

À surveiller pendant l'équilibrage (étape 6) :

- L'argent ne quitte jamais les deux divisions : sur 8 saisons, la trésorerie médiane de Ligue 1
  passe encore de 15 à 110 M€, et les indemnités montent (jusqu'à 170 M€). Il manque des ventes à
  l'étranger et des revenus liés au classement. Rien n'empêche non plus un club de rester dans le
  rouge.
- 50 à 120 transferts par saison pour 36 clubs, dont peu de joueurs libres : sans doute moins que
  dans la réalité, prêts compris.
- Les joueurs libres (200 à 300) et les retraités restent dans la sauvegarde.
- Les discussions : environ 4 demandes de temps de jeu par saison dans un club du milieu de
  tableau, davantage dans un club en difficulté, où les demandes de départ se multiplient.
