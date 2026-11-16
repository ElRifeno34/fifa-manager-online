# Online Manager — dossier de revue Codex

## Point de départ

Lire [BRIEF.md](BRIEF.md), puis le `AGENTS.md` à la racine avant toute modification. Le code présent dans ce brouillon est la DA à adapter : ne pas repartir de zéro.

- Brouillon : **Mobile paysage · Hub–Effectif–Joueur**.
- Identifiant : `drft_01m7bwfs07f5s8083wh2f3nxse`.
- Branche de brouillon Lovable : `thr_0fj2xkvh426d`.
- Aperçu du brouillon : https://id-preview-1--f47bb220-b1c6-4061-b2d6-4594a960bef9.lovable.app
- Ce dossier prépare la revue ; il ne constitue pas une preuve de push, de création de PR ou d'exécution de Codex.
- Dans `ElRifeno34/fifa-manager-online`, le prototype sera isolé sous `prototypes/online-manager-da/` sur la branche `codex/online-manager-da-2026-11-16`, sans remplacer l'application existante. Consulter aussi les wireframes et documents déjà présents dans le dépôt parent ; ses instructions restent applicables.
- Ne pas fusionner dans la branche principale, accepter le brouillon ni publier.

## Références visuelles incluses

Ces fichiers sont des références de revue, pas des médias à ajouter à l'application ni des licences de réutilisation des marques illustrées.

| Référence | Ce qu'il faut examiner |
| --- | --- |
| [Menu Football Manager](references/image.png) | Présence du coach et regroupement des choix de démarrage. |
| [Hub PES](references/image-2.png) | Navigation gauche, prochain événement central, calendrier et statistiques compactes. |
| [Transferts FIFA](references/image-3.png) | Liste scannable, sélection nette, fiche joueur adjacente. |
| [Hub Figma initial](references/hub-figma.png) | Structure historique du hub, pas sa palette sombre. |
| [Menu v0 Barcelone](references/v0-menu-barcelone.png) | Identité de club et hiérarchie historique. |
| [Stade vif](references/stadium-bg-vivid.jpg) | Stade à conserver derrière l'espace carrière. |
| [Stade initial](references/stadium-bg.png) | Référence antérieure de fond. |
| [Conférence de presse](references/press-conference.png) | Référence éditoriale existante. |

Les trois captures de jeux ont été fournies par le propriétaire comme inspirations. Aucun ensemble complet de wireframes carrière n'a été identifié ; ne pas annoncer une conformité pixel par pixel.

## Sources et parcours existants

- [Source v0](references/v0-da-source.md) et [source v3](references/v0-v3-source.md) : historiques, subordonnées aux contraintes actuelles du brief. Ne pas rétablir les anciennes polices, coins carrés ou une DA sombre.
- Plan de parcours approuvé : `.lovable/drafts/drft_01m7bwfs07f5s8083wh2f3nxse/plan-archive/carrière-v1-maquette-interactive-dans-ce-brouillon-2026-11-15/` (vue d'ensemble, figure de parcours, détails).
- Traitement actuel : `src/styles.css`, `src/components/om/career/`, `src/routes/`.
- Données de démonstration : `src/data/mock.ts` ; état de jeu temporaire en mémoire, sans backend.
- Montage actuel : `src/assets/regragui-stadium-menu.jpg`. Source de la photo réelle : [Nawfel Ajari / Wikimedia Commons, RegraguiCoach.jpg](https://commons.wikimedia.org/wiki/File:RegraguiCoach.jpg), CC BY-SA 4.0. Garder l'attribution visible et le texte alternatif ; ne pas générer son visage.

## Référence Google Material incluse

Documents extraits de l'archive fournie `material-components-ios-develop.zip`, sans dépendances, code exécutable, métadonnées Git ni installation native :

- [Présentation du dépôt](references/material-ios/README.md)
- [Boutons](references/material-ios/buttons.md)
- [Typographie](references/material-ios/typography.md)
- [Retour tactile / ripple](references/material-ios/ripple.md)
- [Licence originale](references/material-ios/LICENSE)

Source du projet : https://github.com/material-components/material-components-ios. Cette bibliothèque iOS historique est une référence de design, pas un composant web à installer. Les liens internes des documents d'origine peuvent viser des fichiers non inclus ; les consulter dans le dépôt source si nécessaire.

## Résultat attendu de Codex

Peaufiner la DA actuelle en gardant les 21 vues et toutes les interactions. Fournir les fichiers modifiés, les références utilisées, les vérifications paysage/ordinateur et les limites constatées. Les priorités visuelles et scénarios de vérification sont dans le brief.