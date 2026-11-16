# Prompt avancé — Online Manager

Peaufine le prototype interactif existant d’Online Manager, en français, uniquement dans le brouillon. Ne fusionne et ne publie rien. Ne crée pas une nouvelle direction artistique ni un moteur de football.

## Direction et références
Conserve la v0 validée : Barlow pour les textes, Barlow Condensed pour les titres, six palettes de clubs, thèmes clair/sombre, menu coloré à neuf destinations et raccourcis 1–9, carrousel, calendrier, réglages et retours d’action. Combine cette identité avec Google Material : surfaces lisibles, contrôles arrondis, hiérarchie des actions, états sélectionné/pressé/désactivé et focus visible.

Examine les trois captures de `docs/codex/references/` : `image.png` pour les actions groupées et la présence du coach, `image-2.png` pour le menu gauche, l’événement central et le calendrier compact, `image-3.png` pour la sélection des joueurs et les détails adjacents. Les autres références historiques servent à comprendre la structure, pas à rétablir une DA rejetée. Respecte les wireframes réellement disponibles ; ne revendique pas une conformité pixel par pixel à des documents absents.

## Parcours et écrans
Préserve les 21 vues et toutes leurs destinations. Garde l’accueil « Toucher pour continuer », ses trois choix et le montage photographique réel de Walid Regragui sur le stade IA, avec crédit et texte alternatif. Ne génère pas son visage. Le stade animé reste derrière la carrière.

Sur le hub, donne la priorité au prochain match et à la décision utile : consulter l’effectif, valider le onze, préparer la rencontre. Sépare cette décision locale du lien global vers le prochain match. Conserve une actualité secondaire, des statistiques compactes et le calendrier.

Sur le match, organise clairement : score et noms des équipes, chronomètre à étapes, statut pause/lecture/terminé, progression, statistiques scénarisées, mini-carte du onze explicitement illustrative, journal des temps forts et commandes de lecture, pause, événement suivant, fin, replay, remplacement et sortie.

## Interactions précises
- Lecture fait avancer le scénario existant ; pause arrête l’avancement. Ne recalcule pas le résultat en fonction de la tactique.
- Replay ouvre une relecture du journal, sans vidéo inventée ni modification du score, de la composition ou de la progression. Permets de consulter un événement précédent puis de revenir au match en pause.
- Remplacement ouvre les sélections sortant/entrant, confirme le changement et le relit dans le journal et le onze illustratif. Ne lui attribue aucun effet sportif réel.
- Quitter demande confirmation et conserve la progression temporaire. Ne valide pas de résultat automatiquement.
- À la fin, le résumé devient accessible ; sa validation reporte le résultat fictif dans le calendrier et le fil du club.
- Les transferts conservent le parcours vendeur → joueur → finances → confirmation, avec budget et recrue visibles après accord.

## Animation et feedback
Utilise des transitions courtes de couleur et d’opacité pour les états des contrôles. Ne fais pas bouger la disposition au survol. Maintiens les retours d’action visibles et les confirmations accessibles. Conserve Ken Burns, faisceaux et particules du stade, l’arrêt lorsque l’onglet est caché et le réglage Fond animé. Respecte la réduction des animations ; ne lance pas une lecture du match automatiquement.

## Mobile et accessibilité
Cible d’abord le téléphone paysage 844×390, puis 780×360, 932×430 et 667×375, avec zones sûres iOS ; vérifie aussi tablette et ordinateur. Garde l’invitation à tourner le téléphone en portrait. Les commandes tactiles mesurent au moins 44 px. Le contenu dense défile dans l’espace de travail, jamais hors de la page. Les noms, scores et boutons doivent rester lisibles sans chevauchement.

Utilise des tokens sémantiques, des contrastes élevés, des drapeaux graphiques plutôt que des emojis, des libellés explicites, des nombres français et des zones de focus visibles. N’annonce pas tout le journal à chaque lecture si une annonce courte du nouvel événement suffit. Aucun tableau ou miniature ne doit prétendre afficher des données réelles.

## Contraintes techniques et livraison
Garde TanStack, React, TypeScript, Tailwind et les composants partagés du projet. Toutes les données fictives 2026–27 restent dans `src/data/mock.ts` ; état de jeu temporaire en mémoire. Aucun backend, compte, paiement, IA supplémentaire ni stockage de données de jeu. Lis `AGENTS.md` avant de modifier la structure.

Livre le prototype fonctionnel, une liste concise des changements et les limites réelles. Exécute les tests concernés. Vérifie accueil → hub → effectif/profil → tactique → match avec pause, remplacement et replay → résumé → calendrier, ainsi que transfert → finances. Contrôle les thèmes clair/sombre, les erreurs de navigateur et les débordements. Ne prétends pas avoir testé un véritable iPhone si seuls des écrans simulés ont été utilisés.