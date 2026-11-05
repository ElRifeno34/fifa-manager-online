# Hub v3 — identité « programme de match »

Retour du propriétaire sur la v2 : **même layout, même fond de stade animé**, mais une DA moins
« vibe-codée », sobre et **plus singulière**, qui s'éloigne du tableau de bord générique façon
Football Manager. Plus une **boîte de réception** en grand dans la colonne de gauche.

## Ce qu'on retire (signes d'une UI générée génériquement)

Cartes arrondies à ombre douce, icônes dans des pastilles teintées, dégradé + reflet sur la tuile
principale, puces en forme de pilule, badges ronds, flou dépoli partout.

## Le nouveau système

Inspiration : programmes de match imprimés et habillages TV sportifs.

| Élément             | Règle                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| Formes              | Angles vifs (0–2 px), aucune ombre, filets de 1 px entre les blocs                                          |
| Panneaux            | Feuilles « papier » `#F5F3EF` à ~94 %, filet supérieur de 2 px à la couleur du club                         |
| Encre               | Texte `#111418`, secondaire `#5B6168`, filets `#D9D5CE` (sombre : `#121417` / `#EDEAE4` / `#2A2E33`)        |
| Typographie         | **Archivo** (axe de largeur) : titres condensés gras en capitales, libellés condensés espacés, texte normal |
| Chiffres            | Tous en **JetBrains Mono** tabulaire (scores, points, dates, argent, compteurs)                             |
| En-têtes de section | Indexés : `01 — CLASSEMENT · LALIGA · J11`, index en couleur du club                                        |
| Menu                | Lignes plates avec numéro d'index en mono, icône discrète à droite, barre de 4 px au survol                 |
| Avancer             | Bloc plein couleur du club, sans dégradé, sous-titre utile : `J12 · DIM 23/11 · vs FC BARCELONE`            |
| Badges              | Petites étiquettes **carrées** rouges, chiffres en mono                                                     |
| Puces du haut       | Étiquettes rectangulaires, libellé en capitales + valeur en mono                                            |
| Carrousel d'actus   | Angles vifs, légende sur bandeau d'encre plein, pagination en barre de progression segmentée                |
| Calendrier          | Date en mono, jour en capitales condensées, aujourd'hui marqué d'une barre de 4 px                          |
| Barre de raccourcis | Bandeau d'encre plat, touches en keycaps carrées                                                            |
| Mouvement           | Transitions de 150 ms, pas d'effet de rebond ; le fond animé reste inchangé                                 |

Le thème par club (6 palettes), le clair/sombre, les réglages et les raccourcis sont conservés et
restylés.

## Boîte de réception

- **Sur le hub** : grand panneau sous « Avancer », titre `BOÎTE DE RÉCEPTION` + nombre de non-lus.
  Les 3 derniers messages : expéditeur (`DIRECTION`, `AGENT · J. FÉLIX`, `STAFF MÉDICAL`), objet
  sur une ligne, heure en mono, carré de couleur du club si non lu, lien `Tout voir →`.
- **Page `/messagerie`** : liste à gauche (filtres Tous, Non lus, Direction, Staff, Transferts,
  Presse) et lecture à droite (expéditeur, date, texte, actions Accepter / Refuser / Répondre).
- Raccourci `M` ; la colonne de gauche tient toujours sans défilement à 1280×720.
- **Mobile paysage** : la boîte se réduit à une ligne (titre, non-lus, dernier objet).

Les messages ne parlent que de faits du jeu (règles de la section 9 du game design).

## État

| Outil   | État                                                                                 |
| ------- | ------------------------------------------------------------------------------------ |
| v0      | Fait le 2026-11-04 ([chat v0](https://v0.app/chat/ebTFC4cDlOF)), hub + `/messagerie` |
| Lovable | À envoyer dès le retour des crédits (quota du jour épuisé)                           |

Non vérifié par v0 : boutons Accepter / Refuser de `/messagerie`, focus des touches 1 à 9, thème
sombre en Real Madrid. Limite connue : le calendrier fictif reste celui du Real (« El Clásico contre
FC Barcelone » même quand on joue le Barça).

## Implémentation dans le jeu (2026-11-05)

La v3 est intégrée à l'app du jeu (`apps/web`, Vite + React Router), avec les améliorations UI/UX :

- **Avancer** : prochain match + « 2 points à vérifier » ; s'il reste des alertes, une confirmation
  propose « Voir la compo » ou « Continuer quand même » (aussi avec `Espace`).
- **Recherche `Ctrl/⌘+K`** (+ bouton dans la barre du haut) : sections, messages, joueurs, clubs,
  thème, réglages ; insensible aux accents.
- **« Voir tout → »** sur le classement, les buteurs, le calendrier, la boîte de réception et les
  actus.
- **Messagerie** : lu/non lu partagé entre le hub et `/messagerie` (pour la session), filtres avec
  état vide, ↑/↓, `Échap`, Accepter/Refuser avec « Annuler ».
- **Données selon le club** : adversaire et derby (El Clásico, derby du Merseyside, Le Classique,
  Der Klassiker), classement et buteurs de la bonne ligue, position et points, journal du pays,
  messages et posts. Les personnes citées dans les messages sont fictives.
- **Accessibilité** : lien « Aller au contenu », dialogues avec focus piégé, notifications annoncées,
  contrastes AA vérifiés par des tests (`apps/web/src/lib/contrast.test.ts`) pour les 6 clubs et les
  2 thèmes (gris discret et rouge des badges foncés pour passer AA).
- Chargement : squelette sur les photos d'actu.

Vérifié dans le navigateur à 1920×1080, 1280×720, 844×390 et 667×375 (Real Madrid clair, FC Barcelone
sombre) : la colonne de gauche tient sans défilement partout. Non fait : cibles tactiles de 44 px
sur téléphone (le layout compact les rend plus petites), test sur un vrai appareil.

## Retouches du 2026-11-05 (soir)

- **Retour à l'ancienne police** : Barlow (textes et chiffres tabulaires) et Barlow Condensed
  (titres, libellés). Archivo et JetBrains Mono sont abandonnés.
- **UI plus moderne** (même layout) : panneaux arrondis à 12 px avec ombre douce en deux couches,
  plus de filet de couleur en haut des panneaux, listes sans traits avec survol en pastille, badges et
  étiquettes en pilule, barre du haut et barre de raccourcis en pilules flottantes, légende du
  carrousel en dégradé, « Avancer » avec léger relief et soulèvement au survol.
- **Crash corrigé** : les contextes React (thème, état du jeu, notifications) étaient déclarés dans
  les mêmes fichiers que leurs providers. Au rechargement à chaud, React recréait le contexte et l'app
  plantait sur une page blanche (« useToast must be used inside ToastProvider »). Ils sont maintenant
  dans `apps/web/src/components/providers/hooks.ts`.
- **Filet de sécurité** : une erreur d'affichage montre un écran « Un problème est survenu » avec
  Réessayer / Revenir au hub / Réinitialiser les réglages, au lieu d'une page blanche.
- Replit n'a rien produit (limite atteinte avant la construction).
