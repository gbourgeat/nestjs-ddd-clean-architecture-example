# Quick Reference - Docker Compose

## 🚀 Démarrage rapide

### Développement
```bash
npm run docker:dev:up        # Démarrer PostgreSQL dev (port 5432)
npm run start:dev            # Démarrer l'application
```

### Tests E2E
```bash
npm run docker:e2e:up        # Démarrer PostgreSQL E2E (port 5433)
npm run test:e2e             # Lancer les tests E2E
npm run docker:e2e:down      # Arrêter après les tests
```

### Tests d'intégration (à venir)
```bash
npm run docker:integration:up      # Démarrer PostgreSQL (port 5434)
# npm run test:integration         # Lancer les tests (à implémenter)
npm run docker:integration:down    # Arrêter après les tests
```

## 📋 Commandes essentielles

| Action | Commande |
|--------|----------|
| **Démarrer dev** | `npm run docker:dev:up` |
| **Arrêter dev** | `npm run docker:dev:down` |
| **Logs dev** | `npm run docker:dev:logs` |
| **Démarrer E2E** | `npm run docker:e2e:up` |
| **Redémarrer E2E (clean)** | `npm run docker:e2e:restart` |
| **Arrêter E2E** | `npm run docker:e2e:down` |
| **Démarrer intégration** | `npm run docker:integration:up` |
| **Arrêter intégration** | `npm run docker:integration:down` |

## 🔧 Configuration des environnements

### Fichiers à créer

```bash
# Environnement de développement
cp .env.example .env

# Tests E2E
cp .env.e2e.example .env.e2e

# Tests d'intégration
cp .env.integration.example .env.integration
```

### Ports utilisés

- **54320** → Base de données de développement
- **54321** → Base de données E2E
- **54322** → Base de données d'intégration

> Ports choisis pour éviter tout conflit avec PostgreSQL local (5432) ou autres services.

## 🧹 Nettoyage

```bash
# Tout arrêter
npm run docker:dev:down && npm run docker:e2e:down && npm run docker:integration:down

# Supprimer les volumes (⚠️ perte de données dev)
docker volume rm route-solver_postgres_dev_data
```

## 📖 Documentation complète

Voir [DOCKER.md](./DOCKER.md) pour plus de détails.
