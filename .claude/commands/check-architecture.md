# Check Architecture

Validate that the codebase follows Clean Architecture dependency rules.

## Arguments

$ARGUMENTS - (optional) `graph` to generate dependency visualization

## Instructions

### Check Dependencies

Run the dependency check:

```bash
npm run deps:check
```

This validates:
- Domain layer imports nothing external
- Application layer imports only from Domain
- Infrastructure layer does not import from Presentation
- No circular dependencies (except allowed in Domain layer)

### Generate Dependency Graph

If argument is `graph`:

```bash
npm run deps:graph
```

This generates `docs/dependency-graph.svg` showing all project dependencies.

Requires Graphviz installed:
```bash
# Ubuntu/Debian
sudo apt-get install graphviz

# macOS
brew install graphviz
```

### Display Architecture

```bash
npm run deps:archi
```

Shows a text representation of the architecture.

## Interpreting Results

### Error Types

| Severity | Meaning |
|----------|---------|
| `error` | Critical violation - must be fixed |
| `warn` | Warning - should be fixed |

### Common Violations

| Violation | Meaning | Fix |
|-----------|---------|-----|
| `domain-no-external-deps` | Domain imports from other layers | Move code to infrastructure, use mapper |
| `application-no-infrastructure-deps` | Application imports infrastructure | Use domain interface, inject via DI |
| `no-circular` | Circular dependency | Import directly from file, not barrel |

## Fixing Violations

### Domain importing Infrastructure

Bad:
```typescript
// src/domain/entities/city.ts
import { CityTypeormEntity } from '@/infrastructure/database/entities';
```

Good:
```typescript
// src/infrastructure/database/mappers/city.mapper.ts
import { City } from '@/domain/entities';
import { CityTypeormEntity } from '../entities';
```

### Application importing Infrastructure

Bad:
```typescript
// src/application/use-cases/get-route/get-route.use-case.ts
import { CityTypeormRepository } from '@/infrastructure/database/repositories';
```

Good:
```typescript
// src/application/use-cases/get-route/get-route.use-case.ts
import { CityRepository } from '@/domain/repositories';
// Inject CityTypeormRepository via NestJS DI
```

## Pre-commit Hook

This check runs automatically before each commit via Husky.