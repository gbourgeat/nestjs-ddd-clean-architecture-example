# Route Solver

> A NestJS example implementation of Clean Architecture and Domain-Driven Design (DDD)

Route Solver is an API for planning optimal routes between French cities, using the Dijkstra algorithm with real-time weather conditions from OpenWeatherMap.

## Purpose

This project serves as a **reference implementation** demonstrating how to build a maintainable, testable, and scalable backend application using:

- **Clean Architecture** (Hexagonal Architecture)
- **Domain-Driven Design** (DDD) patterns
- **NestJS** framework with TypeScript

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | NestJS 11 |
| Language | TypeScript (ES2023) |
| Database | PostgreSQL + TypeORM |
| External API | OpenWeatherMap |
| Cache | cache-manager |
| Validation | class-validator / class-transformer |
| Documentation | Swagger/OpenAPI |

## Architecture Overview

The project follows a **strict layered architecture** where dependencies only point inward:

```
┌──────────────────────────────────────────────────────────────┐
│                    PRESENTATION                              │
│         (Controllers, Requests, Responses, Schemas)          │
├──────────────────────────────────────────────────────────────┤
│                    APPLICATION                               │
│              (Use Cases, Mappers, DTOs)                      │
├──────────────────────────────────────────────────────────────┤
│                      DOMAIN                                  │
│    (Entities, Value Objects, Services, Repositories, Errors) │
├──────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE                             │
│        (Database, External APIs, Pathfinding impl)           │
└──────────────────────────────────────────────────────────────┘
```

### Dependency Rules

| Layer | Allowed Dependencies |
|-------|---------------------|
| **Domain** | None (pure business logic) |
| **Application** | Domain only |
| **Infrastructure** | Domain + Application |
| **Presentation** | Domain + Application |

## Project Structure

```
src/
├── domain/                      # Pure business logic
│   ├── entities/                # Domain entities with identity
│   ├── value-objects/           # Immutable value objects
│   ├── services/                # Abstract service interfaces
│   ├── repositories/            # Abstract repository interfaces
│   └── errors/                  # Business domain errors
│
├── application/                 # Use case orchestration
│   ├── use-cases/               # One folder per use case
│   │   └── <use-case>/
│   │       ├── <use-case>.use-case.ts
│   │       ├── <use-case>.input.ts
│   │       └── <use-case>.output.ts
│   └── mappers/                 # Domain ↔ Application transformations
│
├── infrastructure/              # Technical implementations
│   ├── database/                # TypeORM entities, repositories, migrations
│   ├── openweathermap/          # Weather API adapter
│   └── pathfinding/             # Dijkstra algorithm implementation
│
└── presentation/                # User interface (HTTP)
    └── rest-api/
        ├── controllers/         # HTTP endpoint handlers
        ├── requests/            # Request DTOs
        ├── responses/           # Response DTOs
        └── schemas/             # Shared Swagger schemas
```

## DDD Patterns Implemented

### 1. Value Objects

Value Objects are **immutable** and encapsulate validation. They represent concepts with no identity.

```typescript
// domain/value-objects/city-name.ts
export class CityName {
  private constructor(private readonly _value: string) {}

  static create(name: string): CityName {
    if (!name || name.trim().length === 0) {
      throw InvalidCityNameError.empty();
    }
    return new CityName(name.trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: CityName): boolean {
    return this._value === other._value;
  }
}
```

**Key characteristics:**
- Private constructor prevents direct instantiation
- Factory method `create()` performs validation
- Immutable (no setters)
- `equals()` method for value comparison

### 2. Entities

Entities have **identity** and use factory methods for creation.

```typescript
// domain/entities/city.ts
export class City {
  private constructor(
    public readonly id: CityId,
    public readonly name: CityName,
  ) {}

  static create(id: CityId, name: CityName): City {
    return new City(id, name);
  }

  equals(other: City): boolean {
    return this.id.equals(other.id);
  }
}
```

**Key characteristics:**
- Uses Value Objects for all properties (`CityId`, `CityName`)
- Identity-based equality (compares by `id`)
- Factory method for controlled instantiation

### 3. Repository Pattern

The **interface is defined in the domain layer**, while the implementation lives in infrastructure.

```typescript
// domain/repositories/city.repository.ts
export abstract class CityRepository {
  abstract findByName(name: CityName): Promise<City>;
  abstract save(city: City): Promise<void>;
}

// infrastructure/database/repositories/city.typeorm-repository.ts
@Injectable()
export class CityTypeormRepository implements CityRepository {
  constructor(
    @InjectRepository(CityTypeormEntity)
    private readonly typeormRepository: Repository<CityTypeormEntity>,
  ) {}

  async findByName(name: CityName): Promise<City> {
    const entity = await this.typeormRepository.findOne({
      where: { name: name.value },
    });
    if (!entity) {
      throw CityNotFoundError.forCityName(name);
    }
    return City.create(
      CityId.fromNormalizedValue(entity.id),
      CityName.create(entity.name),
    );
  }
}
```

