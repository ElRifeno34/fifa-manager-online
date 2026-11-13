# Wireframes et maquettes de la V1

Le prototype React est accessible en lançant le front-end puis en ouvrant `/maquettes-v1`. Le bouton
**Wireframe** affiche la structure et la hiérarchie des écrans ; **Maquette** montre la direction
visuelle sombre avec les couleurs du club en accent. La navigation de gauche permet d’explorer les
écrans dans l’ordre et le panneau latéral explique leur rôle et ce qu’ils déclenchent.

## Boucle de carrière

```text
Choisir un championnat et un club
              ↓
Accueil : échéance, messages et décisions
              ↓
Effectif → Composition et consignes
              ↓
Avant-match → Match simulé → Résumé et classement
              ↓
Entraînement, transferts et discussions
              ↓
Retour à l’accueil, puis prochaine journée
```

## Écrans du prototype

| Écran                   | Décision montrée                             | Effet attendu dans le jeu                                |
| ----------------------- | -------------------------------------------- | -------------------------------------------------------- |
| Nouvelle carrière       | Choisir championnat et club                  | Charger le pack, puis créer une sauvegarde locale        |
| Accueil du club         | Choisir la prochaine action                  | Accéder aux échéances, messages et sections de gestion   |
| Effectif                | Évaluer rôles, moral, forme et disponibilité | Préparer le onze de départ                               |
| Composition et tactique | Placer les joueurs et régler le style        | Fournir les titulaires et consignes au moteur            |
| Avant-match et match    | Lancer ou simuler la rencontre               | Produire un résultat, des événements et des statistiques |
| Après-match             | Lire les conséquences                        | Mettre à jour calendrier, fatigue, moral et classement   |
| Entraînement            | Régler thème et intensité                    | Faire évoluer les joueurs et la familiarité tactique     |
| Transferts et contrats  | Faire une offre ou négocier                  | Modifier effectif, contrats et finances                  |

## Ce que la maquette représente

Les écrans illustrent le parcours et les informations nécessaires, avec des exemples fictifs. Le
prototype n’enregistre pas encore de carrière et ne lance pas le moteur depuis ces écrans. La
connexion du parcours de nouvelle partie, de la composition, des résultats et des classements à une
sauvegarde réelle reste un chantier de la phase 3.
