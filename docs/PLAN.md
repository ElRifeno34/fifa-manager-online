# Plan du projet

Jeu de gestion de football avec matchs simulés et visualisés en **2D**.

1. **D'abord une version offline, en solo** : un joueur gère un club contre des clubs IA, avec les
   sauvegardes en local.
2. **Ensuite une version online** : une ligue privée entre amis, où chaque humain gère un club.

Plateforme : **web d'abord, puis desktop (Tauri)**. Ambition : un projet perso au départ, avec une
architecture qui permette d'évoluer vers un vrai produit.

## Concept offline (solo)

- **Carrière** : choisir un club dans une ligue générée, les autres clubs sont gérés par l'IA.
- **Saison** : calendrier aller-retour. Avant chaque journée, on règle compo et tactique, puis on
  avance.
- **Match** : simulé localement par le moteur déterministe, regardé en 2D ou résumé en texte.
- **Sauvegardes** : plusieurs emplacements, avec export/import de fichier.
- **Plus tard** : transferts, entraînement, blessures, finances, coupe.

## Concept online (après)

- **Ligue privée** : un ami crée la ligue et invite les autres avec un code. Les places restantes vont
  à l'IA.
- **Journées à heures fixes** : chacun règle sa compo avant la date limite, et le serveur simule.
- **Même logique de jeu** que l'offline : seul le stockage change (voir [ARCHITECTURE.md](ARCHITECTURE.md)).

## Phases

| Phase                   | Contenu                                                                        | Livrable                   |
| ----------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| **0. Fondations**       | Monorepo, CI, design system, wireframes                                        | Base technique + maquettes |
| **1. Données**          | Génération de clubs et joueurs (attributs, postes, notes)                      | Effectifs jouables         |
| **2. Moteur headless**  | Simulation par événements, tests, calibration statistique                      | Scores réalistes en CLI    |
| **3. Carrière offline** | Nouvelle partie, calendrier, compo/tactique, classement, sauvegardes locales   | **MVP jouable en solo**    |
| **4. Visualisation 2D** | Couche chorégraphie, rendu PixiJS, replay                                      | Les matchs se regardent    |
| **5. Profondeur**       | Transferts, entraînement, blessures, finances, coupe, tactique en direct       | Saison complète            |
| **6. Desktop**          | Packaging Tauri, sauvegardes sur fichier, auto-update                          | Application installable    |
| **7. Online**           | Serveur, base de données, auth, ligues privées entre amis, journées planifiées | **Multijoueur entre amis** |
| **8. Produit**          | Ligues publiques, scalabilité, anti-triche, monétisation                       | Passage à l'échelle        |

## Piste UI (transversale)

UI pensée **desktop d'abord** : layout en panneaux (navigation latérale, contenu, panneau détail),
tableaux riches (tri, filtres, colonnes), raccourcis clavier. Sur mobile, le site reste lisible sans
être prioritaire.

| Moment        | Travail UI                                                                     |
| ------------- | ------------------------------------------------------------------------------ |
| Phase 0       | Inventaire des écrans, parcours, wireframes, direction visuelle, design system |
| Phase 1       | Écrans effectif + fiche joueur                                                 |
| Phase 2       | Maquettes haute fidélité des phases 3–4 (le moteur n'a pas d'UI)               |
| Phase 3       | Menu principal, sauvegardes, hub, calendrier, classement, **éditeur de compo** |
| Phase 4       | Visionneuse de match 2D                                                        |
| Avant phase 6 | Passe de finition : animations, accessibilité, états vides et de chargement    |

## Phase 0 en détail

- [x] Monorepo npm workspaces (`apps/web`, `packages/engine`)
- [x] Vite + React + Tailwind + oxlint + Prettier
- [x] Package moteur avec RNG déterministe + tests Vitest
- [x] CI GitHub Actions (format, lint, typecheck, test, build)
- [ ] Direction visuelle + design system (shadcn/ui)
- [ ] Wireframes des écrans principaux

## Décisions prises

- Offline solo d'abord, online ensuite (pas de hot-seat).
- Vite + React plutôt que Next.js : app 100 % côté client, build statique compatible Tauri.
- Logique de jeu indépendante du stockage, pour réutiliser le même code en online.

## Décisions ouvertes

- Direction visuelle (sobre et pro façon FM, colorée façon jeu, rétro…)
- Joueurs générés (par défaut) ou base réelle importée

## Points d'attention avant de passer en produit

- « FIFA » est une marque déposée : il faudra renommer avant toute sortie publique.
- Les vrais joueurs et clubs sont sous licence : joueurs générés par défaut.
