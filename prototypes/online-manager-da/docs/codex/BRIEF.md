# Brief pour Codex — peaufiner Online Manager

## Mission
Adapter et peaufiner la direction artistique actuelle à partir des captures déjà fournies et des références présentes dans le dépôt. Conserver la DA : ne pas repartir sur une nouvelle refonte.

## Références à examiner
- Les captures et documents ci-dessous sont inclus dans `references/`, à côté de ce brief. Lire aussi [README.md](README.md) pour les chemins, le brouillon et les sources.
- `image.png` : menu Football Manager, forte présence du coach, actions regroupées à gauche.
- `image-2.png` : hub PES, navigation gauche, événement central, statistiques compactes et calendrier à droite.
- `image-3.png` : transfert FIFA, liste dense et lisible, sélection évidente, résumé joueur adjacent.
- `hub-figma.png`, `v0-menu-barcelone.png`, `v0-da-source.md`, `v0-v3-source.md` : références historiques, à utiliser pour la structure sans rétablir les anciens choix de police ou de coins carrés.
- Documents sélectionnés de l'archive `material-components-ios-develop.zip` dans `references/material-ios/` : référence de typographie, hiérarchie, boutons et retours tactiles, pas une dépendance native à installer. Licence d'origine incluse ; l'archive entière n'est pas ajoutée au dépôt.
- Examiner les documents de parcours disponibles dans le dépôt. Aucun jeu complet de wireframes de carrière n’a été identifié lors de l’audit ; ne pas prétendre à une conformité pixel par pixel.

## Contraintes actuelles prioritaires
- Brouillon uniquement : aucune fusion, publication ni modification du projet principal.
- Frontend uniquement, données fictives 2026–27, état de jeu temporaire en mémoire. Aucun backend ni moteur de jeu.
- Garder la présentation vive, sobre, lisible ; Figtree proche de la police Lovable, contours arrondis, accents des six clubs et thèmes clair/sombre.
- Garder le stade visible derrière la carrière et le montage photographique réel de Walid Regragui à l’accueil, avec attribution et texte alternatif. Ne pas générer son visage.
- Garder « Toucher pour continuer », puis les trois choix de démarrage.
- Préserver les 21 vues, toutes les commandes et leurs destinations, la navigation gauche, la date et la progression globale.
- Respecter AGENTS.md, les composants partagés et les tokens sémantiques. Ne pas installer un autre routeur.

## Raffinements à privilégier
1. Hub : prochain match et préparation comme point focal, statistiques compactes, image éditoriale secondaire.
2. Clarifier la priorité entre « Continuer » global et la validation de la tâche locale, sans supprimer une commande.
3. Rendre les onglets de section plus discrets sur ordinateur où le rail fournit déjà les sous-pages ; garder une navigation claire sur mobile.
4. Récupérer de la hauteur utile sur mobile paysage, sans masquer les avertissements de données temporaires ou les retours d’action.
5. Renforcer le regroupement des zones de décision et la sélection des lignes, sans encadrer chaque section ni empiler les cartes.

## Fichiers principaux
- `src/styles.css`
- `src/components/om/career/shell.tsx`
- `src/components/om/career/start-views.tsx`
- `src/components/om/career/ui.tsx`
- Vues équipe, match, saison et gestion dans `src/components/om/career/`.

## Vérification attendue
Vérifier 844×390, 780×360, 932×430 et ordinateur ; thèmes clair et sombre. Parcours accueil → démo → effectif/profil → tactique → match → résumé → calendrier, puis transfert et finances. Garder toutes les actions accessibles, sans chevauchement ni débordement. Exécuter les tests existants concernés et signaler les limites réelles. Lister les changements et les références utilisées.
