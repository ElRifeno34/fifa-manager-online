# Game Design — Online Manager

Document de référence du jeu. Il sert de contexte à tous les outils (Figma, Lovable, Replit, Claude…).
Quand une règle change, on la change **ici d'abord**.

Statut : brouillon v0.2. Profondeur **intermédiaire**, **mobile paysage**, DA **sobre et pro**.

---

## 1. Vision

**Nom de travail** : **Online Manager** (à rediscuter, voir section 13).

**Pitch** : tu prends en main un vrai club. Chaque semaine, tu choisis la compo et la tactique,
tu regardes le match en 2D ou tu le simules, et tu fais progresser ton effectif sur plusieurs saisons.

**Positionnement** : entre Top Eleven (accessible) et Football Manager (profond). Peu de chiffres
inutiles, mais chaque chiffre a un effet visible.

**Plateforme** : **jeu mobile (iOS et Android), en paysage**. Le desktop viendra peut-être ensuite,
avec la même base de code.

**Versions**

1. **Offline solo** : un humain, les autres clubs gérés par l'IA, sauvegardes sur le téléphone.
2. **Online entre amis** (plus tard) : ligue privée, un humain par club, journées planifiées.

### Piliers

| Pilier                         | Ce que ça implique                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Des décisions qui comptent** | Une bonne tactique contre un adversaire précis change réellement le résultat.                       |
| **Des matchs lisibles**        | En regardant la 2D, on comprend pourquoi on a gagné ou perdu.                                       |
| **Des sessions courtes**       | Une journée de championnat se joue en 5 à 10 minutes, ou en quelques secondes en simulation rapide. |

### Ce que le jeu n'est pas

- Pas un jeu d'action : on ne contrôle pas les joueurs pendant le match.
- **Pas de pay-to-win**, jamais : on ne peut pas acheter de joueurs, de points d'attributs ou de
  résultats avec de l'argent réel (voir section 12).

---

## 2. Boucle de jeu

```
 ┌──────────────► Avant-match ──► Match ──► Après-match ──┐
 │                (compo,         (2D,      (notes, stats,│
 │                 tactique)       résultat  classement)  │
 │                                 ou sim                 │
 │                                 rapide)                ▼
 └──────────── Entre deux journées (repos, forme) ◄───────┘
                         │ (fin de saison)
                         ▼
          Bilan, vieillissement, jeunes, nouvelle saison
```

| Moment            | Actions du joueur                                                    | Durée visée |
| ----------------- | -------------------------------------------------------------------- | ----------- |
| **Avant-match**   | Consulter l'adversaire, compo, formation, tactique, gérer la fatigue | 2 à 5 min   |
| **Match**         | Regarder en 2D (×1, ×2, ×4) ou passer au résultat                    | 0 à 4 min   |
| **Après-match**   | Lire le résultat, les notes, les stats, le classement                | 1 min       |
| **Fin de saison** | Bilan des objectifs, progression des joueurs, nouveaux jeunes        | 3 min       |

### Simulation rapide

- Le joueur peut **simuler plusieurs journées d'un coup** : jusqu'à la prochaine journée, jusqu'à
  une date, ou jusqu'à la fin de la saison.
- Pendant la simulation rapide, l'**adjoint** gère la compo (meilleure équipe selon la fatigue) avec
  la tactique choisie par le joueur.
- La simulation **s'arrête automatiquement** sur les événements importants : (plus tard) blessure
  d'un titulaire, offre de transfert, fin de mercato.
- Le résultat est **identique** à celui qu'on aurait obtenu en jouant normalement avec la même compo
  (même moteur, même graine).

---

## 3. Le monde

### Vrais clubs et vrais joueurs, via des packs de données

Le jeu utilise de **vrais clubs et de vrais joueurs**. Les licences seront traitées plus tard
(voir section 13).

Pour garder ce choix réversible, **les données sont séparées du jeu** :

- Le jeu charge un **pack de données** (fichier JSON versionné) : championnats, clubs, joueurs,
  attributs, couleurs.
- Le moteur et la logique de jeu ne connaissent aucun nom en dur : tout vient du pack.
- On peut donc développer avec un pack réel, et livrer un autre pack (fictif ou sous licence) sans
  toucher au code.
- Le format du pack est défini dans [ARCHITECTURE.md](ARCHITECTURE.md) (à écrire en phase 1).

