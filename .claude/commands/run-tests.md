# Run Tests

Run tests for the project with various options.

## Arguments

$ARGUMENTS - Test type or specific test file (optional)

Options:
- (empty) - Run all feature tests
- `cov` - Run with coverage
- `e2e` - Run E2E tests
- `integration` - Run integration tests
- `watch` - Run in watch mode
- `<file-pattern>` - Run specific test files

## Instructions

Based on the arguments, run the appropriate test command:

### Feature Tests (Default)

```bash
# All feature tests
npm run test:features

# With coverage
npm run test:features:cov

# Watch mode
npm run test:features:watch

# Specific file
npm run test:features -- --testPathPattern="$ARGUMENTS"
```

### E2E Tests

```bash
# Start E2E database first
npm run docker:e2e:up

# Run E2E tests
npm run test:e2e

# With coverage
npm run test:e2e:cov

# Stop database after
npm run docker:e2e:down
```

### Integration Tests

```bash
# Start integration database first
npm run docker:integration:up

# Run integration tests
npm run test:integration

# With coverage
npm run test:integration:cov

# Stop database after
npm run docker:integration:down
```

### All Tests

```bash
npm run test:all
```

## Coverage Thresholds

Feature tests enforce these thresholds:
- Branches: 97%
- Functions: 97%
- Lines: 97%
- Statements: 97%

## Test Structure

- `test/features/` - Use Case tests (test domain through use cases)
- `test/integration/` - Infrastructure tests (database, external APIs)
- `test/e2e/` - HTTP endpoint tests
- `test/fixtures/` - Fakes and Builders

## Using Task Runner

Alternatively, use the Task runner:

```bash
task test              # Feature tests
task test:cov          # With coverage
task test:e2e          # E2E tests (manages DB automatically)
task test:watch        # Watch mode
task test:all          # All tests
```