**Key characteristics:**
- Abstract class in domain defines the contract
- Infrastructure provides the TypeORM implementation
- Repository returns domain entities, not database entities
- Dependency Inversion: domain doesn't know about database

### 4. Domain Errors

Business errors use **factory methods** for contextual error creation.

```typescript
// domain/errors/city-not-found.error.ts
export class CityNotFoundError extends Error {
  private constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static forCityName(cityName: CityName): CityNotFoundError {
    return new CityNotFoundError(
      `City with name "${cityName.value}" not found`,
    );
  }
}
```

### 5. Use Cases

Each use case represents **one business feature** with explicit Input/Output.

```typescript
// application/use-cases/get-fastest-route/get-fastest-route.use-case.ts
export class GetFastestRouteUseCase {
  constructor(
    private readonly pathFinder: PathFinder,
    private readonly roadSegmentRepository: RoadSegmentRepository,
    private readonly cityRepository: CityRepository,
  ) {}

  async execute(input: GetFastestRouteInput): Promise<GetFastestRouteOutput> {
    // 1. Transform and validate input using Value Objects
    const startCityName = CityName.create(input.startCity);
    const endCityName = CityName.create(input.endCity);

    // 2. Execute business logic
    const startCity = await this.cityRepository.findByName(startCityName);
    const endCity = await this.cityRepository.findByName(endCityName);
    const segments = await this.roadSegmentRepository.findAll();
    
    const result = await this.pathFinder.findFastestRoute(
      segments, startCity, endCity, constraints
    );

    // 3. Map to output
    return PathfindingResultMapper.toOutput(result);
  }
}
```

**Key characteristics:**
- Dependencies injected via constructor (all abstractions)
- Input/Output are simple data structures
- Orchestrates domain logic without containing business rules
- Maps between layers using dedicated mappers

### 6. Domain Services

Abstract interfaces for complex domain operations.

```typescript
// domain/services/path-finder.ts
export abstract class PathFinder {
  abstract findFastestRoute(
    segments: RoadSegment[],
    startCity: City,
    endCity: City,
    constraints?: RoadConstraints,
  ): Promise<PathfindingResult | null>;
}
```

The implementation (`DijkstraPathFinder`) lives in infrastructure.

## Dependency Injection

NestJS modules handle the wiring between abstractions and implementations:

```typescript
@Module({
  providers: [
    {
      provide: CityRepository,      // Abstract class (token)
      useClass: CityTypeormRepository,  // Concrete implementation
    },
    {
      provide: PathFinder,
      useClass: DijkstraPathFinder,
    },
  ],
  exports: [CityRepository, PathFinder],  // Export abstractions
})
export class InfrastructureModule {}
```

## Testing Strategy

**Domain logic is tested indirectly through Use Case tests.**

### Test Types

| Test Type | Description | Location | Command |
|-----------|-------------|----------|---------|
| **Feature Tests** (Use Cases) | Test business logic by testing use cases, which exercise domain entities, value objects, and errors | `test/features/application/**/*.spec.ts` | `npm run test:features:cov` |
| **E2E Tests** | Test complete HTTP flows | `test/e2e/**/*.e2e-spec.ts` | `npm run test:e2e` |

### Test Structure

```
test/
├── features/              # Feature tests (Use Cases + Domain)
│   ├── application/
│   │   └── use-cases/    # Use Case tests
│   └── domain/           # (future) Domain-specific tests
├── fixtures/             # Test doubles (Fakes & Builders)
│   ├── builders/         # Builders for test data
│   ├── repositories/     # In-memory repositories
│   └── services/         # Service fakes
└── e2e/                  # End-to-end tests
```

### Feature Tests with Fakes & Builders

Instead of mocking with Jest, we use **Fakes** (in-memory implementations) and **Builders** (test data construction):

```typescript
import {
  CityFixtures,
  RoadSegmentBuilder,
  CityInMemoryRepository,
  PathFinderFake,
} from '@test/fixtures';

describe('GetFastestRouteUseCase', () => {
  let cityRepository: CityInMemoryRepository;
  let pathFinder: PathFinderFake;
  
  beforeEach(() => {
    cityRepository = new CityInMemoryRepository();
    pathFinder = new PathFinderFake();
    
    // Populate with test data
    cityRepository.givenCities([
      CityFixtures.paris(),
      CityFixtures.lyon(),
    ]);
  });
  
  it('should calculate route', async () => {
    // Arrange
    const result = PathfindingResultBuilder.aPathfindingResult()
      .withTotalDistance(465)
      .build();
    pathFinder.givenResult(result);
    
    // Act & Assert
    const output = await useCase.execute({
      startCity: 'Paris',
      endCity: 'Lyon',
    });
    expect(output.totalDistance).toBe(465);
  });
});
```

