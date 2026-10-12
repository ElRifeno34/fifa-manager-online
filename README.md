# FIFA Manager Online

Jeu de gestion de football multijoueur entre amis, avec matchs visualisés en 2D.

- [Plan du projet](docs/PLAN.md)
- [Architecture](docs/ARCHITECTURE.md)

## Démarrer

Prérequis : Node.js 22+.

```bash
npm install
npm run dev        # lance l'app web sur http://localhost:3000
```

## Scripts

| Commande            | Effet                       |
| ------------------- | --------------------------- |
| `npm run dev`       | Serveur de dev de l'app web |
| `npm run build`     | Build de tous les packages  |
| `npm run lint`      | ESLint                      |
| `npm run typecheck` | Vérification TypeScript     |
| `npm test`          | Tests (Vitest)              |
| `npm run format`    | Formatage Prettier          |
