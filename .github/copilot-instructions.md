# Coding Instructions for AI Agents - Route Solver

## 🎯 Project Context

This project is a NestJS API for planning optimal routes between French cities, using the Dijkstra algorithm with real-time weather conditions.

**Tech Stack:**
- **Framework:** NestJS 11
- **Language:** TypeScript (ES2023)
- **Database:** PostgreSQL with TypeORM
- **External API:** OpenWeatherMap
- **Cache:** cache-manager
- **Validation:** class-validator / class-transformer

## 🏛️ Clean Architecture / Hexagonal Architecture

The project follows a strict layered architecture. **Strictly respect dependencies between layers:**

```
┌──────────────────────────────────────────────────────────────┐
│                    PRESENTATION                               │
│         (Controllers, Requests, Responses, Schemas)          │
├──────────────────────────────────────────────────────────────┤
│                    APPLICATION                                │
│              (Use Cases, Mappers, DTOs)                       │
├──────────────────────────────────────────────────────────────┤
│                      DOMAIN                                   │
│    (Entities, Value Objects, Services, Repositories, Errors) │
├──────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE                              │
│        (Database, External APIs, Pathfinding impl)           │
└──────────────────────────────────────────────────────────────┘
```

### Dependency Rules

- **Domain** → Depends on NOTHING (pure core layer)
- **Application** → Depends only on Domain
- **Infrastructure** → Depends on Domain and Application
- **Presentation** → Depends on Application and Domain

## 📁 Folder Structure

```
src/
├── domain/                      # Pure business logic
│   ├── entities/                # Domain entities
│   ├── value-objects/           # Immutable value objects
│   ├── services/                # Domain service interfaces
│   ├── repositories/            # Abstract repository interfaces
│   └── errors/                  # Business errors
│
├── application/                 # Use case orchestration
│   ├── use-cases/               # Use cases
│   │   └── <use-case>/          # One folder per use case
│   │       ├── <use-case>.use-case.ts
│   │       ├── <use-case>.input.ts
│   │       └── <use-case>.output.ts
│   └── mappers/                 # Domain ↔ Application transformation
│
├── infrastructure/              # Technical implementations
│   ├── database/                # TypeORM, migrations, seeders
│   │   ├── entities/            # TypeORM entities (suffix: .typeorm-entity.ts)
│   │   ├── repositories/        # Repository implementations (suffix: .typeorm-repository.ts)
│   │   ├── migrations/
│   │   └── seeders/
│   ├── openweathermap/          # Weather API adapter
│   └── pathfinding/             # Dijkstra algorithm
│       └── mappers/
│
└── presentation/                # User interface
    └── rest-api/
        ├── controllers/
        ├── requests/            # Request DTOs
        ├── responses/           # Response DTOs
        ├── schemas/             # Shared schemas (Swagger)
        └── mappers/
```

## 🔤 Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Domain Entity | `<name>.ts` | `city.ts`, `road-segment.ts` |
| Value Object | `<name>.ts` | `city-id.ts`, `weather-condition.ts` |
| Domain Error | `<name>.error.ts` | `city-not-found.error.ts` |
| Repository Interface | `<name>.repository.ts` | `city.repository.ts` |
| Repository Impl | `<name>.typeorm-repository.ts` | `city.typeorm-repository.ts` |
| TypeORM Entity | `<name>.typeorm-entity.ts` | `city.typeorm-entity.ts` |
| Use Case | `<name>.use-case.ts` | `get-fastest-route.use-case.ts` |
| Controller | `<name>.controller.ts` | `route.controller.ts` |
| Request DTO | `<name>.request.ts` | `get-fastest-route.request.ts` |
| Response DTO | `<name>.response.ts` | `get-fastest-route.response.ts` |
| Mapper | `<name>.mapper.ts` | `pathfinding-result.mapper.ts` |
| NestJS Module | `<name>.module.ts` | `database.module.ts` |
| Unit Test | `<name>.spec.ts` | `city.spec.ts` |
| E2E Test | `<name>.e2e-spec.ts` | `route.e2e-spec.ts` |

### Classes and Interfaces

| Type | Convention | Example |
|------|------------|---------|
| Domain Entity | PascalCase | `City`, `RoadSegment` |
| Value Object | PascalCase | `CityId`, `CityName`, `Distance` |
| Error | PascalCase + `Error` | `CityNotFoundError` |
| Repository Interface | Abstract class PascalCase | `abstract class CityRepository` |
| Repository Impl | PascalCase + `TypeormRepository` | `CityTypeormRepository` |
| Use Case | PascalCase + `UseCase` | `GetFastestRouteUseCase` |
| Use Case Input | PascalCase + `Input` | `GetFastestRouteInput` |
| Use Case Output | PascalCase + `Output` | `GetFastestRouteOutput` |
| Controller | PascalCase + `Controller` | `RouteController` |
| Request DTO | PascalCase + `Request` | `GetFastestRouteRequest` |
| Response DTO | PascalCase + `Response` | `GetFastestRouteResponse` |
| Mapper | PascalCase + `Mapper` | `PathfindingResultMapper` |
| Service interface | Interface PascalCase | `interface PathFinder` |

## 🧱 Architectural Patterns

### 1. Value Objects (Domain)

Value Objects are immutable and encapsulate validation.

```typescript
// ✅ GOOD: Value Object with factory method and validation
export class CityName {
  private constructor(private readonly _value: string) {}

  static create(value: string): CityName {
    if (!value || value.trim().length === 0) {
      throw InvalidCityNameError.empty();
    }
    return new CityName(value.trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: CityName): boolean {
    return this._value === other._value;
  }
}

// ❌ BAD: Using primitives
interface City {
  name: string; // Should be CityName
}
```

