# Route Solver - Quick Guide for AI Agents

## 🎯 Project Summary

NestJS API for planning optimal routes between French cities with:
- Dijkstra algorithm
- Weather conditions consideration (OpenWeatherMap)
- User constraints (weather, distance, speed)

## 🏗️ Clean Architecture

```
src/
├── domain/          ← Pure business logic (DEPENDS ON NOTHING)
├── application/     ← Use Cases (depends on domain)
├── infrastructure/  ← Implementations (depends on domain + application)
└── presentation/    ← REST API (depends on application + domain)
```

## 📝 Quick Checklist

### Create a new feature

1. **Domain** (if needed)
   - [ ] Entity: `src/domain/entities/<name>.ts`
   - [ ] Value Object: `src/domain/value-objects/<name>.ts`
   - [ ] Error: `src/domain/errors/<name>.error.ts`
   - [ ] Repository interface: `src/domain/repositories/<name>.repository.ts`
   - [ ] Service interface: `src/domain/services/<name>.ts`

2. **Application**
   - [ ] Use Case: `src/application/use-cases/<use-case-name>/`
     - `<use-case-name>.input.ts`
     - `<use-case-name>.output.ts`
     - `<use-case-name>.use-case.ts`
     - `index.ts`
   - [ ] Mapper: `src/application/mappers/<concept>.mapper.ts`

3. **Infrastructure**
   - [ ] Repository impl: `src/infrastructure/database/repositories/<name>.typeorm-repository.ts`
   - [ ] TypeORM Entity: `src/infrastructure/database/entities/<name>.typeorm-entity.ts`
   - [ ] Module: `src/infrastructure/<module>/<module>.module.ts`

4. **Presentation**
   - [ ] Request: `src/presentation/rest-api/requests/<action>.request.ts`
   - [ ] Response: `src/presentation/rest-api/responses/<action>.response.ts`
   - [ ] Controller: `src/presentation/rest-api/controllers/<resource>.controller.ts`

5. **Tests**
   - [ ] Test Use Case: `src/application/use-cases/<use-case-name>/<use-case-name>.use-case.spec.ts`
   - [ ] E2E Test: `test/e2e/<feature>.e2e-spec.ts`
   - ❌ **NO separate Domain tests** (covered by Use Case tests)

## ⚡ Essential Rules

### DO ✅
- Use **Value Objects** for all business concepts
- **Factory methods** (`static create()`) for entities/value objects
- **Private constructors** to enforce factory methods
- **Abstract classes** for interfaces (Repository, Service)
- **Imports with `@/` alias** (e.g. `import { City } from '@/domain/entities'`)
- **Barrel exports** (`index.ts`) in each folder
- **Document with JSDoc** public methods

### DON'T ❌
- Import Infrastructure from Domain
- Use primitives (`string`, `number`) for business concepts
- Put business logic in Controllers
- Create entities with `new Entity()`
- Throw generic `Error` (use business errors)
- Use `@Injectable()` in Domain
- Create separate Domain tests (test via Use Cases)

## 🔧 Useful Commands

```bash
# Development
npm run start:dev

# Tests
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage

# Database
npm run db:init           # Initialize DB
npm run migration:run     # Run migrations
npm run migration:generate # Generate migration

# Quality
npm run lint              # Linter
npm run format            # Format code
```

## 📂 Naming Conventions

| Type | File | Class |
|------|---------|--------|
| Domain Entity | `city.ts` | `City` |
| Value Object | `city-id.ts` | `CityId` |
| Error | `city-not-found.error.ts` | `CityNotFoundError` |
| Repository | `city.repository.ts` | `CityRepository` (abstract) |
| Repository Impl | `city.typeorm-repository.ts` | `CityTypeormRepository` |
| TypeORM Entity | `city.typeorm-entity.ts` | `CityTypeormEntity` |
| Use Case | `get-fastest-route.use-case.ts` | `GetFastestRouteUseCase` |
| Request | `get-fastest-route.request.ts` | `GetFastestRouteRequest` |
| Response | `get-fastest-route.response.ts` | `GetFastestRouteResponse` |
| Mapper | `pathfinding-result.mapper.ts` | `PathfindingResultMapper` |

## 📚 Detailed Rule Files

For complete instructions, see `.cursor/rules/`:
- `architecture.mdc` - Global architecture rules
- `domain-entities.mdc` - Creating entities
- `domain-value-objects.mdc` - Creating value objects
- `domain-errors.mdc` - Creating business errors
- `domain-services.mdc` - Abstract services
- `repositories.mdc` - Repository pattern
- `use-cases.mdc` - Use cases
- `presentation.mdc` - Controllers, DTOs
- `typeorm-entities.mdc` - Persistence entities
- `mappers.mdc` - Data transformation
- `nestjs-modules.mdc` - NestJS modules
- `testing.mdc` - Unit and E2E tests
