# Online Manager

Jeu de gestion de football mobile (paysage) avec de vrais clubs, des matchs visualisés en 2D et du contenu raconté par IA. Offline en solo d'abord, puis online entre amis.

- [Plan du projet](docs/PLAN.md)
- [Game design](docs/GAME_DESIGN.md)
- [Architecture](docs/ARCHITECTURE.md)

## Démarrer

Prérequis : Node.js 22+.

```bash
npm install
npm run dev        # lance l'app web sur http://localhost:5173
```

## Scripts

| Commande             | Effet                          |
| -------------------- | ------------------------------ |
| `npm run dev`        | Serveur de dev de l'app web    |
| `npm run pack:fetch` | Télécharge les sources du pack |
| `npm run pack:build` | Génère le pack de données      |
| `npm run build`      | Build de tous les packages     |
| `npm run lint`       | ESLint                         |
| `npm run typecheck`  | Vérification TypeScript        |
| `npm test`           | Tests (Vitest)                 |
| `npm run format`     | Formatage Prettier             |
