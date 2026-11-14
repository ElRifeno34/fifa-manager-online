# Interface mobile V1 — brief Lovable

## Décisions produit

- Concevoir d’abord une expérience mobile en paysage, puis l’adapter au web desktop.
- Conserver les mêmes données et comportements sur iOS et web.
- Le paysage est l’orientation de référence pour tout le jeu mobile. En portrait, afficher une invitation claire à tourner l’appareil ; la prise en charge complète du portrait n’est pas requise pour ce premier lot.
- Réaliser le premier parcours vertical : **Hub → Effectif → Fiche joueur**.
- Utiliser des données de démonstration ou les packs locaux existants. Ne pas prétendre qu’une décision est enregistrée tant qu’elle ne l’est pas.
- Les carrières restent locales pour la V1. Pas de compte ni de synchronisation cloud dans cette première livraison.

## Navigation mobile

Rail de navigation compact et persistant à gauche avec cinq destinations :

1. **Accueil** — hub du club, échéance et priorités.
2. **Équipe** — effectif, recherche, filtres et accès aux fiches.
3. **Match** — composition, tactique et prochain match.
4. **Saison** — calendrier et classement.
5. **Plus** — entraînement, transferts, finances, discussions, presse et fil du club.

Le rail utilise une icône et un libellé court pour chaque destination. Il doit respecter les zones de sécurité iOS, fournir des cibles tactiles accessibles et laisser la plus grande largeur au contenu. Indiquer clairement l’onglet actif et préserver le retour vers l’écran précédent. Sur desktop, le rail peut s’élargir en navigation latérale complète.

## Écran Accueil — Hub

Disposition mobile paysage, avec en-tête court et contenu organisé en panneaux :

1. Barre compacte : écusson, nom du club, compétition, saison, date et boîte de réception.
2. Carte du prochain match : adversaire, date, domicile / extérieur et action « Préparer ».
3. Priorités : décisions en attente, blessures et contrats à surveiller.
4. Résumé de saison : rang, points, forme récente et objectif de la direction.
5. Activité récente : dernier résultat, une de presse et réactions du club.

Rendre le prochain match et les priorités visibles sans long défilement. Les actualités secondaires peuvent défiler dans un panneau. Sur desktop, utiliser une grille qui garde le contexte et les actions principales visibles.

## Écran Équipe — Effectif

Chaque ligne compacte affiche :

- portrait ou initiales et nom ;
- drapeau de nationalité, âge et poste ;
- statut textuel (par exemple indiscutable, titulaire, rotation ou à développer) ;
- humeur sous forme de libellé, forme, fatigue et temps de jeu ;
- échéance de contrat quand elle mérite l’attention.

Prévoir recherche par nom, filtres par poste / statut / disponibilité, tri et état vide. Une ligne ouvre la fiche du joueur. L’effectif ne doit pas être présenté comme une table desktop écrasée sur téléphone.

## Écran Fiche joueur

### Mobile

- Écran dédié en paysage, avec retour vers l’effectif et en-tête d’identité.
- Drapeau réel (icône ou asset), jamais un emoji, avec nationalité en texte accessible.
- Nom, âge, poste, pied, statut, humeur, forme et fatigue visibles en premier.
- Sections ou onglets : **Vue d’ensemble**, **Performance**, **Contrat**.
- Compétences groupées par technique, physique et mental ; stats de saison et minutes jouées.
- Actions : « Temps de jeu », « Entraînement », « Contrat » et « Suivre au mercato ».

### Desktop

Garder la fiche joueur dans un panneau à gauche et la liste d’effectif à côté, pour permettre de comparer plusieurs joueurs sans perdre le contexte.

## États à concevoir

Pour les trois écrans, prévoir : chargement, contenu disponible, recherche sans résultat, donnée manquante, erreur récupérable et action confirmée. Distinguer explicitement données du pack, données calculées et estimations. Toute action non branchée au moteur doit être signalée comme démonstration ou désactivée avec une explication.

