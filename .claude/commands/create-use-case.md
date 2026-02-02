# Create Use Case

Create a new use case following the project's Clean Architecture patterns.

## Arguments

$ARGUMENTS - Name of the use case in kebab-case (e.g., "get-city-weather")

## Instructions

Create a new use case with the following structure:

1. **Create the use case folder** at `src/application/use-cases/$ARGUMENTS/`

2. **Create the input file** (`$ARGUMENTS.input.ts`):
   - Simple interface or class with input properties
   - Use primitive types (string, number, boolean)

3. **Create the output file** (`$ARGUMENTS.output.ts`):
   - Simple interface or class with output properties
   - Use primitive types

4. **Create the use case file** (`$ARGUMENTS.use-case.ts`):
   - Class named in PascalCase (e.g., `GetCityWeatherUseCase`)
   - Constructor with dependencies (repositories, services) - all abstractions from domain
   - `execute(input: Input): Promise<Output>` method
   - Transform input to Value Objects
   - Call domain services/repositories
   - Map result to output using mappers

5. **Create the index.ts** barrel export

6. **Update parent index.ts** at `src/application/use-cases/index.ts`

## Template

```typescript
// $ARGUMENTS.input.ts
export interface ${PascalCase}Input {
  // input properties
}

// $ARGUMENTS.output.ts
export interface ${PascalCase}Output {
  // output properties
}

// $ARGUMENTS.use-case.ts
import { ${PascalCase}Input } from './$ARGUMENTS.input';
import { ${PascalCase}Output } from './$ARGUMENTS.output';

export class ${PascalCase}UseCase {
  constructor(
    // Inject domain abstractions only
  ) {}

  async execute(input: ${PascalCase}Input): Promise<${PascalCase}Output> {
    // 1. Transform input to Value Objects
    // 2. Execute business logic via domain services
    // 3. Map result to output
  }
}

// index.ts
export * from './$ARGUMENTS.input';
export * from './$ARGUMENTS.output';
export * from './$ARGUMENTS.use-case';
```

## Rules

- DO NOT import from infrastructure or presentation
- DO NOT use `@Injectable()` decorator (injected via NestJS module)
- Use Value Objects for all business concepts
- Use mappers for domain-to-output transformation