**Source des données réelles** : sources gratuites, détaillées dans
[ARCHITECTURE.md](ARCHITECTURE.md#packs-réels-2026-27). Les attributs sur 20 de la section 4
sont calculés pour chaque joueur, à partir de sa valeur, de son poste et de ses stats.

### MVP

- **1 championnat réel**, matchs aller-retour. Le nombre de clubs et de journées vient du pack
  (par exemple 18 clubs = 34 journées).
- Victoire 3 pts, nul 1 pt, défaite 0. Départage : différence de buts, puis buts marqués, puis
  confrontations directes.
- Avantage du terrain : léger bonus pour l'équipe à domicile.
- Chaque club a un **nom**, des **couleurs**, un **niveau de réputation** (1 à 5 étoiles) et un
  **blason** (fourni par le pack, sinon un blason générique à ses couleurs).

### Plus tard

- Plusieurs divisions avec montées et descentes.
- Une coupe nationale à élimination directe.
- Plusieurs championnats.

---

## 4. Les joueurs

### Identité

Nom, nationalité, âge, pied fort, poste principal, postes secondaires, numéro, photo (si le pack en
fournit une, sinon un avatar générique).

### Postes

| Code  | Poste                | Code  | Poste                   |
| ----- | -------------------- | ----- | ----------------------- |
| GB    | Gardien              | MC    | Milieu central          |
| DC    | Défenseur central    | MOC   | Milieu offensif central |
| DG/DD | Latéral gauche/droit | MG/MD | Milieu gauche/droit     |
| MDC   | Milieu défensif      | AG/AD | Ailier gauche/droit     |
|       |                      | BU    | Buteur                  |

Un joueur hors de son poste joue avec une pénalité (−10 % sur sa note globale à un poste voisin,
−25 % à un poste éloigné).

### Attributs (échelle 1 à 20)

| Famille       | Attribut     | Rôle dans le match                                       |
| ------------- | ------------ | -------------------------------------------------------- |
| **Technique** | Passe        | Réussite des passes, surtout longues                     |
|               | Dribble      | Éliminer un adversaire, conserver la balle sous pression |
|               | Finition     | Qualité des tirs                                         |
|               | Centre       | Qualité des centres venus des côtés                      |
| **Physique**  | Vitesse      | Courses, contre-attaques, duels en course                |
|               | Endurance    | Baisse de performance en fin de match, récupération      |
|               | Force        | Duels physiques, jeu aérien                              |
| **Mental**    | Vision       | Choix de la bonne passe, passes décisives                |
|               | Placement    | Être au bon endroit (attaque comme défense)              |
|               | Sang-froid   | Performance sous pression : face au but, gros matchs     |
| **Défense**   | Tacle        | Récupérer le ballon                                      |
|               | Marquage     | Empêcher un adversaire de recevoir ou de tirer           |
| **Gardien**   | Réflexes     | Arrêts                                                   |
|               | Placement GB | Bien couvrir son but, sorties                            |
|               | Jeu au pied  | Relances                                                 |

Les gardiens n'utilisent que Réflexes, Placement GB, Jeu au pied, Sang-froid et Force (pour le jeu
aérien). Les joueurs de champ n'utilisent pas les attributs de gardien.

### Note globale (1 à 99)

Calculée **par poste**, à partir d'une moyenne pondérée des attributs. Exemples de poids :

| Poste | Attributs les plus importants            |
| ----- | ---------------------------------------- |
| BU    | Finition, Placement, Sang-froid, Vitesse |
| MC    | Passe, Vision, Endurance, Placement      |
| DC    | Marquage, Tacle, Force, Placement        |
| AG/AD | Vitesse, Dribble, Centre                 |
| GB    | Réflexes, Placement GB, Sang-froid       |

Les poids exacts seront réglés pendant la calibration du moteur (phase 2).

### Potentiel

Chaque joueur a un **potentiel caché** (note globale maximale atteignable). Le joueur voit une
estimation en étoiles, plus précise pour ses propres joueurs que pour ceux des autres clubs.

### État du joueur