See `test/fixtures/README.md` for complete documentation.

### Feature Tests Coverage

Feature tests provide coverage metrics for the **Application** and **Domain** layers only:

```bash
npm run test:features:cov
```

This command will:
- ✅ Run all Use Case tests (`test/features/**/*.spec.ts`)
- ✅ Generate coverage report for `application/` and `domain/` folders
- ✅ Display detailed coverage by file
- ✅ Enforce 97%+ coverage threshold
- ✅ Generate HTML report in `coverage/features/`

**Coverage includes:**
- Domain entities and value objects (tested indirectly)
- Domain errors (tested indirectly)
- Use cases (tested directly)
- Application mappers (tested indirectly)

### Test Structure

```
src/application/use-cases/<use-case>/
├── <use-case>.use-case.ts
├── <use-case>.use-case.spec.ts    # ✅ Functional tests here
├── <use-case>.input.ts
└── <use-case>.output.ts

test/e2e/
├── route.e2e-spec.ts              # ✅ E2E tests here
└── jest-e2e.json
```

Use Case tests mock repository and service dependencies, but exercise real Value Objects and Entities:

```typescript
describe('GetFastestRouteUseCase', () => {
  it('should throw InvalidCityNameError for empty city', async () => {
    // ✅ This test covers CityName.create() from domain
    await expect(useCase.execute({
      startCity: '',
      endCity: 'Lyon',
    })).rejects.toThrow(InvalidCityNameError);
  });

  it('should throw SameStartAndEndCityError when cities match', async () => {
    // ✅ This test covers CityName.equals() from domain
    await expect(useCase.execute({
      startCity: 'Paris',
      endCity: 'Paris',
    })).rejects.toThrow(SameStartAndEndCityError);
  });
});
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- OpenWeatherMap API key

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database and OpenWeatherMap credentials

# Initialize database
npm run db:init

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start in development mode (watch) |
| `npm run build` | Build for production |
| `npm run start:prod` | Run production build |
| `npm run test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run all tests with coverage |
| `npm run test:features` | Run feature tests (Use Cases) |
| `npm run test:features:watch` | Run feature tests in watch mode |
| `npm run test:features:cov` | Run feature tests with coverage (Application + Domain) |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint and fix code |
| `npm run migration:run` | Run database migrations |
| `npm run db:init` | Initialize database |

## API Documentation

Once the server is running, Swagger documentation is available at:

```
http://localhost:3000/api
```

### Example Request

```bash
curl -X POST http://localhost:3000/get-fastest-route \
  -H "Content-Type: application/json" \
  -d '{
    "startCity": "Paris",
    "endCity": "Marseille",
    "constraints": {
      "excludeWeather": ["rain", "snow"],
      "maxDistance": 500,
      "minSpeed": 100
    }
  }'
```

### Example Response

```json
{
  "path": ["Paris", "Lyon", "Marseille"],
  "totalDistance": 775,
  "estimatedTime": 7.1,
  "steps": [
    {
      "from": "Paris",
      "to": "Lyon",
      "distance": 465,
      "speed": 110,
      "weather": "sunny"
    },
    {
      "from": "Lyon",
      "to": "Marseille",
      "distance": 310,
      "speed": 110,
      "weather": "cloudy"
    }
  ]
}
```

## Key Principles Summary

| Principle | Implementation |
|-----------|---------------|
| **Dependency Inversion** | Domain defines interfaces, Infrastructure implements |
| **Single Responsibility** | One use case = one business feature |
| **Immutability** | Value Objects are immutable with private constructors |
| **Encapsulation** | Validation logic inside Value Objects |
| **Factory Methods** | `static create()` instead of public constructors |
| **Rich Domain Model** | Business logic in entities and value objects |
| **Anti-Corruption Layer** | Mappers between layers prevent leaking |

## Anti-Patterns Avoided

- ❌ Importing Infrastructure from Domain
- ❌ Using primitives for business concepts (use Value Objects)
- ❌ Business logic in Controllers
- ❌ Direct entity instantiation (`new Entity()`)
- ❌ Generic exceptions (use domain-specific errors)
- ❌ Anemic domain models

## Further Reading

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design by Eric Evans](https://domainlanguage.com/ddd/)
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)

## License

This project is unlicensed and intended for educational purposes.
