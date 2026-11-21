# Online Manager — prototype de carrière V1

Prototype frontend en français pour une carrière fictive 2026–27, conçu d’abord pour le mobile en paysage et utilisable aussi sur tablette et ordinateur. Le périmètre couvre les 21 vues reliées de la carrière : démarrage et sauvegardes de démonstration, hub du club, effectif et profils, tactique, avant-match, match texte et replay du journal, résumé, calendrier, classement, simulation, entraînement, transferts, finances, discussions, presse, fil social et bilan de saison.

## Démarrer

```sh
npm install
npm run dev
```

Commandes utiles : `npm test`, `npm run build`, `npm run lint`.

## Fonctionnement du prototype

- React, TypeScript, TanStack Start/Router, Tailwind CSS et composants partagés.
- Données de démonstration centralisées dans `src/data/mock.ts` ; la saison et les interactions de jeu restent fictives et temporaires en mémoire.
- Aucun backend, compte, sauvegarde de carrière distante ou moteur de match. Seules les préférences de présentation peuvent être conservées localement.
- Les résultats de match sont scénarisés. Le replay relit le journal, le terrain tactique est illustratif et les changements de joueurs n’ont pas d’effet sportif simulé.
- Direction artistique vive et arrondie, police Figtree, six thèmes de club et modes clair/sombre. L’accueil conserve le montage de Walid Regragui et son attribution visible.

## Structure

- `src/routes/` : routes TanStack et vues de la carrière.
- `src/components/om/` : navigation, contrôles et composants communs.
- `src/data/mock.ts` : équipes, joueurs et scénarios fictifs.
- `src/styles.css` et `src/components/om/career/screens.css` : tokens et styles de l’interface.
- `docs/codex/` : brief, consignes, références et dossier de revue.
- `.lovable/` : métadonnées et archives du brouillon Lovable associé.

Le prototype est isolé sous `prototypes/online-manager-da/` ; il ne remplace pas l’application principale du dépôt. Consulte `AGENTS.md` et `docs/codex/BRIEF.md` avant toute modification de l’interface.
