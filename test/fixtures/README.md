# Test Fixtures - Fakes & Builders

Ce dossier contient des **fakes** (implémentations in-memory) et des **builders** pour faciliter l'écriture de tests fonctionnels sans mocks.

## 🎯 Philosophie

Au lieu d'utiliser des mocks Jest (`jest.fn()`, `jest.Mocked<T>`), nous utilisons :

- **Fakes** : Implémentations légères en mémoire des abstractions du domain (repositories, services)
- **Builders** : Pattern Builder pour créer facilement des objets de test

### Avantages

✅ Tests plus lisibles et expressifs  
✅ Pas de configuration de mock complexe  
✅ Comportement réel des dépendances  
✅ Meilleure couverture des interactions  
✅ Réutilisabilité entre tests  

## 📦 Structure

```
test/fixtures/
├── builders/           # Builders pour créer des objets de test
│   ├── city.builder.ts
│   ├── road-segment.builder.ts
│   └── pathfinding-result.builder.ts
├── repositories/       # Implémentations in-memory des repositories
│   ├── city.in-memory-repository.ts
│   └── road-segment.in-memory-repository.ts
├── services/          # Fakes pour les services du domain
│   └── path-finder.fake.ts
└── index.ts           # Barrel export
```

## 🔧 Utilisation

### Import

```typescript
import {
  // Builders
  CityBuilder,
  CityFixtures,
  RoadSegmentBuilder,
  PathfindingResultBuilder,
  RouteStepBuilder,
  
  // Fakes
  CityInMemoryRepository,
  RoadSegmentInMemoryRepository,
  PathFinderFake,
} from '@test/fixtures';
```

### 1. Builders

#### CityBuilder

```typescript
// Construction fluide
const paris = CityBuilder.aCity()
  .withIdFromName('Paris')
  .build();

// Ou utiliser les fixtures pré-définies
const lyon = CityFixtures.lyon();
const marseille = CityFixtures.marseille();
```

**Fixtures disponibles :**
- `paris()`
- `lyon()`
- `marseille()`
- `nice()`
- `toulouse()`
- `bordeaux()`

#### RoadSegmentBuilder

```typescript
const roadSegment = RoadSegmentBuilder.aRoadSegment()
  .between(parisCity, lyonCity)
  .withDistance(465)
  .withSpeedLimit(130)
  .build();
```

#### PathfindingResultBuilder & RouteStepBuilder

```typescript
const step = RouteStepBuilder.aRouteStep()
  .withFrom(parisCity)
  .withTo(lyonCity)
  .withDistance(465)
  .withSpeedLimit(130)
  .withEstimatedDuration(3.58)
  .withWeatherCondition('clear')
  .build();

const result = PathfindingResultBuilder.aPathfindingResult()
  .withTotalDistance(465)
  .withEstimatedTime(3.58)
  .withStep(step)
  .build();
```

### 2. In-Memory Repositories

#### CityInMemoryRepository

```typescript
const cityRepository = new CityInMemoryRepository();

// Peupler avec des données
cityRepository.givenCities([paris, lyon, marseille]);

// Utiliser comme un vrai repository
const city = await cityRepository.findByName(CityName.create('Paris'));

// Nettoyer entre les tests
cityRepository.clear();
```

#### RoadSegmentInMemoryRepository

```typescript
const roadSegmentRepository = new RoadSegmentInMemoryRepository();

// Peupler avec des données
roadSegmentRepository.givenRoadSegments([segmentParisLyon]);

// Utiliser comme un vrai repository
const segments = await roadSegmentRepository.findAll();
const segment = await roadSegmentRepository.findById(segmentId);
await roadSegmentRepository.save(segment);

// Nettoyer
roadSegmentRepository.clear();
```

### 3. Service Fakes

#### PathFinderFake

```typescript
const pathFinder = new PathFinderFake();

// Configurer le résultat attendu
pathFinder.givenResult(
  PathfindingResultBuilder.aPathfindingResult()
    .withTotalDistance(465)
    .withEstimatedTime(3.58)
    .build()
);

// Utiliser dans le use case
const result = await pathFinder.findFastestRoute(segments, start, end);

// Réinitialiser entre tests
pathFinder.reset();
```

## 📝 Exemple Complet

```typescript
describe('GetFastestRouteUseCase', () => {
  let useCase: GetFastestRouteUseCase;
  let cityRepository: CityInMemoryRepository;
  let roadSegmentRepository: RoadSegmentInMemoryRepository;
  let pathFinder: PathFinderFake;

  beforeEach(() => {
    // Créer les fakes
    cityRepository = new CityInMemoryRepository();
    roadSegmentRepository = new RoadSegmentInMemoryRepository();
    pathFinder = new PathFinderFake();

    // Peupler avec des données de test
    const paris = CityFixtures.paris();
    const lyon = CityFixtures.lyon();
    
    cityRepository.givenCities([paris, lyon]);
    
    const segment = RoadSegmentBuilder.aRoadSegment()
      .between(paris, lyon)
      .withDistance(465)
      .withSpeedLimit(130)
      .build();
    
    roadSegmentRepository.givenRoadSegments([segment]);

    // Créer le use case avec les fakes
    useCase = new GetFastestRouteUseCase(
      pathFinder,
      roadSegmentRepository,
      cityRepository,
    );
  });

  it('should return the fastest route', async () => {
    // Arrange
    const pathfindingResult = PathfindingResultBuilder.aPathfindingResult()
      .withTotalDistance(465)
      .withEstimatedTime(3.58)
      .withStep(
        RouteStepBuilder.aRouteStep()
          .withFrom(CityFixtures.paris())
          .withTo(CityFixtures.lyon())
          .withDistance(465)
          .withSpeedLimit(130)
          .withEstimatedDuration(3.58)
          .withWeatherCondition('clear')
          .build(),
      )
      .build();

    pathFinder.givenResult(pathfindingResult);

    // Act
    const result = await useCase.execute({
      startCity: 'Paris',
      endCity: 'Lyon',
    });

    // Assert
    expect(result.totalDistance).toBe(465);
    expect(result.estimatedDuration).toBe(3.6);
  });
});
```

## 🎨 Bonnes Pratiques

### ✅ À FAIRE

- Utiliser les builders pour créer des objets de test
- Peupler les repositories avec `givenXxx()` dans `beforeEach()`
- Nettoyer avec `clear()` si nécessaire entre tests
- Utiliser les fixtures pré-définies (CityFixtures) quand possible
- Tester le comportement réel des interactions

### ❌ À ÉVITER

- N'utilisez PAS `jest.fn()` ou `jest.Mocked<T>` pour les tests fonctionnels
- Ne vérifiez PAS les appels de méthodes avec `expect().toHaveBeenCalledWith()`
- Ne moquez PAS les dépendances internes (repositories, services)

### 💡 Quand utiliser des mocks ?

Utilisez des mocks **uniquement** pour :
- Les dépendances externes (API HTTP, base de données réelle)
- Les tests E2E où vous voulez isoler l'application
- Les services d'infrastructure (OpenWeatherMap, etc.)

## 🔗 Références

- [Martin Fowler - Test Double](https://martinfowler.com/bliki/TestDouble.html)
- [Growing Object-Oriented Software, Guided by Tests](http://www.growing-object-oriented-software.com/)
