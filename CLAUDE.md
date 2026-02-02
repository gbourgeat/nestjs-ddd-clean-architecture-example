# CLAUDE.md - Instructions for Claude Code

## Project Context

**Route Solver** - NestJS API for planning optimal routes between French cities.

- **Framework:** NestJS 11 + TypeScript (ES2023)
- **Database:** PostgreSQL with TypeORM
- **External API:** OpenWeatherMap (weather)
- **Algorithm:** Dijkstra for pathfinding

## Clean Architecture

```
src/
├── domain/           # Pure business logic (DEPENDS ON NOTHING)
│   ├── entities/     # Entities with identity
│   ├── value-objects/# Immutable objects
│   ├── services/     # Abstract interfaces
│   ├── repositories/ # Abstract classes
│   └── errors/       # Business errors
├── application/      # Orchestration (depends on domain)
│   ├── use-cases/    # One folder per use case
│   └── mappers/      # Data transformation
├── infrastructure/   # Implementations (depends on domain + application)
│   ├── database/     # TypeORM, migrations
│   ├── pathfinding/  # Dijkstra algorithm
│   └── openweathermap/ # Weather API
└── presentation/     # HTTP interface (depends on domain + application)
    └── rest-api/     # Controllers, DTOs
```

### STRICT Dependency Rules

- `domain/` → Imports NOTHING external
- `application/` → Imports only from `domain/`
- `infrastructure/` → Imports from `domain/` and `application/`
- `presentation/` → Imports from `domain/` and `application/`

## Code Patterns

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

### Business Error
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

### Repository (Interface in Domain)
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
    // ... business logic
    return PathfindingResultMapper.toOutput(result);
  }
}
```

## Naming Conventions

| Type | File | Class |
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

## Testing Strategy

### Fundamental Principle
**The Domain is tested INDIRECTLY through Use Case tests.**

- No `*.spec.ts` files in `src/domain/`
- Use Case unit tests cover the Domain
- E2E tests for HTTP endpoints

### Test Structure
```
test/
├── features/                     # ← Feature tests (Use Cases)
│   ├── application/
│   │   └── use-cases/
│   │       ├── get-fastest-route/
│   │       │   └── get-fastest-route.use-case.spec.ts
│   │       └── update-road-segment-speed/
│   │           └── update-road-segment-speed.use-case.spec.ts
│   ├── domain/                   # ← (future) Domain-specific tests
│   └── README.md
├── fixtures/                     # ← Fakes & Builders for tests
│   ├── builders/
│   ├── repositories/
│   ├── services/
│   └── README.md
└── e2e/
    ├── route.e2e-spec.ts        # E2E tests
    └── jest-e2e.json
```

### Use Case Test Example with Fakes & Builders

**BEFORE (with mocks):**
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

**AFTER (with fakes & builders):**
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
    // Create fakes (in-memory implementations)
    cityRepository = new CityInMemoryRepository();
    roadSegmentRepository = new RoadSegmentInMemoryRepository();
    pathFinder = new PathFinderFake();

    // Populate with test data
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
    // Arrange - Use builders
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

    // Assert - Test behavior, not calls
    expect(output.totalDistance).toBe(465);
  });

  it('should throw SameStartAndEndCityError when cities are same', async () => {
    // This test implicitly covers CityName.equals() from domain
    await expect(useCase.execute({
      startCity: 'Paris',
      endCity: 'Paris',
    })).rejects.toThrow(SameStartAndEndCityError);
  });

  it('should throw CityNotFoundError when city not in repository', async () => {
    // No mock needed - the in-memory repository throws the error naturally
    await expect(useCase.execute({
      startCity: 'UnknownCity',
      endCity: 'Lyon',
    })).rejects.toThrow(/City.*not found/);
  });
});
```

### Available Fixtures

**Builders:**
- `CityBuilder.aCity()` + `CityFixtures.paris()`, `.lyon()`, etc.
- `RoadSegmentBuilder.aRoadSegment()`
- `PathfindingResultBuilder.aPathfindingResult()`
- `RouteStepBuilder.aRouteStep()`

**Fakes (in-memory):**
- `CityInMemoryRepository` with `.givenCities([...])`
- `RoadSegmentInMemoryRepository` with `.givenRoadSegments([...])`
- `PathFinderFake` with `.givenResult(...)`

See `test/fixtures/README.md` for complete documentation.

## Essential Rules

### DO
- Private constructors + factory methods `static create()`
- Value Objects for all business concepts
- Imports with `@/` alias (e.g., `import { City } from '@/domain/entities'`)
- Fixture imports with `@test/` (e.g., `import { CityFixtures } from '@test/fixtures'`)
- Barrel exports (`index.ts`) in each folder
- Map Domain → Output in Use Cases
- **Use Fakes & Builders instead of Jest mocks for feature tests**

### DON'T
- Import infrastructure from domain
- Use primitives for business concepts (use Value Objects)
- Put business logic in Controllers
- Use `new Entity()` directly (use factory methods)
- Create separate unit tests for Domain (test through Use Cases)
- Use `@Injectable()` in Domain

## Commands

```bash
npm run start:dev      # Development
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage
npm run lint           # Linter
npm run db:init        # Init database
```

## Rules Files

- `.cursor/rules/*.mdc` - Cursor rules by domain
- `.github/copilot-instructions.md` - GitHub Copilot instructions
- `.windsurfrules` - Windsurf/Cascade rules