## Adaptation et qualité

- Référence téléphone paysage : 844 × 390 px ; vérifier aussi 780 × 360 et 932 × 430.
- Vérifier tablette et desktop à partir de 1024 px, avec une référence desktop de 1440 px.
- Cibles tactiles d’au moins 44 × 44 px, safe areas iOS sur les bords, scroll vertical naturel et aucune barre de défilement horizontale accidentelle.
- Contraste lisible, ordre de focus cohérent, libellés accessibles et aucune information indiquée uniquement par une couleur ou une icône.
- Réutiliser les composants, couleurs et polices déjà présents dans le projet Online Manager Hub lorsqu’ils conviennent.
- Ne pas ajouter d’emojis. Les drapeaux et écussons doivent être des assets graphiques.

## Contrat de données attendu

Le front-end lit un modèle de carrière typé, sans calculer lui-même les règles de jeu. Pour cette tranche, il a besoin au minimum de :

- `club`: identité, écusson, compétition et saison ;
- `careerContext`: date, objectif, rang et points ;
- `nextFixture`: adversaire, date, terrain et statut ;
- `players[]`: identité, nationalité ISO, âge, postes, statut, humeur, forme, fatigue, minutes, contrat, compétences et statistiques ;
- `inboxSummary` et `priorityItems` ;
- commandes d’interface : ouvrir une fiche, filtrer / trier l’effectif, marquer une priorité traitée si disponible, naviguer vers le match.

Exposer les accès par une couche d’adaptation (par exemple `CareerDataProvider` / `CareerFacade`) pour remplacer les exemples locaux par le moteur et la sauvegarde sans réécrire les composants visuels. Aucun accès direct à une base distante n’est requis pour cette tranche.

## Hors périmètre de ce premier lot

- implémenter le moteur de match, les règles de moral ou la progression ;
- créer un backend, une authentification ou la synchronisation cloud ;
- construire toutes les vues transferts, finances, entraînement ou conversations ;
- publier l’application iOS ou configurer les certificats de distribution.

## Critères d’acceptation

- Le parcours Hub → Effectif → Fiche joueur est navigable au toucher et au clavier.
- Les filtres et la recherche mettent à jour la liste, et le retour conserve le contexte utile.
- La fiche met en avant âge, nationalité en drapeau, statut et humeur ; sa présentation desktop reste à gauche de la liste.
- L’interface s’adapte aux dimensions téléphone, tablette et desktop données plus haut.
- Aucune action de démonstration n’est présentée comme une décision de carrière enregistrée.

## Prompt à envoyer à Lovable

Fais évoluer le projet existant « Online Manager Hub » pour livrer le premier parcours mobile V1 **Hub → Effectif → Fiche joueur**, avec adaptation web desktop. Lis d’abord le code et respecte son stack React, Vite, TypeScript et Tailwind. Suis la spécification de ce document.

Commence par une interface paysage pour iPhone, référence 844 × 390 px, avec safe areas iOS et un rail latéral : Accueil, Équipe, Match, Saison, Plus. En portrait, affiche une invitation à tourner l’appareil. Adapte le layout à tablette et desktop. Dans l’effectif, affiche le drapeau via un asset, le nom, l’âge, le poste, le statut textuel, l’humeur, la forme, la fatigue, les minutes et le contrat. La fiche joueur est un écran dédié sur mobile ; sur desktop, place-la à gauche de la liste.

Rends recherche, filtres, tri, ouverture et retour fonctionnels avec des données typées de démonstration cohérentes. Préserve le contexte au retour. Distingue les données réelles du pack, les valeurs calculées et les estimations. N’invente pas de règles métier et n’affirme pas qu’une action change la carrière si elle n’est pas connectée. Ne crée ni backend, ni authentification, ni abonnement, ni synchronisation cloud. N’ajoute aucun emoji. N’élargis pas le périmètre aux autres modules. À la fin, résume les écrans créés, les composants réutilisés et les hypothèses de données.
