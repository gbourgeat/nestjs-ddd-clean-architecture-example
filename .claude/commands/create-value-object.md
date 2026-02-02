# Create Value Object

Create a new Value Object following the project's DDD patterns.

## Arguments

$ARGUMENTS - Name of the value object in kebab-case (e.g., "postal-code")

## Instructions

Create a new Value Object with the following structure:

1. **Create the value object file** at `src/domain/value-objects/$ARGUMENTS.ts`

2. **Create the associated error file** at `src/domain/errors/invalid-$ARGUMENTS.error.ts`

3. **Update barrel exports**:
   - `src/domain/value-objects/index.ts`
   - `src/domain/errors/index.ts`

## Value Object Template

```typescript
// src/domain/value-objects/$ARGUMENTS.ts
import { Invalid${PascalCase}Error } from '@/domain/errors';

export class ${PascalCase} {
  private constructor(private readonly _value: string) {}

  static create(value: string): ${PascalCase} {
    if (!value?.trim()) {
      throw Invalid${PascalCase}Error.empty();
    }
    // Add more validation as needed
    return new ${PascalCase}(value.trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: ${PascalCase}): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
```

## Error Template

```typescript
// src/domain/errors/invalid-$ARGUMENTS.error.ts
export class Invalid${PascalCase}Error extends Error {
  private constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static empty(): Invalid${PascalCase}Error {
    return new Invalid${PascalCase}Error('${PascalCase} cannot be empty');
  }

  static invalid(value: string): Invalid${PascalCase}Error {
    return new Invalid${PascalCase}Error(`Invalid ${PascalCase}: "${value}"`);
  }
}
```

## Rules

- Private constructor (no direct instantiation)
- Factory method `static create()` with validation
- Immutable (no setters)
- `equals()` method for value comparison
- `toString()` for string representation
- Associated error class with factory methods
- DO NOT import from application, infrastructure, or presentation