# CLAUDE.md - Instructions pour Claude Code

## 🎯 Contexte du Projet

**Route Solver** - API NestJS de planification d'itinéraires optimaux entre villes françaises.

- **Framework:** NestJS 11 + TypeScript (ES2023)
- **Base de données:** PostgreSQL avec TypeORM
- **API externe:** OpenWeatherMap (météo)
- **Algorithme:** Dijkstra pour le pathfinding

## 🏗️ Architecture Clean Architecture

```
src/
├── domain/           # Logique métier pure (NE DÉPEND DE RIEN)
│   ├── entities/     # Entités avec identité
│   ├── value-objects/# Objets immuables
│   ├── services/     # Interfaces abstraites
│   ├── repositories/ # Classes abstraites
│   └── errors/       # Erreurs métier
├── application/      # Orchestration (dépend de domain)
│   ├── use-cases/    # Un dossier par use case
│   └── mappers/      # Transformation de données
├── infrastructure/   # Implémentations (dépend de domain + application)
│   ├── database/     # TypeORM, migrations
│   ├── pathfinding/  # Algorithme Dijkstra
│   └── openweathermap/ # API météo
└── presentation/     # Interface HTTP (dépend de domain + application)
    └── rest-api/     # Controllers, DTOs
```

### Règles de dépendances STRICTES

- `domain/` → N'importe RIEN d'externe
- `application/` → Importe uniquement depuis `domain/`
- `infrastructure/` → Importe depuis `domain/` et `application/`
- `presentation/` → Importe depuis `domain/` et `application/`

## 📝 Patterns de Code

### Value Object
```typescript
export class CityName {
  private constructor(private readonly _value: string) {}
  static create(value: string): CityName {
    if (!value?.trim()) throw InvalidCityNameError.empty();
    return new CityName(value.trim());
  }
  get value(): string { return this._value; }
  equals(other: CityName): boolean { return this._value === other._value; }
}
```

### Entity
```typescript
export class City {
  private constructor(
    public readonly id: CityId,
    public readonly name: CityName,
  ) {}
  static create(id: CityId, name: CityName): City {
    return new City(id, name);
  }
  equals(other: City): boolean { return this.id.equals(other.id); }
}
```

### Erreur Métier
```typescript
export class CityNotFoundError extends Error {
  private constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
  static forCityName(name: CityName): CityNotFoundError {
    return new CityNotFoundError(`City "${name.value}" not found`);
  }
}
```

### Repository (Interface dans Domain)
```typescript
export abstract class CityRepository {
  abstract findByName(name: CityName): Promise<City>;
  abstract save(city: City): Promise<void>;
}
```

### Use Case
```typescript
export class GetFastestRouteUseCase {
  constructor(
    private readonly pathFinder: PathFinder,
    private readonly cityRepository: CityRepository,
  ) {}

  async execute(input: GetFastestRouteInput): Promise<GetFastestRouteOutput> {
    const startCity = CityName.create(input.startCity);
    const endCity = CityName.create(input.endCity);
    // ... logique métier
    return PathfindingResultMapper.toOutput(result);
  }
}
```

## 🔤 Conventions de Nommage

| Type | Fichier | Classe |
|------|---------|--------|
| Entity | `city.ts` | `City` |
| Value Object | `city-id.ts` | `CityId` |
| Error | `city-not-found.error.ts` | `CityNotFoundError` |
| Repository Interface | `city.repository.ts` | `CityRepository` (abstract) |
| Repository Impl | `city.typeorm-repository.ts` | `CityTypeormRepository` |
| TypeORM Entity | `city.typeorm-entity.ts` | `CityTypeormEntity` |
| Use Case | `get-fastest-route.use-case.ts` | `GetFastestRouteUseCase` |
| Input | `get-fastest-route.input.ts` | `GetFastestRouteInput` |
| Output | `get-fastest-route.output.ts` | `GetFastestRouteOutput` |

## 🧪 Stratégie de Tests

### Principe fondamental
**Le Domain est testé INDIRECTEMENT via les tests des Use Cases.**

- ❌ Pas de fichiers `*.spec.ts` dans `src/domain/`
- ✅ Tests unitaires des Use Cases couvrent le Domain
- ✅ Tests E2E pour les endpoints HTTP

### Structure des tests
```
test/
├── features/                     # ← Tests fonctionnels (Use Cases)
│   ├── application/
│   │   └── use-cases/
│   │       ├── get-fastest-route/
│   │       │   └── get-fastest-route.use-case.spec.ts
│   │       └── update-road-segment-speed/
│   │           └── update-road-segment-speed.use-case.spec.ts
│   ├── domain/                   # ← (futur) Tests spécifiques domain
│   └── README.md
├── fixtures/                     # ← Fakes & Builders pour tests
│   ├── builders/
│   ├── repositories/
│   ├── services/
│   └── README.md
└── e2e/
    ├── route.e2e-spec.ts        # Tests E2E
    └── jest-e2e.json
```

