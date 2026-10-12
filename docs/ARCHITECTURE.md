# Architecture

## Vue d'ensemble

```
apps/
  web/            Next.js (App Router) + Tailwind — UI web, future coquille Tauri
packages/
  engine/         Moteur de match en TypeScript pur, partagé client/serveur
docs/             Plan, architecture, décisions
```

À venir : `apps/worker` (planification des journées, simulation), `apps/desktop` (Tauri),
`supabase/` (migrations SQL).

## Stack

| Couche   | Choix                                       |
| -------- | ------------------------------------------- |
| Langage  | TypeScript partout, monorepo npm workspaces |
| Web      | Next.js + Tailwind (+ shadcn/ui)            |
| Rendu 2D | PixiJS                                      |
| Backend  | Supabase (Postgres, auth, realtime)         |
| Worker   | Node + jobs planifiés                       |
| Desktop  | Tauri (Electron en plan B)                  |
| Tests    | Vitest                                      |

## Moteur de match

Principes non négociables :

1. **Déterministe** : `simulate(seed, inputs)` produit toujours le même match. Toute l'aléatoire passe
   par `createRng(seed)` — jamais `Math.random()`.
2. **Pur** : aucune dépendance au DOM, au réseau ou à l'horloge. Tourne à l'identique dans le worker
   et dans le navigateur.
3. **Le serveur fait foi** : le worker simule et stocke le résultat ; le client peut rejouer la même
   simulation à partir de la seed et des compos pour la visualisation.

Deux couches :

- **Moteur d'événements** : chaîne de possession (passe, dribble, tir, faute…) avec coordonnées de
  balle, probabilités pondérées par attributs et tactiques.
- **Chorégraphie** : positions des 22 joueurs dérivées de la formation, de la balle et de la phase
  de jeu ; le client interpole entre les instants clés.
