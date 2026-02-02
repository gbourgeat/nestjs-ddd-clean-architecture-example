# Create Feature

Create a complete feature from domain to HTTP endpoint following Clean Architecture.

## Arguments

$ARGUMENTS - Feature name in kebab-case (e.g., "get-city-weather")

## Instructions

This command creates a complete vertical slice through all layers:

### 1. Domain Layer (if needed)

Create any new domain concepts:

- **Value Objects** in `src/domain/value-objects/`
- **Entities** in `src/domain/entities/`
- **Errors** in `src/domain/errors/`
- **Repository interfaces** in `src/domain/repositories/`
- **Service interfaces** in `src/domain/services/`

### 2. Application Layer

Create the use case:

```
src/application/use-cases/$ARGUMENTS/
├── $ARGUMENTS.input.ts
├── $ARGUMENTS.output.ts
├── $ARGUMENTS.use-case.ts
└── index.ts
```

### 3. Infrastructure Layer (if needed)

Implement any new repository or service:

- **TypeORM repositories** in `src/infrastructure/database/repositories/`
- **External API adapters** in `src/infrastructure/*/`

### 4. Presentation Layer

Create the HTTP endpoint:

```
src/presentation/rest-api/
├── controllers/$ARGUMENTS.controller.ts
├── requests/$ARGUMENTS.request.ts (if POST/PATCH/PUT)
└── responses/$ARGUMENTS.response.ts
```

### 5. Test Files

Create test files:

```
test/features/application/use-cases/$ARGUMENTS/
└── $ARGUMENTS.use-case.spec.ts

test/e2e/
└── $ARGUMENTS.e2e-spec.ts
```

### 6. Wire Up

- Add use case to appropriate module provider
- Add controller to `RestApiModule`
- Update all barrel exports (index.ts files)

## Checklist

After creating the feature, verify:

- [ ] Architecture check passes: `npm run deps:check`
- [ ] Feature tests pass: `npm run test:features`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Lint passes: `npm run lint`

## Example Structure

For feature `get-city-weather`:

```
src/
├── domain/
│   ├── value-objects/
│   │   └── weather-condition.ts (if new)
│   └── services/
│       └── weather-service.ts (interface, if new)
├── application/
│   └── use-cases/
│       └── get-city-weather/
│           ├── get-city-weather.input.ts
│           ├── get-city-weather.output.ts
│           ├── get-city-weather.use-case.ts
│           └── index.ts
├── infrastructure/
│   └── openweathermap/
│       └── openweathermap-weather-service.ts (impl, if new)
└── presentation/
    └── rest-api/
        ├── controllers/
        │   └── get-city-weather.controller.ts
        └── responses/
            └── get-city-weather.response.ts

test/
├── features/
│   └── application/
│       └── use-cases/
│           └── get-city-weather/
│               └── get-city-weather.use-case.spec.ts
└── e2e/
    └── get-city-weather.e2e-spec.ts
```