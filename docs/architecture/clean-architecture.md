# Clean Architecture and Dependency Validation

## Overview

This project follows Clean/Hexagonal Architecture principles with strict dependency rules between layers. The `dependency-cruiser` tool automatically validates these rules.

## Architecture Layers

```
src/
├── domain/           # Pure business logic (depends on nothing)
├── application/      # Use case orchestration (depends on domain)
├── infrastructure/   # External implementations (depends on domain + application)
└── presentation/     # HTTP interface (depends on domain + application)
```

## Dependency Rules

### Domain Layer

- MUST NOT import from `application/`, `infrastructure/`, or `presentation/`
- MUST NOT import from `node_modules` (except `@types/*` if necessary)
- The domain must remain pure, without external dependencies

### Application Layer

- CAN import from `domain/`
- MUST NOT import from `infrastructure/`
- MUST NOT import from `presentation/`

### Infrastructure Layer

- CAN import from `domain/`
- CAN import from `application/`
- MUST NOT import from `presentation/`

### Presentation Layer

- CAN import from `domain/`
- CAN import from `application/`
- SHOULD NOT directly import from `infrastructure/` (use dependency injection)

### Circular Dependencies

- No circular dependencies are allowed anywhere in the project

## Validation Commands

### Check Dependencies

```bash
npm run deps:check
```

Validates all architecture rules. Run this before each commit.

### Generate Dependency Graph

```bash
npm run deps:graph
```

Generates an SVG file visualizing all project dependencies at `docs/dependency-graph.svg`.

Prerequisites: Requires Graphviz installed on your system.

```bash
# Ubuntu/Debian
sudo apt-get install graphviz

# macOS
brew install graphviz

# Windows (via Chocolatey)
choco install graphviz
```

### Display Architecture

```bash
npm run deps:archi
```

Displays a textual representation of the project architecture with dependencies between modules.

## Interpreting Results

### Example Output with Violations

```
warn presentation-no-infrastructure-deps: src/presentation/rest-api/rest-api.module.ts → src/infrastructure/pathfinding/pathfinding.module.ts

error domain-no-external-deps: src/domain/entities/city.ts → src/infrastructure/database/entities/city.typeorm-entity.ts
```

### Message Types

| Severity | Meaning |
|----------|---------|
| `error` | Critical violation - must be fixed immediately |
| `warn` | Warning - should be fixed but non-blocking |
| `info` | Information (not currently used) |

### Violation Reference

| Violation | Meaning | Action |
|-----------|---------|--------|
| `domain-no-external-deps` | Domain imports from other layers | Remove import and invert the dependency |
| `application-no-infrastructure-deps` | Application imports from infrastructure | Use a domain interface |
| `presentation-no-infrastructure-deps` | Presentation imports from infrastructure | Inject via NestJS modules |
| `no-circular` | Circular dependency detected | Refactor to break the cycle |

## Fixing Violations

### Violation 1: Domain imports Infrastructure

Bad:
```typescript
// src/domain/entities/city.ts
import { CityTypeormEntity } from '@/infrastructure/database/entities';

export class City {
  toTypeorm(): CityTypeormEntity { ... }
}
```

Good:
```typescript
// src/domain/entities/city.ts
export class City {
  // No infrastructure import
}

// src/infrastructure/database/mappers/city.mapper.ts
import { City } from '@/domain/entities';
import { CityTypeormEntity } from '@/infrastructure/database/entities';

export class CityMapper {
  static toDomain(entity: CityTypeormEntity): City { ... }
  static toTypeorm(city: City): CityTypeormEntity { ... }
}
```

### Violation 2: Application imports Infrastructure

Bad:
```typescript
// src/application/use-cases/get-route/get-route.use-case.ts
import { CityTypeormRepository } from '@/infrastructure/database/repositories';

export class GetRouteUseCase {
  constructor(private readonly cityRepo: CityTypeormRepository) {}
}
```

Good:
```typescript
// src/application/use-cases/get-route/get-route.use-case.ts
import { CityRepository } from '@/domain/repositories';

export class GetRouteUseCase {
  constructor(private readonly cityRepo: CityRepository) {}
}

// src/infrastructure/database/database.module.ts
@Module({
  providers: [
    {
      provide: CityRepository,
      useClass: CityTypeormRepository,
    },
  ],
})
export class DatabaseModule {}
```

### Violation 3: Circular Dependencies

Bad:
```typescript
// src/domain/value-objects/index.ts
export * from './city-name';
export * from './city-id';

// src/domain/value-objects/city-id.ts
import { InvalidCityIdError } from '@/domain/errors';

// src/domain/errors/index.ts
export * from './city-not-found.error';

// src/domain/errors/city-not-found.error.ts
import { CityId } from '@/domain/value-objects';
```

Good:
```typescript
// Option 1: Import files directly, not barrel exports
// src/domain/errors/city-not-found.error.ts
import { CityId } from '@/domain/value-objects/city-id';

// Option 2: Avoid cross-imports
// src/domain/errors/city-not-found.error.ts
export class CityNotFoundError extends Error {
  constructor(cityId: string) { // Use string instead of CityId
    super(`City ${cityId} not found`);
  }
}
```

### Violation 4: Presentation imports Infrastructure

Acceptable but not recommended:
```typescript
// src/presentation/rest-api/rest-api.module.ts
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { PathfindingModule } from '@/infrastructure/pathfinding/pathfinding.module';

@Module({
  imports: [DatabaseModule, PathfindingModule],
})
export class RestApiModule {}
```

Best practice:
```typescript
// src/app.module.ts (root module)
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { PathfindingModule } from '@/infrastructure/pathfinding/pathfinding.module';
import { RestApiModule } from '@/presentation/rest-api/rest-api.module';

@Module({
  imports: [
    DatabaseModule,
    PathfindingModule,
    RestApiModule,
  ],
})
export class AppModule {}
```

## CI/CD Integration

### GitHub Actions

Add this step to your CI workflow:

```yaml
- name: Check Architecture Dependencies
  run: npm run deps:check
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run deps:check
```

## Advanced Configuration

The `.dependency-cruiser.js` file contains the complete configuration. You can:

- Modify the severity of rules (`error`, `warn`, `info`)
- Add exceptions with `pathNot`
- Create new custom rules

### Example: Allow a Temporary Exception

```javascript
{
  name: 'application-no-infrastructure-deps',
  severity: 'error',
  from: {
    path: '^src/application',
  },
  to: {
    path: '^src/infrastructure',
    pathNot: [
      'src/infrastructure/common/types.ts', // Temporary exception
    ],
  },
}
```

## Pre-PR Checklist

Before submitting a Pull Request:

- [ ] `npm run deps:check` returns no errors
- [ ] Warnings are justified and documented
- [ ] No circular dependencies have been introduced
- [ ] Architecture rules are respected

## Resources

- [Dependency Cruiser Documentation](https://github.com/sverweij/dependency-cruiser)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