### Exemple de test Use Case avec Fakes & Builders

**❌ AVANT (avec mocks) :**
```typescript
describe('GetFastestRouteUseCase', () => {
  let useCase: GetFastestRouteUseCase;
  let mockPathFinder: jest.Mocked<PathFinder>;
  let mockCityRepository: jest.Mocked<CityRepository>;

  beforeEach(() => {
    mockPathFinder = { findFastestRoute: jest.fn() };
    mockCityRepository = { findByName: jest.fn(), save: jest.fn() };
    useCase = new GetFastestRouteUseCase(mockPathFinder, mockCityRepository);
  });

  it('should return route', async () => {
    mockCityRepository.findByName
      .mockResolvedValueOnce(parisCity)
      .mockResolvedValueOnce(lyonCity);
    mockPathFinder.findFastestRoute.mockResolvedValue(result);
    // ...
  });
});
```

**✅ APRÈS (avec fakes & builders) :**
```typescript
import {
  CityFixtures,
  RoadSegmentBuilder,
  PathfindingResultBuilder,
  CityInMemoryRepository,
  RoadSegmentInMemoryRepository,
  PathFinderFake,
} from '@test/fixtures';

describe('GetFastestRouteUseCase', () => {
  let useCase: GetFastestRouteUseCase;
  let cityRepository: CityInMemoryRepository;
  let roadSegmentRepository: RoadSegmentInMemoryRepository;
  let pathFinder: PathFinderFake;

  beforeEach(() => {
    // Créer les fakes (implémentations in-memory)
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

    useCase = new GetFastestRouteUseCase(
      pathFinder,
      roadSegmentRepository,
      cityRepository,
    );
  });

  it('should return the fastest route', async () => {
    // Arrange - Utiliser des builders
    const result = PathfindingResultBuilder.aPathfindingResult()
      .withTotalDistance(465)
      .withEstimatedTime(3.58)
      .build();
    
    pathFinder.givenResult(result);

    // Act
    const output = await useCase.execute({
      startCity: 'Paris',
      endCity: 'Lyon',
    });

    // Assert - Tester le comportement, pas les appels
    expect(output.totalDistance).toBe(465);
  });

  it('should throw SameStartAndEndCityError when cities are same', async () => {
    // Ce test couvre implicitement CityName.equals() du domain
    await expect(useCase.execute({
      startCity: 'Paris',
      endCity: 'Paris',
    })).rejects.toThrow(SameStartAndEndCityError);
  });

  it('should throw CityNotFoundError when city not in repository', async () => {
    // Pas besoin de mock - le repository in-memory lève l'erreur naturellement
    await expect(useCase.execute({
      startCity: 'UnknownCity',
      endCity: 'Lyon',
    })).rejects.toThrow(/City.*not found/);
  });
});
```

### Fixtures disponibles

**Builders :**
- `CityBuilder.aCity()` + `CityFixtures.paris()`, `.lyon()`, etc.
- `RoadSegmentBuilder.aRoadSegment()`
- `PathfindingResultBuilder.aPathfindingResult()`
- `RouteStepBuilder.aRouteStep()`

**Fakes (in-memory) :**
- `CityInMemoryRepository` avec `.givenCities([...])`
- `RoadSegmentInMemoryRepository` avec `.givenRoadSegments([...])`
- `PathFinderFake` avec `.givenResult(...)`

Voir `test/fixtures/README.md` pour la documentation complète.

## ⚡ Règles Essentielles

### À FAIRE ✅
- Constructeurs privés + factory methods `static create()`
- Value Objects pour tous les concepts métier
- Imports avec alias `@/` (ex: `import { City } from '@/domain/entities'`)
- Imports de fixtures avec `@test/` (ex: `import { CityFixtures } from '@test/fixtures'`)
- Barrel exports (`index.ts`) dans chaque dossier
- Mapper Domain → Output dans les Use Cases
- **Utiliser des Fakes & Builders au lieu de mocks Jest pour les tests fonctionnels**

### À NE PAS FAIRE ❌
- Importer infrastructure depuis domain
- Primitives pour concepts métier (utiliser Value Objects)
- Logique métier dans les Controllers
- `new Entity()` direct (utiliser factory methods)
- Tests unitaires séparés pour le Domain (tester via Use Cases)
- `@Injectable()` dans le Domain

## 🔧 Commandes

```bash
npm run start:dev      # Développement
npm run test           # Tests unitaires
npm run test:e2e       # Tests E2E
npm run test:cov       # Couverture
npm run lint           # Linter
npm run db:init        # Init base de données
```

## 📂 Fichiers de Règles

- `.cursor/rules/*.mdc` - Règles Cursor par domaine
- `.github/copilot-instructions.md` - Instructions GitHub Copilot
- `.windsurfrules` - Règles Windsurf/Cascade
