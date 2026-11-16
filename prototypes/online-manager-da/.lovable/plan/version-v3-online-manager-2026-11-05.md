# Version v3 — Online Manager

## Résultat
Reprendre la présentation v3 fournie : identité « programme de match », grande boîte de réception à gauche, six clubs, thèmes clair/sombre, fond animé, fil médias et nouvelle messagerie.

## Ajustements demandés
- Harmoniser espacements sur 8px, cinq tailles de texte, icônes, séparateurs et contrastes, sans modifier les palettes originales.
- Afficher le prochain événement et les avertissements dans Avancer, avec confirmation et accès à la composition.
- Rendre les titres de panneaux cliquables avec « Voir tout → ».
- Ajouter une recherche clavier Ctrl/⌘+K pour menus, messages, clubs et joueurs.
- Partager les messages lus entre toutes les vues, proposer filtres, navigation clavier, retours d’action et annulation.
- Ajouter états de chargement et vues vides, lien d’évitement, dialogues accessibles et réduction des animations.
- Adapter adversaire et textes de match au club choisi.

## Hypothèses
Le prototype reste entièrement côté navigateur. Les lectures et actions de messagerie sont partagées pendant la session, sans sauvegarde des données de jeu. Les destinations non construites affichent le message prévu, sans créer d’écrans supplémentaires.

## Détails techniques
Adapter uniquement les dépendances Next.js à TanStack Router ; charger Archivo avec son axe de largeur et JetBrains Mono depuis Google Fonts. Utiliser les primitives accessibles existantes pour recherche, confirmation et réglages. Stocker la nouvelle photo avec Lovable Assets et sa référence dans public/images, aux côtés des photos existantes.

## Vérification
Tester règles de contraste, lecture partagée et adversaires. Vérifier les interactions réelles et captures à 1920×1080, 1280×720, 844×390 et 667×375, Real Madrid clair et Barcelone sombre, puis messagerie, médias, recherche et confirmation. Signaler explicitement toute limite non vérifiée.