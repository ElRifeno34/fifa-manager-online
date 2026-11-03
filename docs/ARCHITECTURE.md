# Architecture

## Vue d'ensemble

```
apps/
  web/            Vite + React + Tailwind : l'UI du jeu, emballée en app mobile par Capacitor
packages/
  engine/         Moteur de match en TypeScript pur
docs/             Plan, game design, architecture
```

À venir :

- `packages/game` : logique de jeu (carrière, calendrier, compos, classement…), en TypeScript pur
- `packages/data` : format des packs de données (schéma + validation) et pack de développement
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
- Le schéma est défini et validé dans `packages/data` (à écrire en phase 1).
- Au lancement d'une partie, le pack est copié dans la sauvegarde : une carrière ne casse pas si le
  pack est mis à jour ensuite.
- Le jeu peut charger un pack fourni avec l'app ou importé par le joueur.

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
