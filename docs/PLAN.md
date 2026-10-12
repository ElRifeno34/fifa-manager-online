# Plan du projet

Jeu de gestion de football multijoueur : une **ligue privée entre amis** où chaque joueur gère un club,
avec des matchs simulés et visualisés en **2D**. Plateforme : **web d'abord, puis desktop (Tauri)**.

Ambition : démarrer comme projet perso (MVP jouable entre amis), garder une architecture qui permette
d'évoluer vers un vrai produit.

## Concept

- **Ligue privée** : un ami crée la ligue, invite les autres via un code. Chaque humain gère un club,
  les places restantes sont tenues par l'IA.
- **Saison** : calendrier aller-retour, journées à heures fixes. Chacun règle compo + tactique avant
  la deadline.
- **Match** : simulé côté serveur (moteur déterministe), regardé en 2D en direct ou en replay.
- **Plus tard** : transferts entre amis, entraînement, blessures, finances, coupe.

## Phases

| Phase                   | Contenu                                                                               | Livrable                           |
| ----------------------- | ------------------------------------------------------------------------------------- | ---------------------------------- |
| **0. Fondations**       | Monorepo, CI, auth, base de données, wireframes, design system                        | On peut se connecter               |
| **1. Données**          | Génération de clubs et joueurs (attributs, postes, notes)                             | Effectifs jouables                 |
| **2. Moteur headless**  | Simulation par événements, tests, calibration statistique                             | Scores réalistes en CLI            |
| **3. Ligue**            | Création/invitation, calendrier, compo/tactique, classement                           | **MVP jouable entre amis** (texte) |
| **4. Visualisation 2D** | Couche chorégraphie, rendu PixiJS, direct + replay                                    | Les matchs se regardent            |
| **5. Profondeur**       | Transferts, entraînement, blessures, finances, coupe, changements tactiques en direct | Saison complète                    |
| **6. Desktop**          | Packaging Tauri, notifications natives, auto-update                                   | Application installable            |
| **7. Produit**          | Ligues publiques, scalabilité, anti-triche, monétisation                              | Passage à l'échelle                |

## Piste UI (transversale)

UI pensée **desktop d'abord** : layout en panneaux (navigation latérale, contenu, panneau détail),
tableaux riches (tri, filtres, colonnes), raccourcis clavier. Le mobile reste « lisible », pas prioritaire.

| Moment        | Travail UI                                                                     |
| ------------- | ------------------------------------------------------------------------------ |
| Phase 0       | Inventaire des écrans, parcours, wireframes, direction visuelle, design system |
| Phase 1       | Écrans effectif + fiche joueur                                                 |
| Phase 2       | Maquettes haute fidélité des phases 3–4 (le moteur n'a pas d'UI)               |
| Phase 3       | Hub, ligue, calendrier, classement, **éditeur de compo/tactique**              |
| Phase 4       | Visionneuse de match 2D                                                        |
| Avant phase 6 | Passe de polish : animations, accessibilité, états vides/chargement            |

## Phase 0 — détail

- [x] Monorepo npm workspaces (`apps/web`, `packages/engine`)
- [x] Next.js + Tailwind + ESLint + Prettier
- [x] Package moteur avec RNG déterministe + tests Vitest
- [x] CI GitHub Actions (format, lint, typecheck, test, build)
- [ ] Projet Supabase + auth (connexion / inscription)
- [ ] Schéma initial (profils) + migrations
- [ ] Direction visuelle + design system (shadcn/ui)
- [ ] Wireframes des écrans principaux

## Décisions ouvertes

- Direction visuelle (sobre/pro façon FM, colorée façon jeu, rétro…)
- Rythme des matchs (journées à heures fixes proposé)
- Joueurs générés (par défaut) vs base réelle importée pour la ligue privée

## Points d'attention si passage en produit

- « FIFA » est une marque déposée : renommer avant toute sortie publique.
- Vrais joueurs/clubs sous licence : joueurs générés par défaut.
