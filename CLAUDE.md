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
├── features/                     # Feature tests (Use Cases)
│   ├── application/
│   │   └── use-cases/
│   │       ├── get-fastest-route/
│   │       │   └── get-fastest-route.use-case.spec.ts
│   │       └── update-road-segment-speed/
│   │           └── update-road-segment-speed.use-case.spec.ts
│   ├── domain/                   # (future) Domain-specific tests
│   └── README.md
├── fixtures/                     # Fakes & Builders for tests
│   ├── builders/
│   ├── repositories/
│   ├── services/
│   └── README.md
└── e2e/
    ├── route.e2e-spec.ts        # E2E tests
    └── jest-e2e.json
```

### Use Case Test Example with Fakes & Builders

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
    await expect(useCase.execute({
      startCity: 'Paris',
      endCity: 'Paris',
    })).rejects.toThrow(SameStartAndEndCityError);
  });

  it('should throw CityNotFoundError when city not in repository', async () => {
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

### Task Runner (Recommended)

```bash
task setup            # First-time setup (install + env + db + migrations)
task dev              # Start development server
task test             # Run feature tests
task test:cov         # Run tests with coverage
task test:e2e         # Run E2E tests
task check            # Lint + format + tests
task docker:dev:up    # Start development database
task migration:run    # Run database migrations
task db:reset         # Reset database completely
```

### npm Scripts

```bash
npm run start:dev          # Development server
npm run test:features      # Feature tests (Use Cases)
npm run test:features:cov  # Feature tests with coverage
npm run test:e2e           # E2E tests
npm run test:e2e:cov       # E2E tests with coverage
npm run lint               # Lint code
npm run format             # Format code
npm run deps:check         # Check architecture dependencies
```

### Docker

```bash
npm run docker:dev:up           # Start dev database (port 54320)
npm run docker:dev:down         # Stop dev database
npm run docker:e2e:up           # Start E2E database (port 54321)
npm run docker:e2e:down         # Stop E2E database
npm run docker:integration:up   # Start integration database (port 54322)
```

## Documentation

All documentation is in the `docs/` folder:

| Category | Document | Description |
|----------|----------|-------------|
| Architecture | `docs/architecture/clean-architecture.md` | Layer rules, dependency validation |
| Architecture | `docs/architecture/domain-patterns.md` | Result pattern, aggregates |
| Infrastructure | `docs/infrastructure/docker.md` | Docker environments, ports |
| Infrastructure | `docs/infrastructure/ci-cd.md` | GitHub Actions, CI configuration |
| Workflows | `docs/workflows/git.md` | Branch strategy, commits, PRs |
| Workflows | `docs/workflows/pre-commit-hooks.md` | Husky, lint-staged setup |
| Tools | `docs/tools/task-runner.md` | Task installation, commands |
| Features | `docs/features/create-road-segment.md` | POST /road-segments endpoint |

## Git Workflow

### Branch Naming
```
<type>/<ticket-id>-<description>
```
Types: `feature/`, `fix/`, `hotfix/`, `refactor/`, `docs/`, `test/`, `chore/`, `perf/`

### Commit Convention (Conventional Commits)
```
<type>(<scope>): <description>
```
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

### PR Title Format
```
[<TYPE>] <Description>
```
Types: `[FEATURE]`, `[FIX]`, `[HOTFIX]`, `[REFACTOR]`, `[DOCS]`, `[TEST]`, `[CHORE]`

## Rules Files

- `.cursor/rules/*.mdc` - Cursor rules by domain
- `.github/copilot-instructions.md` - GitHub Copilot instructions
- `.windsurfrules` - Windsurf/Cascade rules
- `.claude/commands/` - Claude Code custom commands