| État        | MVP | Effet                                                                                                            |
| ----------- | --- | ---------------------------------------------------------------------------------------------------------------- |
| **Fatigue** | Oui | 0 à 100 %. Monte en jouant, baisse au repos. Fatigué = moins performant, plus de risque de blessure (plus tard). |
| **Forme**   | Oui | Tendance sur les derniers matchs (notes). Petit bonus ou malus.                                                  |
| Moral       | Non | Temps de jeu, résultats, contrat.                                                                                |
| Blessure    | Non | Indisponible N journées.                                                                                         |
| Cartons     | Non | Suspension après un rouge ou une accumulation de jaunes.                                                         |

### Progression

- En fin de saison, chaque joueur évolue selon son **âge**, son **potentiel** et son **temps de jeu**.
- Courbe par défaut : progression jusqu'à ~24 ans, plateau de 25 à 29 ans, déclin après 30 ans
  (d'abord la vitesse et l'endurance, le mental baisse en dernier).
- Retraite possible à partir de 33 ans.
- **Nouveaux jeunes** : chaque club reçoit 2 à 4 jeunes **générés** de 16-17 ans par saison.

---

## 5. Tactique

### Formations (MVP)

4-4-2, 4-3-3, 4-2-3-1, 3-5-2, 5-3-2.

### Consignes d'équipe (MVP) — 3 curseurs

| Curseur             | Options                         | Effet                                                                                                                             |
| ------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Style**           | Possession / Équilibré / Direct | Possession : passes courtes, moins de pertes, attaques lentes. Direct : passes longues, plus d'occasions rapides, plus de pertes. |
| **Pressing**        | Bas / Moyen / Haut              | Haut : récupère plus haut, mais fatigue plus vite et laisse des espaces dans le dos.                                              |
| **Ligne défensive** | Basse / Moyenne / Haute         | Haute : comprime le jeu, mais vulnérable aux joueurs rapides.                                                                     |

### Principe d'équilibre : pierre-feuille-ciseaux souple

Aucune tactique n'est la meilleure partout. Exemples d'interactions à respecter :

- **Ligne haute** contre attaquants **rapides** : risqué.
- **Pressing haut** contre une équipe **possession** avec de bons passeurs : peut se faire éliminer.
- **Style direct** contre une **ligne basse** : peu efficace, il n'y a pas d'espace.
- **Pressing haut** avec une équipe **peu endurante** : effondrement en fin de match.

C'est la base du pilier « des décisions qui comptent ». L'écran d'avant-match doit donner assez
d'informations sur l'adversaire pour qu'on puisse en profiter.

### Plus tard

Consignes individuelles (montées des latéraux, marquage individuel), tireurs de coups de pied
arrêtés, changements de tactique et remplacements **pendant** le match.

---

## 6. Le match

### Principes

- **Déterministe** : même graine + mêmes compos = même match. Indispensable pour les replays,
  la simulation rapide, les tests et la version online.
- **Le moteur décide, la 2D raconte.** La visualisation n'invente aucun résultat.

### Déroulé

- 2 mi-temps de 45 minutes + temps additionnel.
- Le moteur produit une **suite d'événements** horodatés (minute, seconde) : passe, dribble,
  interception, tacle, tir, arrêt, but, faute, corner, coup franc, penalty, hors-jeu (plus tard).
- Chaque événement a la **position du ballon** sur le terrain et les joueurs impliqués.
- La couche **chorégraphie** en déduit la position des 22 joueurs pour l'affichage 2D.

### Résultats du match

