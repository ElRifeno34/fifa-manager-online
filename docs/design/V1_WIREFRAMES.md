# Wireframes de la carrière V1

Le prototype consultable se trouve sur la route `/maquettes-v1`. La vue d’ensemble propose maintenant
deux explorateurs : les sous-composants détaillés (étapes, données, actions, résultats, règles et liens)
et l’inventaire écran par écran. Le basculement filaire / aperçu visuel s’applique aux deux vues. Les
contrôles illustrent la navigation ; ils ne créent pas encore de sauvegarde.

## Architecture fonctionnelle

```text
Menu principal
├── Nouvelle carrière → compétition → club → objectif/budget → création
├── Continuer / sauvegardes locales → hub du club
└── Réglages

Hub du club
├── Effectif → fiche joueur → temps de jeu / entraînement / contrat / statut
├── Composition → tactique → avant-match → match texte → résumé
├── Calendrier → résultats / classement / simulation rapide
├── Entraînement → plan semaine → séance → aperçu des effets → validation
├── Transferts → recherche → négociation vendeur → négociation joueur → finances
├── Discussions → boîte de réception → joueur / adjoint / direction → promesses suivies
├── Presse et fil → récits liés aux événements de la carrière
└── Fin de saison → bilan / jeunes / contrats / budget / saison suivante
```

## Sous-composants détaillés

| Sous-composant         | Parcours interne                                                       | Données et décisions principales                                                           |
| ---------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Hub du club            | Résumé → priorités → accès rapides                                     | Date, prochain match, classement, objectif, alertes et décisions bloquantes                |
| Effectif et joueurs    | Liste → profil → temps de jeu / disponibilité                          | Poste, âge, drapeau de nationalité, statut, humeur, forme, fatigue, minutes et contrat     |
| Composition et match   | Composition → tactique → avant-match → match texte → résumé            | Onze et banc, identité tactique, familiarité, événements, statistiques et conséquences     |
| Calendrier et saison   | Calendrier → résultats / classement → simulation rapide                | Journées, scores, zones d’objectif, dates et alertes qui interrompent l’avance             |
| Entraînement           | Vue semaine → constructeur de séance → aperçu des effets               | Type, groupe, intensité, fatigue attendue, progression et familiarité tactique             |
| Transferts et contrats | Recherche → vendeur → joueur → validation financière                   | Besoin, shortlist, indemnité, salaire, durée, rôle, budget et masse salariale              |
| Discussions            | Réception → conversation → promesses suivies                           | Auteur, contexte, choix, conséquence, échéance et état de chaque promesse                  |
| Presse et fil          | Événement source → article → réactions                                 | Résultat ou décision à l’origine du récit, personnes liées et liens vers les écrans source |
| Fin de saison          | Bilan sportif → joueurs / jeunes → contrats / budget → nouvelle saison | Objectifs, progression, fins de contrats, enveloppe et calendrier suivant                  |

Chaque carte de sous-composant expose aussi les règles métier et les échanges avec les autres modules.
Les exemples sont des données de démonstration; les effets décrivent le comportement cible du jeu.

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