### 2. Entities (Domain)

Entities have identity and use factory methods.

```typescript
// ✅ GOOD: Entity with factory method and private constructor
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

### 3. Repositories (Domain → Infrastructure)

The interface is defined in the domain, the implementation in infrastructure.

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

### 4. Use Cases (Application)

One use case = one business feature with explicit Input/Output.

```typescript
// Use case structure
src/application/use-cases/get-fastest-route/
├── get-fastest-route.use-case.ts    # Logic
├── get-fastest-route.input.ts       # Input interface
├── get-fastest-route.output.ts      # Output interface
└── index.ts                         # Exports
```

```typescript
// ✅ GOOD: Use case with dependency injection
export class GetFastestRouteUseCase {
  constructor(
    private readonly pathFinder: PathFinder,
    private readonly roadSegmentRepository: RoadSegmentRepository,
    private readonly cityRepository: CityRepository,
  ) {}

  async execute(input: GetFastestRouteInput): Promise<GetFastestRouteOutput> {
    // 1. Validate and transform inputs
    const startCityName = CityName.create(input.startCity);
    const endCityName = CityName.create(input.endCity);

    // 2. Execute business logic
    const result = await this.pathFinder.findFastestRoute(...);

    // 3. Map and return the result
    return PathfindingResultMapper.toOutput(result);
  }
}
```

### 5. Business Errors (Domain)

Use static factory methods to create contextual errors.

```typescript
// ✅ GOOD: Error with factory methods
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

### 6. Controllers (Presentation)

Controllers delegate to use cases and handle HTTP errors. **One controller = one route/endpoint.**

```typescript
@ApiTags('Routes')
@Controller()
export class GetFastestRouteController {
  constructor(
    private readonly getFastestRouteUseCase: GetFastestRouteUseCase,
  ) {}

  @Post('/get-fastest-route')
  @ApiOperation({ summary: 'Calculate the fastest route' })
  @ApiResponse({ status: 200, type: GetFastestRouteResponse })
  @ApiResponse({ status: 404, description: 'City not found' })
  async getFastestRoute(
    @Body() request: GetFastestRouteRequest,
  ): Promise<GetFastestRouteResponse> {
    try {
      const output = await this.getFastestRouteUseCase.execute({
        startCity: request.startCity,
        endCity: request.endCity,
        constraints: request.constraints,
      });
      return RouteResponseMapper.fromOutput(output);
    } catch (error) {
      if (error instanceof CityNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }
}
```

**Naming:** `<action>.controller.ts` (e.g., `get-fastest-route.controller.ts`, `update-road-segment-speed.controller.ts`)

## 📝 Coding Rules

### TypeScript

1. **Use imports with `@/` alias** for absolute paths
   ```typescript
   import { City } from '@/domain/entities';
   import { CityName } from '@/domain/value-objects';
   ```

2. **No explicit `any`** - Use precise types

3. **Prefer `readonly` for immutable properties**

4. **Use barrel exports** (`index.ts` files) in each folder

### Validation and DTOs

1. **Requests:** Use `class-validator` and `class-transformer`
   ```typescript
   export class GetFastestRouteRequest {
     @IsNotEmpty()
     @IsString()
     startCity: string;

     @ApiPropertyOptional()
     @IsOptional()
     @ValidateNested()
     @Type(() => RouteConstraints)
     constraints?: RouteConstraints;
   }
   ```

2. **Responses:** Document with `@ApiProperty` for Swagger
   ```typescript
   export class GetFastestRouteResponse {
     @ApiProperty({ description: 'List of cities in the path' })
     path!: string[];
   }
   ```

### NestJS Modules

1. **One module per technical domain**
2. **Use `useFactory` for complex injections**
3. **Export abstract tokens, not implementations**

```typescript
@Module({
  providers: [
    {
      provide: CityRepository,  // Abstract interface
      useClass: CityTypeormRepository,  // Implementation
    },
  ],
  exports: [CityRepository],  // Export the abstraction
})
export class DatabaseModule {}
```

### Tests

**Strategy: The Domain is tested INDIRECTLY via Use Case tests.**

1. **❌ NO `*.spec.ts` files in `src/domain/`**
2. **✅ Unit tests of Use Cases** cover entities, value objects and domain errors
3. **E2E Tests:** Folder `test/e2e/`, suffix `.e2e-spec.ts`
4. **Mock external dependencies** in unit tests
5. **Use `jest.Mocked<T>`** to type mocks

```typescript
// Use Case tests implicitly cover the Domain
describe('GetFastestRouteUseCase', () => {
  it('should throw InvalidCityNameError for empty city', async () => {
    // ✅ This test covers CityName.create() from domain
    await expect(useCase.execute({
      startCity: '',
      endCity: 'Lyon',
    })).rejects.toThrow(InvalidCityNameError);
  });
});
```

## 🚫 Anti-Patterns to Avoid

1. **❌ NEVER import Infrastructure from Domain**
2. **❌ Don't use TypeORM classes in the domain**
3. **❌ Don't put business logic in controllers**
4. **❌ Don't use primitives for business concepts** (use Value Objects)
5. **❌ Don't create entities with `new Entity()`** (use factory methods)
6. **❌ Don't throw generic exceptions** (create dedicated business errors)
7. **❌ Don't create separate tests for Domain** (test via Use Cases)
8. **❌ Don't group multiple routes in a single controller** (one controller per route)

## 📚 References

- **NestJS:** https://docs.nestjs.com
- **TypeORM:** https://typeorm.io
- **class-validator:** https://github.com/typestack/class-validator
- **Swagger/OpenAPI:** https://docs.nestjs.com/openapi/introduction
