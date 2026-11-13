# Wireframes de la carrière V1

Le prototype consultable se trouve sur la route `/maquettes-v1`. Il comprend une carte de structure,
une vue détaillée pour chaque écran V1 et un basculement entre filaire et aperçu visuel. Les contrôles
illustrent la navigation ; ils ne créent pas encore de sauvegarde.

## Architecture fonctionnelle

```text
Menu principal
├── Nouvelle carrière → compétition → club → objectif/budget → création
├── Continuer / sauvegardes locales → hub du club
└── Réglages

Hub du club
├── Effectif → fiche joueur → temps de jeu / entraînement / contrat
├── Composition → tactique → avant-match → match texte → résumé
├── Calendrier → résultats / classement / simulation rapide
├── Entraînement → forme, fatigue, progression, familiarité tactique
├── Transferts → négociation vendeur → négociation joueur → finances
├── Discussions → joueur / adjoint / direction → promesses suivies
├── Presse et fil → récits liés aux événements de la carrière
└── Fin de saison → bilan / jeunes / contrats / budget / saison suivante
```

## Écrans inclus en V1

| Section          | Écrans                                                       |
| ---------------- | ------------------------------------------------------------ |
| Démarrer         | Menu principal, nouvelle carrière, sauvegardes               |
| Piloter le club  | Hub du club                                                  |
| Gérer l’équipe   | Effectif, fiche joueur, composition et tactique              |
| Jouer les matchs | Avant-match, match en direct (texte), résumé après-match     |
| Suivre la saison | Calendrier, classement, simulation rapide, fin de saison     |
| Gestion          | Entraînement, transferts et contrats, finances               |
| Relations        | Carrière coach, discussions et promesses, presse, fil social |

## Structure récurrente d’un écran

1. Barre de contexte : club, saison, date et compétition.
2. Titre et objectif de l’écran.
3. Indicateurs importants ou état courant.
4. Zone principale : tableau, calendrier, feuille de match ou conversations.
5. Panneau latéral : décisions, conséquences et alertes.
6. Actions principales et retour vers la prochaine étape de carrière.

## Hors périmètre V1

Les photos sociales générées, la visionneuse de match 2D, les coupes et barrages, les prêts et clauses
ainsi que le multijoueur en ligne restent en phases ultérieures. Les écrans V1 n’appellent pas encore
la sauvegarde et le moteur depuis le prototype.
