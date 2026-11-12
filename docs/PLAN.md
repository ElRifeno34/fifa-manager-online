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
| **2. Moteur headless**  | Simulation par événements, tests, ajustement sur la saison réelle 2026-27                          | Scores réalistes en CLI    |
| **3. Carrière v1**      | Saisons et montées-descentes, entraînement, transferts, finances, discussions, écrans, sauvegardes | **V1 jouable en solo**     |
| **4. Visualisation 2D** | Couche chorégraphie, rendu PixiJS, replay                                                          | Les matchs se regardent    |
| **5. Profondeur**       | Coupes, barrages, prêts et clauses, tactique en direct, contenu IA                                 | Monde plus riche           |
| **6. Publication**      | Licences ou pack fictif, tests sur appareils, stores iOS/Android, desktop éventuel                 | App sur les stores         |
| **7. Online**           | Serveur, base de données, comptes, ligues privées entre amis, journées planifiées                  | **Multijoueur entre amis** |
| **8. Produit**          | Ligues publiques, scalabilité, anti-triche, monétisation sans pay-to-win                           | Passage à l'échelle        |

## Piste UI (transversale)

UI **mobile paysage**, tactile, **sobre et pro**, inspirée de FIFA 16 Carrière et PES 2021 Master
League (détails dans [GAME_DESIGN.md](GAME_DESIGN.md#10-direction-artistique)).

| Moment        | Travail UI                                                                           |
| ------------- | ------------------------------------------------------------------------------------ |
| Phase 0       | Design system Figma, maquettes des 4 écrans clés (hub, effectif, compo, match 2D)    |
| Phase 1       | Écrans effectif + fiche joueur                                                       |
| Phase 2       | Maquettes des autres écrans de la v1 (le moteur n'a pas d'UI)                        |
| Phase 3       | Menu, sauvegardes, hub, **compo**, entraînement, transferts, discussions, classement |
| Phase 4       | Visionneuse de match 2D                                                              |
| Avant phase 6 | Finition : animations, accessibilité, états vides et de chargement, tests appareils  |

## Phase 3 en détail (v1)

Un nouveau package `packages/career`, sans interface, porte la logique de carrière : déterministe,
sauvegardable, simulable en accéléré comme le moteur. L'app ne fait qu'afficher et transmettre les
décisions.

1. **Noyau de carrière** (fait) : état de la partie, calendrier au jour près, boîte de
   réception, sauvegarde, boucle de saison, fin de saison, montées et descentes entre D1 et D2.
2. **Vie de l'effectif** (fait) : moral, personnalité, contrats, finances, blessures, suspensions.
3. **Entraînement** (fait) : plan hebdomadaire, progression, familiarité tactique (entrée du
   moteur).
4. **Transferts** (fait) : marché, négociation avec contre-offres, prolongations, mercato de l'IA.
5. **Discussions** (fait) : joueurs, adjoint, direction ; promesses, confiance, licenciement.
6. **Équilibrage** (fait) : économie, marché, niveaux, buts et blessures vérifiés sur 6 à 8
   saisons simulées.
7. **Écrans** sur la DA, commencés dès l'étape 1 : nouvelle partie, hub, effectif, compo,
   entraînement, transferts, discussions, match en texte, classement, fin de saison.

## Phase 0 en détail

- [x] Monorepo npm workspaces (`apps/web`, `packages/engine`)
- [x] Vite + React + Tailwind + oxlint + Prettier
- [x] Package moteur avec RNG déterministe + tests Vitest
- [x] CI GitHub Actions (format, lint, typecheck, test, build)
- [x] Motion installé, composant d'apparition des sections
- [x] Capacitor (iOS + Android) configuré en paysage, projets natifs générés (compilation iOS à valider sur macOS/Xcode)
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
- **Packs réels 2026-27 pour 20 championnats**, générés à partir de sources gratuites et non
  versionnés (dépôt public).
- La Belgique est déjà couverte par `pro-league-2026-27`. Le Danemark existe déjà par
  `superligaen-2026-27`. Les nouveaux packs demandés sont l'Écosse, la Suède, l'Argentine, le
  Mexique et le Maroc; leurs sources brutes et leurs calendriers doivent être contrôlés avant
  publication d'un pack jouable.
- **Simulation rapide** de plusieurs journées.
- **V1 élargie** : transferts, entraînement et discussions (joueurs, adjoint, direction) font
  partie de la première version, avec montées et descentes entre D1 et D2 dans cinq pays et une
  négociation avec contre-offres. La visionneuse 2D vient juste après (phase 4).
- **Personnalités libres** pour les vrais joueurs dans les discussions, limitées au monde du jeu.
- **Moteur en TypeScript**, pas en C : le même code tourne dans l'app et, plus tard, sur le
  serveur online, ce qui garantit des replays identiques. Une saison se simule en moins d'une
  seconde sur ordinateur.
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

## Couverture des compétitions UEFA

Pour les qualifications de la saison 2026-27, la liste des accès est déterminée par le coefficient
des associations sur les cinq saisons précédentes. Le classement 2026-27 en cours évolue chaque
semaine; il sert à suivre la prochaine répartition, pas à remplacer le classement de référence déjà
utilisé pour une saison démarrée. Sources: [classements UEFA](https://www.uefa.com/nationalassociations/uefarankings/)
et [liste d'accès 2026-27](https://www.uefa.com/nationalassociations/uefarankings/accesslist/uefachampionsleague/).

Parmi les vingt premières associations du classement live consulté le 11 novembre 2026, les packs
existants couvrent l'Angleterre, l'Italie, l'Espagne, l'Allemagne, la France, le Portugal, la
Belgique, les Pays-Bas, la Turquie, la Grèce et le Danemark. L'Écosse est en préparation. Pour
compléter cette tranche, ajouter dans cet ordre de priorité la Pologne, la Tchéquie, la Norvège,
Chypre, la Suisse, la Hongrie, l'Autriche et la Croatie. La Roumanie (22e dans ce relevé) peut suivre.
Le rang exact est variable: conserver les coefficients et les règles d'accès dans des données
versionnées par saison plutôt que les coder en dur.

Cette sélection est une couverture de départ, pas une représentation complète des trois coupes:
les 55 associations UEFA ont des clubs qualifiables. Le système devra aussi modéliser les coupes
nationales, les positions qualificatives, les tours préliminaires, les têtes de série, les
repêchages/réallocations et les changements d'accès dus aux vainqueurs européens.

Les formats domestiques doivent être décrits par compétition, avant de prétendre simuler une saison
réelle: split écossais/danois, phases et play-offs argentins et mexicains, saison suédoise sur l'année
civile. Le calendrier double aller-retour générique ne représente pas ces formats.
