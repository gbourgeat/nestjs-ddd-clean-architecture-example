# Domain Patterns and Refactoring Specification

## Overview

This specification outlines the domain layer patterns used in Route Solver, including the Result Pattern, aggregate design, and entity modeling strategies.

## 1. Result Pattern

### 1.1 Motivation

The Result Pattern provides explicit error handling instead of thrown exceptions. This approach:

- Makes error handling explicit and centralized
- Decouples use cases from specific error types via try-catch
- Distinguishes between expected domain failures and unexpected errors

### 1.2 Result Type Definition

Located in `src/domain/common/result.ts`:

```typescript
type Result<T, E> = Success<T> | Failure<E>;

interface Success<T> {
  readonly success: true;
  readonly value: T;
}

interface Failure<E> {
  readonly success: false;
  readonly error: E;
}
```

### 1.3 Factory Functions

```typescript
function ok<T>(value: T): Success<T>;
function fail<E>(error: E): Failure<E>;
```

### 1.4 Application Scope

The Result Pattern applies to:

- **Use Cases**: All `execute` methods return `Promise<Result<Output, DomainError>>`
- **Domain Services**: `PathFinder.findFastestRoute` returns `Result<PathfindingResult, PathfindingError>`
- **Value Object Factory Methods**: Methods like `CityName.create`, `Distance.fromKilometers` return `Result<ValueObject, ValidationError>`
- **Entity Factory Methods**: Methods like `RoadSegment.create` return `Result<Entity, DomainError>`

### 1.5 Error Type Hierarchy

Base domain error type:

```typescript
abstract class DomainError {
  abstract readonly code: string;
  abstract readonly message: string;
}
```

Existing errors (`CityNotFoundError`, `InvalidCityNameError`, etc.) extend `DomainError`.

### 1.6 Controller Adaptation

Controllers handle Result types by pattern matching on the `success` property and mapping failures to appropriate HTTP responses.

## 2. Aggregate Design

### 2.1 Current State

- `RoadSegment` and `City` are both treated as independent entities
- `City` has its own repository (`CityRepository`)
- `RoadSegment` contains references to two `City` instances

### 2.2 Aggregate Design

**RoadSegment as Aggregate Root**

`RoadSegment` serves as the Aggregate Root with these characteristics:

- Owns and manages its constituent `City` entities
- Is the only entry point for persistence operations involving road segments and their cities
- Ensures consistency of the cities within its boundary

**City as Entity within the Aggregate**

`City` is an entity owned by `RoadSegment`:

- Cities are created and persisted as part of RoadSegment creation
- A city's lifecycle is tied to the RoadSegment aggregate
- Cities can be shared across multiple RoadSegments (same logical city)

### 2.3 Repository Structure

**RoadSegmentRepository Interface**

```typescript
abstract class RoadSegmentRepository {
  abstract findAll(): Promise<RoadSegment[]>;
  abstract findById(id: RoadSegmentId): Promise<Result<RoadSegment, RoadSegmentNotFoundError>>;
  abstract save(roadSegment: RoadSegment): Promise<Result<void, PersistenceError>>;
  abstract findCityByName(name: CityName): Promise<Result<City, CityNotFoundError>>;
  abstract findAllCities(): Promise<City[]>;
}
```

## 3. RoadSegment Identity

### 3.1 Composite Identity Based on City Pair

`RoadSegmentId` is a composite value object containing two `CityId` values:

```typescript
class RoadSegmentId {
  private constructor(
    private readonly _cityIdA: CityId,
    private readonly _cityIdB: CityId,
  ) {}

  static create(cityA: CityId, cityB: CityId): Result<RoadSegmentId, InvalidRoadSegmentIdError>;

  get cityIdA(): CityId;
  get cityIdB(): CityId;

  equals(other: RoadSegmentId): boolean;
  toString(): string;
}
```

### 3.2 Equality and Ordering

- Identity is order-independent: `RoadSegmentId(Paris, Lyon)` equals `RoadSegmentId(Lyon, Paris)`
- Internally, city IDs are sorted alphabetically for consistent storage and comparison

### 3.3 Persistence Impact

The infrastructure layer:

- Stores the composite key as two foreign key references to the cities table
- Uses a composite primary key or unique constraint on `(city_a_id, city_b_id)` where city_a_id < city_b_id alphabetically

## 4. City Identity and Uniqueness

### 4.1 Explicit Uniqueness Attribute

`City` has an explicit attribute guaranteeing uniqueness. The `CityName` normalized value serves as the natural key:

```typescript
class City {
  private constructor(
    public readonly id: CityId,
    public readonly name: CityName,
  ) {}

  get uniqueKey(): string; // Returns the normalized name
}
```

### 4.2 CityId Derivation

`CityId` is derived deterministically from `CityName`:

```typescript
class CityId {
  static fromName(name: CityName): CityId;
}
```

This ensures:

- Two cities with the same name (after normalization) have the same identity
- Identity is predictable and does not require database lookup

### 4.3 City Creation During RoadSegment Creation

When creating a `RoadSegment`:

1. The factory method accepts city names (strings)
2. `CityName` value objects are created and validated
3. `CityId` values are derived from the names
4. `City` entities are created or retrieved
5. The `RoadSegment` is created with the city pair

