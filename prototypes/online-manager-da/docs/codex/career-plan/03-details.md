## Interactions réellement utilisables
- Création de carrière fictive, reprise d’exemples et confirmation de remise à zéro.
- Recherche, filtres et tri de l’effectif ; toutes les informations joueur demandées, drapeaux graphiques sans emoji. Fiche à gauche de la liste sur ordinateur, vue dédiée sur téléphone.
- Composition modifiable, formation et consignes ; validation puis parcours de match avec pause, progression et changements de démonstration.
- Calendrier navigable, rencontres liées, classement ; simulation scénarisée et récapitulatif jusqu’à la fin de saison.
- Entraînement configurable ; négociation vendeur puis joueur, récapitulatif financier et confirmation.
- Conversations à choix, promesses suivies ; réponses presse et événements repris dans le fil.

## Limites explicites
Toutes les données 2026–27 sont fictives. Les résultats et négociations sont des scénarios fixes, pas un moteur de jeu ni une nouvelle logique métier. Les changements n’existent que pendant la session et disparaissent au rechargement. Les « sauvegardes » sont des exemples et des instantanés temporaires, jamais des fichiers persistants. Aucun compte, service cloud, paiement, synchronisation ou génération IA.

## Présentation et vérification
Priorité iPhone paysage : 844×390, 780×360, 932×430, safe areas iOS et invitation à tourner en portrait. Le contenu dense pourra défiler dans sa zone, sans débordement de page ; la navigation reste visible. Vérifier aussi ordinateur, thèmes clair et sombre, retours, confirmations, chargements, recherches sans résultat et erreurs récupérables.

## Détails techniques
Données de démonstration dans `src/data/mock.ts`. Contexte React partagé en mémoire pour les interactions et retours d’action, sans stockage des données de carrière. Composants réutilisables dans `src/components/om/`, routes distinctes TanStack avec métadonnées propres. Tests des règles de session, parcours et filtres ; vérifications navigateur des enchaînements et des quatre formats.
