# Route Solver

[![CI](https://github.com/gbourgeat/nestjs-ddd-clean-architecture-example/actions/workflows/ci.yml/badge.svg)](https://github.com/gbourgeat/nestjs-ddd-clean-architecture-example/actions/workflows/ci.yml)
[![Barrel Exports](https://img.shields.io/badge/barrel%20exports-✅%20supported-brightgreen)](./docs/DEPENDENCY-CHECKING-BARRELS.md)
[![Architecture](https://img.shields.io/badge/architecture-hexagonal-blue)](#architecture-overview)

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
        ├── controllers/         # HTTP endpoint handlers (one per route)
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
| **Integration Tests** | Test infrastructure integrations (database, external APIs, algorithms) in isolation | `test/integration/**/*.spec.ts` | `npm run test:integration:cov` |
| **E2E Tests** | Test complete HTTP flows from request to response | `test/e2e/**/*.e2e-spec.ts` | `npm run test:e2e:cov` |

### Test Structure

```
test/
├── features/              # Feature tests (Use Cases + Domain)
│   ├── application/
│   │   └── use-cases/    # Use Case tests
│   └── domain/           # (future) Domain-specific tests
├── integration/          # Integration tests
│   ├── database/         # Database repository tests
│   ├── openweathermap/   # Weather API adapter tests
│   └── pathfinding/      # Dijkstra algorithm tests
├── fixtures/             # Test doubles (Fakes & Builders)
│   ├── builders/         # Builders for test data
│   ├── repositories/     # In-memory repositories
│   └── services/         # Service fakes
└── e2e/                  # End-to-end tests
    ├── get-fastest-route.e2e-spec.ts
    ├── create-road-segment.e2e-spec.ts
    └── update-road-segment-speed.e2e-spec.ts
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

## Architecture Dependency Validation

The project uses **dependency-cruiser** to automatically enforce the layered architecture rules. The configuration is **fully compatible with barrel exports** (index.ts files).

### Validation Rules

The following rules are automatically checked:

- **Domain** must not import from `application/`, `infrastructure/`, or `presentation/`
- **Application** must only import from `domain/`
- **Infrastructure** must not import from `presentation/`
- **Presentation** should avoid direct imports from `infrastructure/` (use DI)
- **No circular dependencies** are allowed (except in Domain layer and barrel exports)

### Commands

```bash
# Check architecture dependencies (runs on pre-commit)
npm run deps:check

# Generate dependency graph visualization (requires Graphviz)
npm run deps:graph

# Display architecture overview
npm run deps:archi
```

### Barrel Exports Support

Barrel exports (`index.ts` files) are fully supported for elegant imports:

```typescript
// ✅ Allowed - Barrel exports
import { CityId, CityName } from '@/domain/value-objects';

// ✅ Allowed - Direct imports
import { CityId } from '@/domain/value-objects/city-id';
```

The configuration excludes barrel files and Domain layer cycles from circular dependency detection, following DDD best practices.

### Pre-commit Hook

Dependency validation runs automatically before each commit. If violations are detected, the commit will be blocked.

**Documentation:** See [docs/DEPENDENCY-CHECKING.md](./docs/DEPENDENCY-CHECKING.md) for detailed guide (English), [docs/DEPENDENCY-CHECKING-FR.md](./docs/DEPENDENCY-CHECKING-FR.md) for French version, or [docs/DEPENDENCY-CHECKING-BARRELS.md](./docs/DEPENDENCY-CHECKING-BARRELS.md) for barrel exports configuration.


## Docker Environments

This project uses three separate Docker Compose configurations for different contexts:

- **`docker-compose.dev.yml`** - Development environment (PostgreSQL on port 54320)
- **`docker-compose.e2e.yml`** - End-to-End tests (PostgreSQL on port 54321, ephemeral)
- **`docker-compose.integration.yml`** - Integration tests (PostgreSQL on port 54322, ephemeral)

**Port strategy:** Ports 54320-54322 are used to avoid conflicts with local PostgreSQL (5432) or other services. Each environment has its own isolated database.

### Quick Start with Docker

```bash
# Start development database
npm run docker:dev:up

# Start E2E test database
npm run docker:e2e:up

# Start integration test database
npm run docker:integration:up

# Stop environments
npm run docker:dev:down
npm run docker:e2e:down
npm run docker:integration:down

# Restart with clean state (useful for tests)
npm run docker:e2e:restart
npm run docker:integration:restart
```

**Full Docker documentation:** See [docs/DOCKER.md](./docs/DOCKER.md) for detailed usage and configuration.

## Task Runner (Alternative to Make)

This project includes a `Taskfile.yml` for modern task automation (alternative to Makefile).

### Install Task

```bash
# macOS
brew install go-task

# Linux (snap)
snap install task --classic

# Or use the project's installation script
./scripts/install-task.sh
```

### Verify Installation

```bash
# Check Task version
task --version

# Verify complete environment
./scripts/check-task-env.sh
```

### Quick Commands with Task

```bash
# Show all available commands
task --list

# Full project setup (install + env + database + migrations)
task setup

# Start development server
task dev

# Run tests with coverage
task test:cov

# Run E2E tests
task test:e2e

# Database management
task docker:dev:up        # Start dev database
task migration:run        # Run migrations
task db:reset            # Reset database completely

# Code quality
task check               # Lint + format + test
```

**See all available tasks:** Run `task --list` or check `Taskfile.yml`  
**Full documentation:** See [docs/TASKFILE.md](./docs/TASKFILE.md)  
**Quick reference:** See [docs/TASK-QUICKREF.md](./docs/TASK-QUICKREF.md)

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (recommended) **OR** PostgreSQL 15+
- OpenWeatherMap API key

### Installation

```bash
# Install dependencies
npm install

# Start database (with Docker)
npm run docker:dev:up

# Configure environment
cp .env.example .env
# Edit .env with your database and OpenWeatherMap credentials
# Docker defaults:
#   DB_HOST=localhost
#   DB_PORT=54320
#   DB_USERNAME=route_solver
#   DB_PASSWORD=route_solver_password
#   DB_NAME=route_solver_dev

# Run migrations
npm run migration:run

# Seed database with initial data (optional)
npm run seed:run

# Start development server
npm run start:dev
```

**Without Docker:** Manually create a PostgreSQL database and update `.env` with your credentials.

**Code Quality:** Pre-commit hooks are automatically configured to format and lint your code before each commit. See [docs/PRE-COMMIT-HOOKS.md](docs/PRE-COMMIT-HOOKS.md) for details.

### Available Scripts

**Tip:** You can also use Task commands (see `task --list`) for a more convenient alternative to npm scripts.

| Command | Description |
|---------|-------------|
| **Development** | |
| `npm run start:dev` | Start in development mode (watch) |
| `npm run build` | Build for production |
| `npm run start:prod` | Run production build |
| **Testing** | |
| `npm run test` | Run feature tests (default) |
| `npm run test:watch` | Run feature tests in watch mode |
| `npm run test:cov` | Run feature tests with coverage |
| `npm run test:features` | Run feature tests (Use Cases) |
| `npm run test:features:watch` | Run feature tests in watch mode |
| `npm run test:features:cov` | Run feature tests with coverage (Application + Domain) |
| `npm run test:integration` | Run integration tests |
| `npm run test:integration:watch` | Run integration tests in watch mode |
| `npm run test:integration:cov` | Run integration tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:e2e:cov` | Run end-to-end tests with coverage |
| `npm run test:all` | Run all tests with coverage |
| **Docker** | |
| `npm run docker:dev:up` | Start development database |
| `npm run docker:dev:down` | Stop development database |
| `npm run docker:dev:logs` | View development database logs |
| `npm run docker:e2e:up` | Start E2E test database |
| `npm run docker:e2e:down` | Stop E2E test database |
| `npm run docker:e2e:restart` | Restart E2E database (clean state) |
| `npm run docker:integration:up` | Start integration test database |
| `npm run docker:integration:down` | Stop integration test database |
| `npm run docker:integration:restart` | Restart integration database (clean state) |
| **Code Quality** | |
| `npm run format` | Format code with Prettier |
| `npm run lint` | Lint and fix code with ESLint |
| **Database** | |
| `npm run migration:run` | Run database migrations |
| `npm run migration:generate` | Generate migration from entities |
| `npm run migration:create` | Create empty migration |
| `npm run migration:revert` | Revert last migration |
| `npm run migration:show` | Show migrations status |

## API Documentation

Once the server is running, Swagger documentation is available at:

```
http://localhost:3000/docs
```

### Available Endpoints

#### POST /get-fastest-route

Calculate the fastest route between two cities taking into account weather conditions and optional constraints.

**Request:**
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

**Response:**
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

#### POST /road-segments

Create a new road segment between two cities.

**Request:**
```bash
curl -X POST http://localhost:3000/road-segments \
  -H "Content-Type: application/json" \
  -d '{
    "startCity": "Paris",
    "endCity": "Lyon",
    "distance": 465,
    "defaultSpeed": 110
  }'
```

#### PATCH /road-segments/:id/speed

Update the speed limit of an existing road segment.

**Request:**
```bash
curl -X PATCH http://localhost:3000/road-segments/123/speed \
  -H "Content-Type: application/json" \
  -d '{
    "speed": 130
  }'
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

## Documentation

### Project Documentation
- [Architecture Dependency Checking](docs/DEPENDENCY-CHECKING.md) - Automated validation of architecture rules (EN)
- [Contrôle des Dépendances](docs/DEPENDENCY-CHECKING-FR.md) - Validation automatique des règles d'architecture (FR)
- [Pre-Commit Hooks](docs/PRE-COMMIT-HOOKS.md) - Automatic code formatting and linting before commits
- [Git Workflow & Strategy](docs/GIT-WORKFLOW.md) - Branch conventions, commits, and PRs
- [Git Cheat Sheet](docs/GIT-CHEAT-SHEET.md) - Quick reference for Git commands
- [Git Command Examples](docs/GIT-COMMANDS-EXAMPLES.md) - Detailed workflow examples
- [Docker Guide](docs/DOCKER.md) - Complete Docker setup and usage
- [Task Runner](docs/TASKFILE.md) - Task automation with Taskfile
- [Migration Guide](docs/MIGRATION.md) - Database migration management
- [CI/CD Guide](docs/CI.md) - Continuous Integration setup

### Feature Documentation
- [Create Road Segment Feature](docs/CREATE-ROAD-SEGMENT-FEATURE.md) - POST /road-segments endpoint documentation

### GitHub Configuration
- [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) - PR template
- [Code Owners](.github/CODEOWNERS) - Default reviewers definition

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This project is intended for educational purposes as a reference implementation of Clean Architecture and Domain-Driven Design patterns with NestJS.
