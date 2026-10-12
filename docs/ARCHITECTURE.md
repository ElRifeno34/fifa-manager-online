# Architecture

## Vue d'ensemble

```
apps/
  web/            Vite + React + Tailwind : UI, et plus tard coquille Tauri
packages/
  engine/         Moteur de match en TypeScript pur
docs/             Plan, architecture, décisions
```

À venir :

- `packages/game` : logique de jeu (carrière, calendrier, compos, classement…), en TypeScript pur
- `apps/desktop` : coquille Tauri (phase 6)
- `apps/server` : API + jobs planifiés pour la version online (phase 7)

## Stack

| Couche           | Choix                                       |
| ---------------- | ------------------------------------------- |
| Langage          | TypeScript partout, monorepo npm workspaces |
| UI               | Vite + React + Tailwind (+ shadcn/ui)       |
| Rendu 2D         | PixiJS                                      |
| Stockage offline | IndexedDB (web), fichiers (desktop)         |
| Desktop          | Tauri (Electron en plan B)                  |
| Online (phase 7) | Serveur Node + Postgres (Supabase envisagé) |
| Tests            | Vitest                                      |

## Principe clé : un même jeu, offline puis online

La logique de jeu ne sait pas où vivent les données. Elle dépend d'une interface de stockage :

```
          UI (apps/web)
               │
        packages/game  ──►  interface de stockage
               │                  │
        packages/engine     ┌─────┴──────────────┐
                            │                    │
                   IndexedDB / fichier     Base de données
                      (offline)              (online, serveur)
```

- **Offline** : `packages/game` tourne dans le navigateur ou dans Tauri, avec un adaptateur local.
- **Online** : le même `packages/game` tourne sur le serveur avec un adaptateur base de données ; l'UI
  passe par l'API.

Conséquence : `packages/game` et `packages/engine` n'importent jamais rien de React, du DOM, du réseau
ou d'une base de données.

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
