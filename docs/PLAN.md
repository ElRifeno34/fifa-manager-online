# Plan du projet — Online Manager

Jeu de gestion de football **mobile (paysage)**, avec de vrais clubs et joueurs, des matchs simulés
et visualisés en **2D**, et du contenu raconté par IA. Le game design complet est dans
[GAME_DESIGN.md](GAME_DESIGN.md).

1. **D'abord une version offline, en solo** : un joueur gère un club contre des clubs IA, avec les
   sauvegardes sur le téléphone.
2. **Ensuite une version online** : une ligue privée entre amis, où chaque humain gère un club.

Plateforme : **iOS et Android via Capacitor**, desktop éventuel plus tard. Ambition : un projet perso
au départ, avec une architecture qui permette d'évoluer vers un vrai produit.

## Outils

| Outil           | Rôle                                                                  |
| --------------- | --------------------------------------------------------------------- |
| **Figma**       | Direction artistique, design system, maquettes des écrans             |
| **Lovable**     | Génération des écrans React à partir des maquettes, données factices  |
| **Claude Code** | Moteur de match, logique de jeu, packs de données, tests, intégration |
| **Replit**      | Hébergement du relais IA, puis du serveur online (phase 7)            |

Règle : [GAME_DESIGN.md](GAME_DESIGN.md) est la référence. Chaque prompt Lovable cible un seul
écran et cite la section concernée.

Liens :

- Figma (DA, design system, maquettes) : <https://www.figma.com/design/ozAmyUH17jLIZyM1f7nNYE>
- Lovable (prototype des écrans) : <https://lovable.dev/projects/f47bb220-b1c6-4061-b2d6-4594a960bef9>

## Phases

| Phase                   | Contenu                                                                                            | Livrable                   |
| ----------------------- | -------------------------------------------------------------------------------------------------- | -------------------------- |
| **0. Fondations**       | Monorepo, CI, Capacitor, DA + design system Figma, maquettes                                       | Base technique + maquettes |
| **1. Données**          | Format des packs, pack de développement réel, écrans effectif et fiche joueur                      | Effectifs réels chargés    |
| **2. Moteur headless**  | Simulation par événements, tests, calibration statistique                                          | Scores réalistes en CLI    |
| **3. Carrière offline** | Nouvelle partie, calendrier, compo/tactique, classement, simulation rapide, sauvegardes, résumé IA | **MVP jouable en solo**    |
| **4. Visualisation 2D** | Couche chorégraphie, rendu PixiJS, replay                                                          | Les matchs se regardent    |
| **5. Profondeur**       | Transferts, blessures, finances, coupe, tactique en direct, plus de contenu IA                     | Saison complète            |
| **6. Publication**      | Licences ou pack fictif, tests sur appareils, stores iOS/Android, desktop éventuel                 | App sur les stores         |
| **7. Online**           | Serveur, base de données, comptes, ligues privées entre amis, journées planifiées                  | **Multijoueur entre amis** |
| **8. Produit**          | Ligues publiques, scalabilité, anti-triche, monétisation sans pay-to-win                           | Passage à l'échelle        |

## Piste UI (transversale)

UI **mobile paysage**, tactile, **sobre et pro**, inspirée de FIFA 16 Carrière et PES 2021 Master
League (détails dans [GAME_DESIGN.md](GAME_DESIGN.md#10-direction-artistique)).

| Moment        | Travail UI                                                                          |
| ------------- | ----------------------------------------------------------------------------------- |
| Phase 0       | Design system Figma, maquettes des 4 écrans clés (hub, effectif, compo, match 2D)   |
| Phase 1       | Écrans effectif + fiche joueur                                                      |
| Phase 2       | Maquettes des autres écrans du MVP (le moteur n'a pas d'UI)                         |
| Phase 3       | Menu, sauvegardes, hub, calendrier, classement, **compo**, simulation rapide        |
| Phase 4       | Visionneuse de match 2D                                                             |
| Avant phase 6 | Finition : animations, accessibilité, états vides et de chargement, tests appareils |

## Phase 0 en détail

- [x] Monorepo npm workspaces (`apps/web`, `packages/engine`)
- [x] Vite + React + Tailwind + oxlint + Prettier
- [x] Package moteur avec RNG déterministe + tests Vitest
- [x] CI GitHub Actions (format, lint, typecheck, test, build)
- [x] Motion installé, composant d'apparition des sections
- [ ] Capacitor (iOS + Android) configuré en paysage
- [x] Design system Figma v0.1 (couleurs, typos, espacements, 6 composants)
- [x] Maquette du hub du club (Figma) + prototype Lovable
- [ ] Maquettes des 3 autres écrans clés (effectif, compo et tactique, match 2D)

## Décisions prises

- Nom de travail : **Online Manager** (à rediscuter).
- Offline solo d'abord, online ensuite (pas de hot-seat).
- **Mobile d'abord, en paysage**, via **Capacitor** ; desktop éventuel ensuite.
- Vite + React : une seule base de code web pour mobile, navigateur et desktop.
- Logique de jeu indépendante du stockage, pour réutiliser le même code en online.
- **Vrais clubs et joueurs**, chargés depuis des **packs de données** séparés du code.
- **Simulation rapide** de plusieurs journées.
- **Médias générés par IA** : unes et articles des **vrais journaux sportifs de chaque pays**, et
  **réseaux sociaux fictifs** inspirés de Twitter/X et Instagram. Via un relais serveur, avec
  textes modèles hors connexion.
- **Pas de pay-to-win.**
- DA **sobre et pro**, inspirée de FIFA 16 Carrière et PES 2021 Master League.

## Points d'attention avant publication

- Le nom « Online Manager » est proche d'_Online Soccer Manager_ (OSM), jeu mobile existant.
- Les vrais clubs, joueurs, blasons et photos nécessitent des licences : Apple et Google retirent les
  apps qui les utilisent sans autorisation. Sans licence, publier avec un pack fictif.
- « FIFA » ne doit apparaître nulle part dans l'app publiée (le nom du repo peut rester).
