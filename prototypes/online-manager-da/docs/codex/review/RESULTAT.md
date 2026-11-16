# Revue DA — Online Manager

## Résultat

Raffinement de l’interface existante du prototype. Les changements se concentrent sur la hiérarchie du hub, la distinction entre progression globale et validation locale, la navigation selon le format d’écran, la densité du mobile paysage et la lecture des sélections et zones de décision. Aucun écran, commande ou destination n’a été supprimé.

## Références consultées

- `docs/codex/references/image.png` : hiérarchie centrée sur le prochain événement et son contexte.
- `docs/codex/references/image-2.png` : structure du hub de club et accès rapides.
- `docs/codex/references/image-3.png` : liste de transfert avec zone de détail adjacente.
- `docs/codex/references/hub-figma.png` et `v0-menu-barcelone.png` : historique uniquement, non utilisés comme cible visuelle.
- `docs/codex/references/material-ios/` : principes de typographie, boutons et retour tactile. Référence seulement, aucune dépendance ajoutée.
- `docs/codex/references/press-conference.png` : image éditoriale secondaire du hub.

## Modifications

- Hub : mise en avant de la préparation du prochain match, statistiques resserrées, image éditoriale secondaire et accès regroupés par intention.
- Action globale « Continuer » : style secondaire et libellé de destination explicite. Les validations locales et leurs actions sont conservées.
- Navigation : onglets de section masqués sur grand écran où le rail latéral suffit ; onglets conservés sur mobile.
- Mobile paysage : hauteur d’en-tête réduite ; avertissements, bandeau de démo et retours d’action restent visibles. La zone de contenu peut défiler.
- Équipe, tactique et transferts : lignes sélectionnées plus lisibles et commandes liées regroupées dans une zone de décision.
- Accessibilité : annonce de la ligne sélectionnée dans l’effectif et libellé accessible pour Continuer.

## Fichiers modifiés

- `src/components/om/career/ui.tsx`
- `src/components/om/career/shell.tsx`
- `src/components/om/career/start-views.tsx`
- `src/components/om/career/team-views.tsx`
- `src/components/om/career/management-views.tsx`
- `src/styles.css`
- `docs/codex/review/captures/` : captures listées ci-dessous.
- `docs/codex/review/RESULTAT.md` : ce compte rendu.

## Vérifications

- Viewports : 844×390, 780×360, 932×430 en paysage ; desktop 1440×900.
- Thèmes : clair et sombre pour les quatre viewports du hub.
- Contrôles visuels : pas de débordement horizontal ; le bouton de préparation est visible même à 780×360 ; bandeaux d’avertissement et de démonstration présents.
- Parcours manuel automatisé dans Edge : accueil → démo → effectif → profil joueur → tactique → avant-match → match → résumé → calendrier → transferts → finances. Actions de validation de composition, lancement/fin du match, offre vendeur et proposition de contrat parcourues. Aucune erreur JavaScript observée.
- `npm test -- --run` : 3 fichiers de test, 14 tests réussis.
- `npm run build` : réussi.
- `npm exec -- tsc --noEmit` : réussi.
- ESLint ciblé sur les cinq fichiers TSX modifiés, règle Prettier désactivée : 0 erreur, 4 avertissements Fast Refresh sur des fichiers qui exportent déjà des composants et des constantes.
- `npm run lint` complet : échec préexistant de formatage/Prettier à grande échelle, principalement lié aux fins de ligne CRLF dans le prototype. Les fichiers n’ont pas été reformattés globalement pour éviter un diff sans rapport.

Les tailles d’écran ont été simulées dans un navigateur Edge headless ; cela ne remplace pas une vérification sur appareil iOS réel. Le contenu reste défilable en paysage quand la hauteur disponible ne permet pas d’afficher toute une vue à la fois.

## Captures

Hub, thèmes clair et sombre :

- `captures/hub-780x360-light.png` · `captures/hub-780x360-dark.png`
- `captures/hub-844x390-light.png` · `captures/hub-844x390-dark.png`
- `captures/hub-932x430-light.png` · `captures/hub-932x430-dark.png`
- `captures/hub-1440x900-light.png` · `captures/hub-1440x900-dark.png`

Accueil :

- `captures/accueil-intro-844x390.png`
- `captures/accueil-choix-844x390.png`

Parcours :

- `captures/parcours-hub-844x390-light.png`
- `captures/parcours-effectif-844x390-light.png`
- `captures/parcours-profil-844x390-light.png`
- `captures/parcours-tactique-844x390-light.png`
- `captures/parcours-avant-match-844x390-light.png`
- `captures/parcours-match-844x390-light.png`
- `captures/parcours-resume-844x390-light.png`
- `captures/parcours-calendrier-844x390-light.png`
- `captures/parcours-transferts-844x390-light.png`
- `captures/parcours-finances-844x390-light.png`

## Limites et PR

Le checkout est sur `codex/online-manager-da-2026-11-16`. Cette branche existe localement et constitue la branche de travail ; elle n’est pas présente parmi les branches distantes observées. Une PR vers cette même branche ne peut pas être ouverte tant qu’il n’existe pas une branche source distincte et une branche cible distante correspondante. Aucun push, PR ou merge n’a été effectué ; la PR reste à créer une fois la cible/source clarifiées.