- Score, buteurs, passeurs décisifs.
- **Stats d'équipe** : possession, tirs, tirs cadrés, passes réussies, corners, fautes.
- **Note de chaque joueur** (sur 10, 6.0 = match moyen) et l'**homme du match**.
- **Fil des temps forts** en texte (« 34' — But de Martin, servi par Diallo »).

### Visionneuse 2D (paysage)

- Vue de dessus, terrain entier, joueurs en ronds aux couleurs du club avec leur numéro.
- Vitesses ×1, ×2, ×4, pause, « aller au prochain temps fort », « passer au résultat ».
- Bandeau de score en haut ; panneau escamotable sur le côté avec les stats en direct et les temps
  forts, pour laisser le terrain en plein écran.
- Durée d'un match à ×1 : environ 3 à 4 minutes (le jeu accélère entre les actions intéressantes).

### Objectifs de calibration (à vérifier en phase 2 sur des milliers de matchs)

| Mesure                                  | Cible                               |
| --------------------------------------- | ----------------------------------- |
| Buts par match                          | 2,5 à 2,9                           |
| Victoires à domicile / nuls / extérieur | ~45 % / ~27 % / ~28 %               |
| Tirs par équipe et par match            | 10 à 15                             |
| Le favori (bien plus fort) gagne        | 65 à 75 % du temps                  |
| Écart de points entre 1er et dernier    | Réaliste, sans saison « injouable » |

Avec de vrais clubs, on vérifie aussi que le classement final ressemble à la réalité en moyenne
(les gros clubs finissent en haut la plupart du temps, avec des surprises possibles).

---

## 7. Saison et objectifs

- En début de saison, la direction fixe un **objectif** selon la réputation du club : maintien,
  milieu de tableau, qualification européenne, titre.
- En fin de saison, un **bilan** : objectif atteint ou non, meilleurs joueurs, stats.
- MVP : l'objectif est indicatif. Plus tard : jauge de **confiance de la direction**, avec
  possibilité d'être licencié et de reprendre un autre club.

---

## 8. IA des clubs (MVP)

- Choisit chaque semaine la meilleure compo possible en tenant compte de la fatigue.
- Choisit une formation adaptée à son effectif et une tactique selon son rang dans le championnat :
  les favoris jouent la possession et le pressing haut, les plus faibles plutôt bloc bas et jeu
  direct.
- Plus tard : mercato de l'IA, adaptation tactique à l'adversaire.

---

## 9. Médias et contenu généré par IA

Le jeu fait vivre le monde autour du club avec **la presse sportive** et **les réseaux sociaux**.
Les textes sont écrits par un modèle de langage (Claude API) qui **raconte** ce qui se passe. Il ne
**décide** jamais d'un résultat : il écrit uniquement à partir des événements produits par le moteur.

### 9.1 La presse : les vrais journaux sportifs de chaque pays

Chaque pays du pack de données a **ses journaux sportifs**, chacun avec son **ton** et ses
**sympathies**. Exemples :

| Pays       | Journaux                                                             |
| ---------- | -------------------------------------------------------------------- |
| France     | L'Équipe                                                             |
| Espagne    | Marca, AS (plutôt Madrid), Mundo Deportivo, Sport (plutôt Barcelone) |
| Italie     | La Gazzetta dello Sport, Corriere dello Sport, Tuttosport            |
| Allemagne  | Kicker, Bild                                                         |
| Portugal   | A Bola, Record, O Jogo                                               |
| Angleterre | Pages sport des quotidiens (pas de quotidien sportif national)       |

Chaque journal a dans le pack : un nom, un pays, un **ton** (sérieux, analytique, tabloïd…), des
**clubs favoris** éventuels et une ville. Résultat : **le même match ne fait pas les mêmes titres**
selon le journal. Un journal madrilène célèbre la victoire du Real, un journal barcelonais parle
d'arbitrage.

**Ce que publie la presse**

| Contenu                                                     | Moment                    | MVP       |
| ----------------------------------------------------------- | ------------------------- | --------- |
| **La une** de chaque journal après chaque journée           | Hub, écran Presse         | Oui       |
| Compte rendu de ton match                                   | Après-match, écran Presse | Oui       |
| Équipe type de la journée                                   | Écran Presse              | Oui       |
| Pression sur l'entraîneur (mauvaise série, objectif menacé) | Écran Presse              | Oui       |
| Rumeurs de transferts                                       | Mercato                   | Plus tard |
| Interviews et conférences de presse (tes réponses comptent) | Avant/après-match         | Plus tard |

**Présentation** : une page de une façon journal (titre énorme, sous-titre, photo remplacée par une
illustration ou un visuel de score), puis la liste des articles. Le nom du journal est affiché en
typographie neutre : **pas de vrai logo** (voir les règles plus bas).

### 9.2 Les réseaux sociaux : fil d'actu et photos

Deux applications **fictives** dans le jeu, inspirées de Twitter/X et Instagram, avec leurs propres
noms et logos (à inventer, on ne reprend ni les noms ni les logos réels) :

| Appli                       | Inspiration | Contenu                                                                                        | MVP       |
| --------------------------- | ----------- | ---------------------------------------------------------------------------------------------- | --------- |
| **Fil** (nom provisoire)    | Twitter/X   | Messages courts : réactions, débats, hashtags tendance, likes et partages                      | Oui       |
| **Photos** (nom provisoire) | Instagram   | Visuels générés par le jeu : score final, homme du match, but de la journée, nouveau transfert | Plus tard |

**Qui publie**

| Compte                                  | Ce qu'il publie                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| Comptes officiels des clubs             | Annonces factuelles : compo, score, buteurs, bienvenue aux nouveaux joueurs                 |
| Joueurs réels                           | Messages **courts et positifs sur les faits du jeu** uniquement (« Quel match ! 3 points ») |
| Journalistes et consultants **fictifs** | Analyses, critiques, rumeurs, débats                                                        |
| Supporters **fictifs**                  | Enthousiasme, colère, humour, demandes de changement de tactique                            |

- Le nombre de likes et de partages dépend de la **taille du club** et de l'**importance de
  l'événement**.
- Les **hashtags tendance** résument la journée (#RemontadaHistorique, #CoachOut…).
- Le ton des supporters reflète la situation : série de victoires, derby perdu, objectif menacé.
- **Plus tard** : une jauge d'**humeur des supporters**, liée à la confiance de la direction.

Les visuels de l'appli **Photos** sont **dessinés par le jeu** (couleurs du club, score, nom du
joueur) : pas besoin de vraies photos, et ça fonctionne hors connexion.

### 9.3 Autres contenus IA

| Contenu                      | Moment                | MVP       |
| ---------------------------- | --------------------- | --------- |
| Commentaires des temps forts | Match 2D              | Plus tard |
| Rapports de recruteur        | Fiche joueur, mercato | Plus tard |
| Conseils de l'adjoint        | Avant-match           | Plus tard |

### 9.4 Génération

- **Une seule requête IA par journée**, après tous les matchs : elle produit en une fois les unes,
  les articles et les messages du fil, sous forme de données structurées (JSON). C'est moins cher et
  plus cohérent que des dizaines de petits appels.
- La génération se fait **en arrière-plan** : le joueur continue de jouer, la presse apparaît dès
  qu'elle est prête.
- En **simulation rapide**, on ne génère pas toutes les journées sautées : un seul numéro
  « récapitulatif » couvre la période.
- Les textes sont écrits **dans la langue du jeu**, en gardant le nom et le ton de chaque journal.

### 9.5 Règles

- **Le jeu reste entièrement jouable hors connexion.** Sans réseau, des **textes modèles** (avec
  variables : buteur, minute, score…) remplacent le contenu IA.
- La clé d'API n'est **jamais** dans l'app : les appels passent par un petit serveur relais.
- Les textes générés sont **sauvegardés** avec la partie : on ne régénère pas un résumé déjà écrit.
- Pas de contenu IA qui invente des faits sur de vraies personnes en dehors du jeu (blessures
  réelles, vie privée…). Les textes parlent uniquement de ce qui se passe dans la partie.
- **Critiques, polémiques et rumeurs** viennent uniquement de comptes **fictifs** (journalistes,
  supporters). On ne fait pas dire à un vrai joueur ou entraîneur des propos qu'il n'a pas tenus.
- Les **journaux réels** sont listés dans le pack de données, comme les clubs : on peut les remplacer
  par des journaux fictifs sans toucher au code. Pas de vrais logos ; un article affiché sous le nom
  d'un vrai journal reste un texte du jeu, présenté comme tel.
- Pas d'insultes ni de contenu haineux, même pour des supporters en colère : le relais IA filtre le
  contenu avant de l'envoyer à l'app.

---

## 10. Direction artistique

**Références** : l'interface du **mode Carrière de FIFA 16** et de la **Master League de PES 2021**.
On s'en **inspire** (ambiance, structure), on ne reprend **aucun** élément graphique d'EA ou de Konami.

### Principes

- **Sobre et pro** : l'interface d'un vrai outil de manager, pas d'un jeu mobile tape-à-l'œil.
- **Clair par défaut** (v2) : fond de stade flouté sous un voile clair, panneaux blancs à ombre
  douce. Le thème sombre de la v1 reste disponible en option.
- **Aux couleurs du club** : l'accent de l'interface est la couleur du club géré (voir
  [design/HUB_V2.md](design/HUB_V2.md)).
- **Desktop d'abord, jouable sur mobile** : mise en page pensée pour un écran 16:9 (souris, clavier,
  raccourcis), compactée en paysage sur téléphone (tactile).
