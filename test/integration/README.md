# Tests d'Intégration - Route Solver

Ce dossier contient les tests d'intégration pour les composants d'infrastructure du projet Route Solver.

## 📁 Structure

```
test/integration/
├── jest.integration.json              # Configuration Jest
├── setup.ts                           # Setup des variables d'environnement
├── database/                          # Tests des repositories TypeORM
│   ├── city.typeorm-repository.integration-spec.ts
│   └── road-segment.typeorm-repository.integration-spec.ts
├── openweathermap/                    # Tests de l'adaptateur API météo
│   └── openweathermap.adapter.integration-spec.ts
└── pathfinding/                       # Tests des algorithmes
    ├── dijkstra-algorithm.integration-spec.ts
    └── dijkstra-path-finder.integration-spec.ts
```

## 🎯 Types de tests

### 1. Tests des Repositories (Database)
Ces tests utilisent une **vraie base de données PostgreSQL** pour vérifier que :
- Les repositories TypeORM fonctionnent correctement avec PostgreSQL
- Les opérations CRUD fonctionnent (save, findById, findAll, etc.)
- Les erreurs sont correctement levées (CityNotFoundError, RoadSegmentNotFoundError)
- Les transactions et les mises à jour fonctionnent

**Composants testés :**
- `CityTypeormRepository`
- `RoadSegmentTypeormRepository`

### 2. Tests de l'Adaptateur OpenWeatherMap
Ces tests vérifient que :
- L'adaptateur appelle correctement l'API OpenWeatherMap
- Le cache fonctionne correctement
- Les conditions météo sont correctement mappées
- Les erreurs API sont gérées

**Composants testés :**
- `OpenWeatherMapAdapter`
- `WeatherCodeMapper`

### 3. Tests du Pathfinding (Algorithmes)
Ces tests vérifient que :
- L'algorithme de Dijkstra trouve le chemin optimal
- Le filtrage des segments fonctionne (distance, vitesse, météo)
- La construction du graphe est correcte
- L'intégration complète du PathFinder fonctionne

**Composants testés :**
- `DijkstraAlgorithm`
- `GraphBuilder`
- `SegmentFilter`
- `DijkstraPathFinder`

## 🚀 Exécution des tests

### Prérequis

Pour les tests des repositories, vous devez avoir **PostgreSQL** en cours d'exécution sur le port `54322`.

#### Option 1 : Avec Docker (recommandé)
```bash
# Démarrer PostgreSQL
npm run docker:integration:up

# Ou avec docker compose directement
docker compose -f docker-compose.integration.yml up -d
```

#### Option 2 : PostgreSQL local
Si vous avez PostgreSQL installé localement, assurez-vous qu'il écoute sur le port 54322 avec :
- User: `postgres`
- Password: `postgres`
- Database: `route_solver_integration_test`

### Exécuter les tests

```bash
# Tous les tests d'intégration
npm run test:integration

# En mode watch
npm run test:integration:watch

# Avec couverture de code
npm run test:integration:cov

# Tests spécifiques
npm run test:integration -- --testPathPattern="dijkstra"
npm run test:integration -- --testPathPattern="repository"
npm run test:integration -- --testPathPattern="openweathermap"
```

### Arrêter PostgreSQL

```bash
# Arrêter le conteneur Docker
npm run docker:integration:down

# Ou avec docker compose directement
docker compose -f docker-compose.integration.yml down
```

## 🔧 Configuration

Les tests d'intégration utilisent des **variables d'environnement spécifiques** définies dans `setup.ts` :

```typescript
DATABASE_HOST=localhost
DATABASE_PORT=54322
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=route_solver_integration_test
NODE_ENV=test
```

Ces variables **écrasent** celles du fichier `.env` pour garantir que les tests utilisent la bonne base de données.

## 📊 Couverture de code

Les tests d'intégration mesurent la couverture du dossier `src/infrastructure/` :

```bash
npm run test:integration:cov
```

Le rapport de couverture est généré dans `coverage/integration/`.

## 🧪 Exemples de tests

### Test de Repository
```typescript
it('should find a city by name', async () => {
  // Arrange: Créer une ville dans la DB
  const cityEntity = typeormRepository.create({
    id: 'test-city-id',
    name: 'Paris',
  });
  await typeormRepository.save(cityEntity);

  // Act: Rechercher la ville
  const result = await repository.findByName(CityName.create('Paris'));

  // Assert: Vérifier le résultat
  expect(result.name.value).toBe('Paris');
});
```

### Test d'Algorithme
```typescript
it('should find the optimal path through multiple cities', async () => {
  // Arrange: Créer un graphe avec plusieurs routes
  const segments = [
    // Route directe (lente)
    { from: 'Paris', to: 'Lyon', distance: 500, speed: 90 },
    // Route via Dijon (rapide)
    { from: 'Paris', to: 'Dijon', distance: 310, speed: 130 },
    { from: 'Dijon', to: 'Lyon', distance: 190, speed: 130 },
  ];

  // Act: Calculer le chemin optimal
  const result = await pathFinder.findFastestRoute(segments, paris, lyon);

  // Assert: Vérifier que le chemin passe par Dijon
  expect(result.path).toEqual(['Paris', 'Dijon', 'Lyon']);
});
```

## 🐛 Dépannage

### Erreur : "database does not exist"
→ Vérifiez que PostgreSQL est démarré et que la base de données est créée automatiquement (synchronize: true).

### Erreur : "Connection refused"
→ Vérifiez que PostgreSQL écoute sur le bon port (54322).

### Les tests sont lents
→ Les tests de repositories sont plus lents car ils utilisent une vraie DB. C'est normal.

### Timeout des tests
→ Le timeout est configuré à 30 secondes dans `jest.integration.json`. Vous pouvez l'augmenter si nécessaire.

## 📝 Conventions

- **Nom des fichiers** : `*.integration-spec.ts`
- **Structure** : Un fichier de test par composant d'infrastructure
- **Isolation** : Chaque test est isolé (beforeEach/afterEach)
- **Vraies dépendances** : Les tests utilisent de vraies dépendances (DB, pas de mocks)

## 🔗 Liens utiles

- [Architecture du projet](../../docs/README.md)
- [Tests Features (Use Cases)](../features/README.md)
- [Tests E2E](../e2e/)
- [Docker Setup](../../docs/DOCKER.md)
