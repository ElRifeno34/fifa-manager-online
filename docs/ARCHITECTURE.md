# Architecture

## Vue d'ensemble

```
apps/
  web/            Vite + React + Tailwind : l'UI du jeu, emballée en app mobile par Capacitor
packages/
  engine/         Moteur de match en TypeScript pur
  data/           Schéma des packs de données et scripts d'import
docs/             Plan, game design, architecture
data/             Sources brutes et packs générés (ignoré par git)
```

À venir :

- `packages/game` : logique de jeu (carrière, calendrier, compos, classement…), en TypeScript pur
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
        packages/game  ──►  interface de stockage
               │                  │
        packages/engine     ┌─────┴───────────┬────────────────┐
                            │                 │                │
                     SQLite (mobile)   IndexedDB (dev)   Base de données
                         offline          offline        (online, serveur)
```

- **Offline** : `packages/game` tourne dans l'app avec un adaptateur local.
- **Online** : le même `packages/game` tourne sur le serveur avec un adaptateur base de données ; l'UI
  passe par l'API.

Conséquence : `packages/game` et `packages/engine` n'importent jamais rien de React, du DOM, de
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
- **Écart de niveau :** son effet sature, pour qu'un gros écart pèse sans tout décider. Les très
  gros écarts restent sans doute un peu trop marqués : le PSG bat l'OM plus de 8 fois sur 10 au
  Parc, avec 26 tirs contre 7.
- **Réglages :** les paramètres sont regroupés dans `TUNING` (`match.ts`). `npm run calibrate`
  simule des saisons sur les packs réels et compare le résultat aux cibles de
  [GAME_DESIGN.md](GAME_DESIGN.md#objectifs-de-calibration-à-vérifier-en-phase-2-sur-des-milliers-de-matchs).

Résultat sur les 20 championnats (5 saisons chacun) :

| Mesure                         | Cible              | Moteur             |
| ------------------------------ | ------------------ | ------------------ |
| Buts par match                 | 2,5 à 2,9          | 2,64               |
| Domicile / nul / extérieur     | 45 % / 27 % / 28 % | 46 % / 27 % / 27 % |
| Tirs par équipe                | 10 à 15            | 10 à 17            |
| Victoire du favori (5+ points) | 65 à 75 %          | 65 %               |

Une saison de 380 matchs prend 0,5 à 1 seconde sur ordinateur. Les gros clubs finissent en haut,
avec des surprises : le PSG est toujours champion, le Bayern finit 2e en moyenne, et la Liga se
joue entre le Real, le Barça et l'Atlético. Les meilleurs buteurs marquent 20 à 30 buts.

`npm run play -- <championnat> [domicile extérieur]` joue un match ou une saison dans le terminal.

Pas encore fait : la couche chorégraphie (phase 4), les blessures et les suspensions (phase 5),
les changements tactiques en cours de match.