- **Hub façon PES 2021** : colonne de grandes tuiles de menu, grand visuel d'actu au centre,
  classement et buteurs dessous, calendrier à droite.
- **Typographie** : sans-serif condensée pour les titres (en majuscules), sans-serif lisible pour
  les chiffres et les tableaux. Chiffres à chasse fixe dans les tableaux.
- **Données denses mais lisibles** : tableaux avec en-têtes clairs, notes colorées par niveau
  (rouge → orange → vert), barres d'attributs.
- **Couleurs du club** utilisées par petites touches (bandeau, blason, maillots sur le terrain 2D),
  jamais pour toute l'interface.
- **Animations discrètes** : transitions courtes entre écrans, apparition des tuiles, pas d'effets
  gratuits.

### Contraintes mobile paysage

- Zones tactiles de **44 px minimum**, actions principales accessibles au pouce (bas et côtés).
- Respect des zones sûres (encoche, barre de navigation).
- Navigation : barre latérale gauche compacte (icônes) + contenu ; bouton « Continuer » toujours
  visible en bas à droite, comme le « Avancer » des modes carrière.
- Une partie du texte de la référence console doit être agrandie : on vise un écran de téléphone,
  pas une télé.

### Design system v0.1 (thème sombre, conservé en option)

La v2 claire et les palettes des clubs sont décrites dans [design/HUB_V2.md](design/HUB_V2.md).
Source de vérité : le fichier [Figma](https://www.figma.com/design/ozAmyUH17jLIZyM1f7nNYE). Le plan
Figma gratuit limitant les variables à un mode, le fichier contient le thème clair ; les valeurs
sombres ci-dessous servent au mode sombre dans le code.

| Famille     | Valeurs                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------- |
| Fonds       | base `#0A0E13`, surface `#111821`, relief `#18212D`, superposition `#1F2A38`                  |
| Bordures    | défaut `#263243`, forte `#34445A`                                                             |
| Textes      | principal `#F1F4F8`, secondaire `#A3AFBF`, discret `#677487`, sur accent `#06120D`            |
| Accent      | `#2BE3A0` (survol `#5CEDB8`, fond léger `#10332A`)                                            |
| États       | succès `#33D17A`, alerte `#FFB020`, danger `#FF4D5E`, info `#4DA3FF`                          |
| Notes       | < 60 `#FF4D5E`, 60-69 `#FFB020`, 70-79 `#C9E34B`, 80+ `#33D17A`                               |
| Typographie | titres **Barlow Condensed** (majuscules), textes et chiffres **Barlow** (chiffres tabulaires) |
| Espacements | 2, 4, 8, 12, 16, 24, 32 px                                                                    |
| Arrondis    | 2, 4, 8 px (volontairement faibles : look « outil pro »)                                      |

Composants existants : Button (principal, secondaire), NavItem (barre latérale), Tile, RatingBadge,
StandingRow, pastilles de forme, blason à initiales, icônes de navigation.

À faire : carte joueur, tableau d'effectif, curseur tactique, terrain de compo, bandeau de score du
match, page de journal, message du fil.

---

## 11. Écrans

Interface **mobile paysage**, pensée pour le **tactile**.

| #   | Écran                   | Contenu principal                                                                          | MVP |
| --- | ----------------------- | ------------------------------------------------------------------------------------------ | --- |
| 1   | Menu principal          | Nouvelle partie, charger, paramètres                                                       | Oui |
| 2   | Nouvelle partie         | Choix du championnat et du club (réputation, effectif, objectif)                           | Oui |
| 3   | Sauvegardes             | Liste des emplacements, export/import de fichier                                           | Oui |
| 4   | **Hub du club**         | Tuiles : prochain match, forme, classement résumé, **à la une**, tendances du fil, alertes | Oui |
| 5   | Effectif                | Tableau triable et filtrable (poste, note, âge, fatigue, forme)                            | Oui |
| 6   | Fiche joueur            | Attributs, note par poste, stats de la saison, potentiel estimé                            | Oui |
| 7   | **Compo et tactique**   | Terrain où l'on glisse les joueurs, remplaçants, formation, 3 curseurs                     | Oui |
| 8   | Avant-match             | Comparaison avec l'adversaire : forme, style, joueurs clés                                 | Oui |
| 9   | **Match 2D**            | Visionneuse (voir section 6)                                                               | Oui |
| 10  | Après-match             | Score, stats, notes, homme du match, résumé (IA ou modèle)                                 | Oui |
| 11  | Calendrier et résultats | Toutes les journées, résultats des autres matchs                                           | Oui |
| 12  | Classement              | Tableau complet, forme, meilleurs buteurs                                                  | Oui |
| 13  | Simulation rapide       | Choix jusqu'où simuler, progression, résumé des résultats                                  | Oui |
| 14  | Fin de saison           | Bilan, progression des joueurs, nouveaux jeunes                                            | Oui |
| 15  | **Presse**              | Kiosque : unes des journaux du pays, puis articles (section 9.1)                           | Oui |
| 16  | **Fil** (réseau social) | Fil de messages, hashtags tendance, likes et partages (section 9.2)                        | Oui |
| 17  | Photos (réseau social)  | Grille de visuels générés par le jeu (section 9.2)                                         | Non |
| 18  | Transferts (mercato)    | Recherche, offres, contrats                                                                | Non |
| 19  | Finances                | Budget, salaires, revenus                                                                  | Non |
| 20  | Entraînement            | Programme de la semaine, charge, progression ciblée                                        | Non |
| 21  | Carrière coach          | Profil de l'entraîneur : réputation, palmarès, contrat, offres d'autres clubs              | Non |

Le menu du hub prévoit déjà les entrées Entraînement, Transferts et Carrière coach (DA v2, voir
[design/HUB_V2.md](design/HUB_V2.md)) ; leurs écrans arrivent en phase 5.

Si une version desktop arrive, on ajoutera les raccourcis clavier (`Espace` pour continuer, `Échap`
pour revenir…).

---

## 12. Monétisation (si un jour)

**Règle absolue : pas de pay-to-win.** Rien de ce qui s'achète ne rend une équipe plus forte.

Pistes acceptables, à décider plus tard :

- Achat unique de la version complète (démo gratuite d'une saison, par exemple).
- Cosmétiques : thèmes d'interface, styles de terrain, maillots de l'équipe dans la 2D.
- Abonnement optionnel pour le contenu IA, qui a un coût par appel.

Exclu : packs de joueurs, monnaie premium qui accélère la progression, boosts de match, publicités
qui bloquent le jeu.

---

## 13. Périmètre et questions ouvertes

### MVP (fin de la phase 3) — « une saison complète jouable en solo sur mobile »

- Création d'une partie : choix d'un club dans un championnat réel (pack de données).
- Compo, formation et 3 consignes tactiques.
- Simulation de match avec résultat, stats, notes, temps forts en texte.
- Simulation rapide de plusieurs journées.
- Calendrier, classement, meilleurs buteurs.
- Fatigue et forme.
- **Presse** (unes et articles des vrais journaux du pays) et **fil social** après chaque journée,
  écrits par IA quand le réseau est disponible, textes modèles sinon.
- Fin de saison : progression, vieillissement, jeunes, nouvelle saison.
- Sauvegarde locale, plusieurs emplacements, export/import.

### Ensuite

| Phase | Ajouts                                                                                                                 |
| ----- | ---------------------------------------------------------------------------------------------------------------------- |
| 4     | Visionneuse 2D                                                                                                         |
| 5     | Blessures, cartons, moral, transferts, contrats, finances, coupe, divisions, changements en direct, plus de contenu IA |
| 6     | Publication sur les stores (iOS, Android), puis desktop éventuel                                                       |
| 7     | Version online entre amis                                                                                              |

### Questions ouvertes

- **Nom** : « Online Manager » est très proche de _Online Soccer Manager_ (OSM), un jeu mobile
  existant du même genre. À rediscuter avant toute publication.
- **Licences** des vrais clubs, joueurs, blasons et photos : à régler avant toute publication sur
  les stores. Sans licence, prévoir un pack fictif pour la version publique.
- Comment fonctionne le contenu IA hors connexion sur la durée : génération rattrapée au retour du
  réseau, ou textes modèles définitifs ?
- **Noms des applis sociales** du jeu (à la place de « Fil » et « Photos »).
- **Journaux réels** : comme pour les clubs, utiliser leurs noms dans une version publiée demande
  leur accord. Sans accord, prévoir des journaux fictifs dans le pack public.
- Langue des articles : toujours celle du jeu, ou une option « langue d'origine du journal » ?
