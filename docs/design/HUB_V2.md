# Hub v2 — cahier des charges

Direction validée après le retour sur la v1 (trop sombre, menu d'accueil pas assez pro) :
**claire, professionnelle, pensée desktop tout en restant jouable sur mobile, aux couleurs du club.**

Références de style (fournies par le propriétaire, non versionnées pour des raisons de droits) :

- **PES 2021 Master League** — structure principale du hub : colonne de grandes tuiles de menu à
  gauche, grand visuel d'actu au centre, classement + buteurs dessous, calendrier à droite, barre du
  haut avec le club et des puces, barre de raccourcis en bas.
- **FIFA 16 Carrière** — ambiance claire et aérée, fond de stade, panneaux translucides.
- **EA FC, publication sociale** — visionneuse de post : image à gauche, texte et commentaires à droite.

Inspiration uniquement : aucun élément graphique d'EA ou de Konami n'est repris.

Visuels générés (Figma AI, personnes fictives, sans marque) : [bg-stade.png](assets/bg-stade.png),
[actu-conference.png](assets/actu-conference.png).

## 1. Thème

- **Clair par défaut**, sombre en option (palette v1).
- Tokens clairs : fond `#E4E9EF`, surface `#FFFFFF`, relief `#F3F5F8`, superposition `#1D2630`,
  voile `#0B1118`, bordures `#D5DCE4` / `#B7C2CE`, textes `#121A23` / `#4D5B6A` / `#8592A1`,
  texte inversé `#FFFFFF`, succès `#1F9D57`, alerte `#D98A00`, danger `#E0364A`, info `#2F7FD8`,
  notes `#E0364A` / `#E89A0C` / `#8FAE12` / `#1F9D57`.
- Panneaux blancs sans bordure, ombre douce `0 2px 6px rgba(18,26,35,.08)`, arrondi 8 px.
- Polices inchangées. Nouveaux styles : **Menu/M** (Barlow SemiBold 16, casse normale) et
  **Headline/XL** (Barlow Condensed Bold 30).

## 2. Couleurs du club (interface personnalisable)

Quatre variables : `--club-primary`, `--club-on-primary`, `--club-secondary`,
`--club-primary-subtle`, définies selon le club géré.

| Club           | Principale | Sur principale | Secondaire | Fond léger |
| -------------- | ---------- | -------------- | ---------- | ---------- |
| Online Manager | `#0FA47A`  | `#FFFFFF`      | `#121A23`  | `#E3F7EF`  |
| Real Madrid    | `#00529F`  | `#FFFFFF`      | `#FEBE10`  | `#E5EEF8`  |
| FC Barcelone   | `#A50044`  | `#FFFFFF`      | `#004D98`  | `#F8E5EE`  |
| Liverpool      | `#C8102E`  | `#FFFFFF`      | `#00B2A9`  | `#FBE6E9`  |
| Paris SG       | `#004170`  | `#FFFFFF`      | `#DA291C`  | `#E3ECF3`  |
| Bayern         | `#DC052D`  | `#FFFFFF`      | `#0066B2`  | `#FCE4E8`  |

À terme, ces palettes viennent du **pack de données** (couleurs de chaque club).

La couleur du club s'applique **par touches** : tuile « Avancer », titres de panneaux, lignes du club
du joueur, en-tête « prochain match » du calendrier, point actif du carrousel et méta des actus
(secondaire), anneau de focus, bouton principal. Jamais sur tout un fond.

Réglages : choix du club (pour tester) et thème clair/sombre, transition de couleur de 200 ms.

## 3. Hub

### Desktop et tablette paysage (≥ 1024 px, référence 1280×720, jusqu'à 1920×1080)

- **Fond** : photo de stade floutée + voile clair (~60 %).
- **Barre du haut** : blason (initiales, couleurs du club, anneau secondaire), « REAL MADRID »,
  « LaLiga · Saison 2026/27 · 2e · 27 pts » ; à droite, puces sombres : « J12 · Dim. 23 nov. »,
  « 84,5 M€ », « Réglages ».
- **Colonne gauche (~232 px)** : 6 tuiles de menu de 80 px, icône en haut à gauche, libellé en bas,
  badge rouge de notifications : **Avancer** (couleur du club, action principale), Effectif (2),
  Tactique, Compétition, Médias (5), Bureau du manager.
- **Centre** : carrousel d'actus (3 sujets, défilement toutes les 8 s, pause au survol). Légende sur
  voile sombre : méta en couleur secondaire, titre Headline/XL blanc, chapô, points de pagination.
  Dessous, deux panneaux : **Classement** (top 5, club du joueur surligné) et **Buteurs** (top 5).
- **Colonne droite (~220 px)** : calendrier. En-tête aux couleurs du club (date, domicile/extérieur,
  heure, nom du match, blason adverse), puis une ligne par jour (aujourd'hui surligné, matchs avec
  DOM./EXT. et blason).
- **Barre du bas** : raccourcis clavier fonctionnels (`Espace` Avancer, `Entrée` Valider, `Échap`
  Retour, `← →` actus, `1-6` menu) + alerte de fatigue.

### Mobile paysage (hauteur ≤ 500 px : 844×390, 667×375)

Même structure, compactée : pas de barre de raccourcis ; tuiles de menu en lignes de 44 px (icône +
libellé) ; barre du haut de 44 px ; carrousel plus petit (titre 22 px, chapô sur 2 lignes) ; un seul
panneau à onglets Classement / Buteurs ; calendrier réduit à l'en-tête + 4 jours. Zones sûres
respectées, écran « Tournez votre téléphone » en portrait.

## 4. Visionneuse du fil (`/medias/fil`)

Carte centrée sur le fond flouté : image à gauche (compteurs likes/commentaires, bouton « Masquer
les commentaires »), à droite l'auteur (avatar, nom, badge vérifié, date), le texte, puis la liste
des commentaires. Étiquette « Nouveau » en couleur secondaire. Flèches/balayage pour passer au post
suivant, `Échap` pour revenir. Sur mobile, la carte occupe tout l'écran (image 45 %, texte 55 %).

Contenu : un compte officiel publie un fait du jeu ; les avis et commentaires viennent de supporters
**fictifs** (règles de la section 9 du game design).

## 5. État d'avancement

| Élément                                                       | Figma | Prototype |
| ------------------------------------------------------------- | ----- | --------- |
| Thème clair, palettes des clubs, styles Menu/M et Headline/XL | Fait  | —         |
| Composants v2 (MenuTile, Chip, DataRow, CalendarDay, KeyHint) | Fait  | —         |
| Écran hub desktop 1280×720                                    | —     | —         |
| Écran hub mobile 844×390                                      | —     | —         |
| Visionneuse du fil                                            | —     | —         |

Bloqué le 2026-11-02 : limite d'appels Figma (plan Starter) et crédits Lovable épuisés.