The repository's `save` method handles the upsert logic for cities:

- If a city with the same `uniqueKey` exists, use the existing record
- If not, create a new city record

## 5. RoadSegment Factory Method

### 5.1 Signature

```typescript
class RoadSegment {
  static create(
    cityAName: string,
    cityBName: string,
    distance: number,
    speedLimit: number,
  ): Result<RoadSegment, RoadSegmentCreationError>;
}
```

### 5.2 Creation Logic

The factory method:

1. Creates and validates `CityName` value objects for both cities
2. Derives `CityId` values from the names
3. Creates `City` entities
4. Creates the `RoadSegmentId` from the city pair
5. Validates that the two cities are distinct
6. Creates and validates `Distance` and `Speed` value objects
7. Returns the `RoadSegment` wrapped in a Result

### 5.3 Error Aggregation

If multiple validation errors occur, they are aggregated:

```typescript
class RoadSegmentCreationError extends DomainError {
  readonly validationErrors: ValidationError[];
}
```

## 6. Use Case Adaptations

### 6.1 CreateRoadSegmentUseCase

**Flow:**

1. Call `RoadSegment.create(cityAName, cityBName, distance, speedLimit)`
2. Handle Result: if failure, return the error
3. Save via `RoadSegmentRepository.save(roadSegment)`
4. Handle Result: if failure, return persistence error
5. Return success with output

### 6.2 GetFastestRouteUseCase

**Flow:**

1. Create `CityName` value objects (using Result)
2. Validate cities are distinct
3. Fetch city entities via `RoadSegmentRepository.findCityByName`
4. Handle Results: if either city not found, return error
5. Fetch road segments via `RoadSegmentRepository.findAll`
6. Call `PathFinder.findFastestRoute` (returns Result)
7. Handle Result: map to output or error

### 6.3 UpdateRoadSegmentSpeedUseCase

**Flow:**

1. Create `CityName` value objects (using Result)
2. Derive `CityId` values
3. Create `RoadSegmentId` from city IDs
4. Fetch RoadSegment by ID (returns Result)
5. Handle Result: if not found, return error
6. Create new `Speed` value object (returns Result)
7. Update speed limit on RoadSegment
8. Save via repository (returns Result)
9. Return success with output

## 7. Domain Service Adaptations

### 7.1 PathFinder Interface

```typescript
abstract class PathFinder {
  abstract findFastestRoute(
    segments: RoadSegment[],
    startCity: City,
    endCity: City,
    constraints?: RoadConstraints,
  ): Promise<Result<PathfindingResult, PathfindingError>>;
}
```

### 7.2 PathfindingError Types

```typescript
class NoRouteFoundError extends DomainError;
class InvalidGraphError extends DomainError;
```

## 8. File Structure

### 8.1 New Files

```
src/domain/
  common/
    result.ts
    index.ts
  errors/
    domain.error.ts          # Base DomainError class
    road-segment-creation.error.ts
    pathfinding.error.ts
    persistence.error.ts
```

### 8.2 Modified Files

```
src/domain/
  entities/
    road-segment.ts          # Updated factory method with Result
    city.ts                  # Added uniqueKey getter
  value-objects/
    city-id.ts               # Updated to use fromName(CityName)
    road-segment-id.ts       # Restructured as composite of CityId pair
  repositories/
    road-segment.repository.ts  # Extended with city query methods
  services/
    path-finder.ts           # Updated return type to Result
```

## 9. Testing Considerations

### 9.1 Unit Tests

- Test Result type utility functions
- Test value object creation with both success and failure cases
- Test entity factory methods with both success and failure cases
- Test aggregate invariants (distinct cities, valid identities)

### 9.2 Use Case Tests

- Test success paths returning `Result.success`
- Test failure paths returning `Result.failure` with correct error types
- Test error aggregation in complex operations

### 9.3 Integration Tests

- Test repository save operations with city upsert logic
- Test composite key lookups for RoadSegment
- Test city uniqueness constraints

## 10. Error Catalog

| Error Code | Error Class | Description |
|------------|-------------|-------------|
| `CITY_NOT_FOUND` | CityNotFoundError | City with given name does not exist |
| `INVALID_CITY_NAME` | InvalidCityNameError | City name is empty or invalid |
| `INVALID_CITY_ID` | InvalidCityIdError | City ID is malformed |
| `INVALID_DISTANCE` | InvalidDistanceError | Distance value is negative or invalid |
| `INVALID_SPEED` | InvalidSpeedError | Speed value is negative or invalid |
| `INVALID_ROAD_SEGMENT_ID` | InvalidRoadSegmentIdError | Road segment ID is malformed |
| `INVALID_ROAD_SEGMENT` | InvalidRoadSegmentError | Road segment violates invariants |
| `ROAD_SEGMENT_NOT_FOUND` | RoadSegmentNotFoundError | Road segment with given ID does not exist |
| `SAME_CITY_CONNECTION` | InvalidRoadSegmentError | Cannot create segment connecting city to itself |
| `SAME_START_END_CITY` | SameStartAndEndCityError | Route start and end cities are identical |
| `NO_ROUTE_FOUND` | NoRouteFoundError | No path exists between the given cities |
| `PERSISTENCE_ERROR` | PersistenceError | Database operation failed |
