# Docker Compose - Environnements

Ce projet utilise trois environnements Docker Compose distincts pour séparer les contextes d'exécution.

## 📦 Fichiers disponibles

- **`docker-compose.dev.yml`** - Environnement de développement
- **`docker-compose.e2e.yml`** - Tests End-to-End
- **`docker-compose.integration.yml`** - Tests d'intégration (à venir)

---

## 🛠️ Environnement de développement

### Description
Base de données PostgreSQL persistante pour le développement local.

### Caractéristiques
- **Port**: `54320` (sûr, évite les conflits)
- **Base de données**: `route_solver_dev`
- **Persistance**: Volume Docker `postgres_dev_data`
- **Container**: `route-solver-postgres-dev`

### Commandes

```bash
# Démarrer la base de données
npm run docker:dev:up

# Arrêter la base de données
npm run docker:dev:down

# Voir les logs
npm run docker:dev:logs
```

### Utilisation manuelle

```bash
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
```

---

## 🧪 Environnement de tests E2E

### Description
Base de données PostgreSQL éphémère pour les tests End-to-End.

### Caractéristiques
- **Port**: `54321` (sûr, évite les conflits)
- **Base de données**: `route_solver_e2e_test`
- **Persistance**: **Aucune** (tmpfs - données en mémoire)
- **Container**: `route-solver-postgres-e2e`
- **Restart**: `no` (pas de redémarrage automatique)

### Commandes

```bash
# Démarrer la base de données E2E
npm run docker:e2e:up

# Arrêter la base de données E2E
npm run docker:e2e:down

# Redémarrer (clean state)
npm run docker:e2e:restart

# Exécuter les tests E2E
npm run docker:e2e:up && npm run test:e2e
```

### Utilisation manuelle

```bash
docker-compose -f docker-compose.e2e.yml up -d
docker-compose -f docker-compose.e2e.yml down
```

---

## 🔬 Environnement de tests d'intégration

### Description
Base de données PostgreSQL éphémère pour les tests d'intégration (infrastructure).

### Caractéristiques
- **Port**: `54322` (sûr, évite les conflits)
- **Base de données**: `route_solver_integration_test`
- **Persistance**: **Aucune** (tmpfs - données en mémoire)
- **Container**: `route-solver-postgres-integration`
- **Restart**: `no` (pas de redémarrage automatique)

### Commandes

```bash
# Démarrer la base de données d'intégration
npm run docker:integration:up

# Arrêter la base de données d'intégration
npm run docker:integration:down

# Redémarrer (clean state)
npm run docker:integration:restart

# Exécuter les tests d'intégration (à implémenter)
# npm run docker:integration:up && npm run test:integration
```

### Utilisation manuelle

```bash
docker-compose -f docker-compose.integration.yml up -d
docker-compose -f docker-compose.integration.yml down
```

---

## 🔄 Ports utilisés

| Environnement | Port hôte | Port container | Commentaire |
|---------------|-----------|----------------|-------------|
| Développement | 54320     | 5432           | Port sûr, évite conflit avec PostgreSQL local |
| Tests E2E     | 54321     | 5432           | Port sûr, évite conflit avec dev |
| Tests intégration | 54322  | 5432           | Port sûr, évite conflit avec dev et E2E |

> **Note:** Les ports 54320-54322 sont choisis pour éviter tout conflit avec :
> - PostgreSQL local (5432)
> - Services système standards
> - Autres bases de données (MySQL 3306, MongoDB 27017, etc.)

---

## 🧹 Nettoyage complet

```bash
# Arrêter tous les environnements
npm run docker:dev:down
npm run docker:e2e:down
npm run docker:integration:down

# Supprimer les volumes (ATTENTION: perte de données)
docker volume rm route-solver_postgres_dev_data
```

---

## 💡 Bonnes pratiques

### Développement
- Démarrer avec `npm run docker:dev:up` avant de lancer l'application
- Les données persistent entre les redémarrages

### Tests E2E
- Toujours utiliser `npm run docker:e2e:restart` pour un état propre
- Les données sont perdues à l'arrêt (par design)
- Configurer `.env.test` pour pointer sur le port `5433`

### Tests d'intégration
- Similaire aux tests E2E mais sur le port `5434`
- Permet d'exécuter E2E et intégration en parallèle
- À utiliser pour tester les repositories TypeORM directement

---

## 🔧 Variables d'environnement

### Développement (`.env`)
```env
DB_HOST=localhost
DB_PORT=54320
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=route_solver_dev
```

### Tests E2E (`.env.test` ou dans jest config)
```env
DB_HOST=localhost
DB_PORT=54321
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=route_solver_e2e_test
```

### Tests d'intégration (`.env.integration` ou dans jest config)
```env
DB_HOST=localhost
DB_PORT=54322
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=route_solver_integration_test
```
