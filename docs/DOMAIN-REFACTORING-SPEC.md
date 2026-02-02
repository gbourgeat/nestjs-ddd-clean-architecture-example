# Domain Refactoring Specification

## Overview

This specification outlines a comprehensive refactoring of the Route Solver domain layer to improve cohesion, error handling, and entity modeling. The changes focus on introducing the Result Pattern, restructuring the aggregate boundaries, and revising the identity strategy for road segments and cities.

---

## 1. Result Pattern Implementation

### 1.1 Motivation

The current codebase uses thrown exceptions for both domain errors and unexpected failures. This approach:
- Makes error handling implicit and scattered
- Couples use cases to specific error types via try-catch
- Makes it difficult to distinguish between expected domain failures and unexpected errors

### 1.2 Proposed Solution

Introduce a `Result<T, E>` type that explicitly represents the outcome of operations that can fail.

### 1.3 Result Type Definition

Create a new `Result` type in `src/domain/common/result.ts`:

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

### 1.4 Factory Functions

Provide factory functions for creating Result instances:

```typescript
function ok<T>(value: T): Success<T>;
function fail<E>(error: E): Failure<E>;
```

### 1.5 Application Scope

The Result Pattern shall be applied to:

- **Use Cases**: All use case `execute` methods shall return `Promise<Result<Output, DomainError>>` instead of throwing exceptions
- **Domain Services**: The `PathFinder.findFastestRoute` method shall return `Result<PathfindingResult, PathfindingError>`
- **Value Object Factory Methods**: Methods like `CityName.create`, `Distance.fromKilometers`, etc., shall return `Result<ValueObject, ValidationError>`
- **Entity Factory Methods**: Methods like `RoadSegment.create` shall return `Result<Entity, DomainError>`

### 1.6 Error Type Hierarchy

Define a base domain error type and specific error categories:

```typescript
abstract class DomainError {
  abstract readonly code: string;
  abstract readonly message: string;
}
```

Existing errors (`CityNotFoundError`, `InvalidCityNameError`, etc.) shall extend `DomainError`.

### 1.7 Controller Adaptation

Controllers shall handle Result types by pattern matching on the `success` property and mapping failures to appropriate HTTP responses.

---

## 2. Aggregate Restructuring

### 2.1 Current State Analysis

Currently:
- `RoadSegment` and `City` are both treated as independent entities
- `City` has its own repository (`CityRepository`)
- `RoadSegment` contains references to two `City` instances

### 2.2 Proposed Aggregate Design

**RoadSegment as Aggregate Root**

`RoadSegment` shall become the Aggregate Root with the following characteristics:
- Owns and manages its constituent `City` entities
- Is the only entry point for persistence operations involving road segments and their cities
- Ensures consistency of the cities within its boundary

**City as Entity within the Aggregate**

`City` shall become an entity owned by `RoadSegment`:
- Cities are created and persisted as part of RoadSegment creation
- A city's lifecycle is tied to the RoadSegment aggregate
- Cities can be shared across multiple RoadSegments (same logical city)

### 2.3 Repository Changes

**Remove CityRepository from Domain**

The `CityRepository` interface shall be removed from the domain layer. Cities shall only be accessed through the `RoadSegmentRepository`.

**Extend RoadSegmentRepository**

Add methods to support city-related queries through the aggregate:

```typescript
abstract class RoadSegmentRepository {
  abstract findAll(): Promise<RoadSegment[]>;
  abstract findById(id: RoadSegmentId): Promise<Result<RoadSegment, RoadSegmentNotFoundError>>;
  abstract save(roadSegment: RoadSegment): Promise<Result<void, PersistenceError>>;
  abstract findCityByName(name: CityName): Promise<Result<City, CityNotFoundError>>;
  abstract findAllCities(): Promise<City[]>;
}
```

---

## 3. RoadSegment Identity Revision

### 3.1 Current State

`RoadSegmentId` is currently a normalized string derived from city names (e.g., `"lyon__paris"`). While this provides some implicit uniqueness, it is not explicitly tied to the City entities themselves.

### 3.2 Proposed Identity Model

**Composite Identity Based on City Pair**

`RoadSegmentId` shall be restructured as a composite value object containing two `CityId` values:

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

### 3.3 Equality and Ordering

- The identity shall be order-independent: `RoadSegmentId(Paris, Lyon)` equals `RoadSegmentId(Lyon, Paris)`
- Internally, city IDs shall be sorted alphabetically to ensure consistent storage and comparison

### 3.4 Impact on Persistence

The infrastructure layer shall:
- Store the composite key as two foreign key references to the cities table
- Use a composite primary key or unique constraint on `(city_a_id, city_b_id)` where city_a_id < city_b_id alphabetically

---

## 4. City Identity and Uniqueness

### 4.1 Current State

`CityId` is derived from the city name through normalization. This creates an implicit coupling between the name and identity.

### 4.2 Proposed Changes

**Explicit Uniqueness Attribute**

`City` shall have an explicit attribute guaranteeing uniqueness. The `CityName` normalized value shall serve as the natural key:

```typescript
class City {
  private constructor(
    public readonly id: CityId,
    public readonly name: CityName,
  ) {}

  get uniqueKey(): string; // Returns the normalized name
}
```

### 4.3 CityId Derivation

`CityId` shall be derived deterministically from `CityName`:

```typescript
class CityId {
  static fromName(name: CityName): CityId;
}
```

This ensures:
- Two cities with the same name (after normalization) have the same identity
- Identity is predictable and does not require database lookup

### 4.4 City Creation During RoadSegment Creation

When creating a `RoadSegment`:
1. The factory method accepts city names (strings)
2. `CityName` value objects are created and validated
3. `CityId` values are derived from the names
4. `City` entities are created or retrieved
5. The `RoadSegment` is created with the city pair

The repository's `save` method shall handle the upsert logic for cities:
- If a city with the same `uniqueKey` exists, use the existing record
- If not, create a new city record

---

## 5. RoadSegment Factory Method Revision

### 5.1 New Signature

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

The factory method shall:
1. Create and validate `CityName` value objects for both cities
2. Derive `CityId` values from the names
3. Create `City` entities
4. Create the `RoadSegmentId` from the city pair
5. Validate that the two cities are distinct
6. Create and validate `Distance` and `Speed` value objects
7. Return the `RoadSegment` wrapped in a Result

### 5.3 Error Aggregation

If multiple validation errors occur, they shall be aggregated into a composite error:

```typescript
class RoadSegmentCreationError extends DomainError {
  readonly validationErrors: ValidationError[];
}
```

---

## 6. Use Case Adaptations

### 6.1 CreateRoadSegmentUseCase

**Current Flow**:
1. Validate city names
2. Fetch cities from CityRepository
3. Create RoadSegment
4. Save via RoadSegmentRepository

**New Flow**:
1. Call `RoadSegment.create(cityAName, cityBName, distance, speedLimit)`
2. Handle Result: if failure, return the error
3. Save via `RoadSegmentRepository.save(roadSegment)`
4. Handle Result: if failure, return persistence error
5. Return success with output

### 6.2 GetFastestRouteUseCase

**Current Flow**:
1. Validate city names
2. Check cities are distinct
3. Fetch cities from CityRepository
4. Fetch road segments
5. Call PathFinder
6. Return result

**New Flow**:
1. Create `CityName` value objects (using Result)
2. Validate cities are distinct
3. Fetch city entities via `RoadSegmentRepository.findCityByName`
4. Handle Results: if either city not found, return error
5. Fetch road segments via `RoadSegmentRepository.findAll`
6. Call `PathFinder.findFastestRoute` (returns Result)
7. Handle Result: map to output or error

### 6.3 UpdateRoadSegmentSpeedUseCase

**Current Flow**:
1. Create RoadSegmentId from city names
2. Fetch RoadSegment by ID (throws if not found)
3. Update speed limit
4. Save

**New Flow**:
1. Create `CityName` value objects (using Result)
2. Derive `CityId` values
3. Create `RoadSegmentId` from city IDs
4. Fetch RoadSegment by ID (returns Result)
5. Handle Result: if not found, return error
6. Create new `Speed` value object (returns Result)
7. Update speed limit on RoadSegment
8. Save via repository (returns Result)
9. Return success with output

---

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

---

## 8. File Structure Changes

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
    city.repository.ts          # TO BE REMOVED
  services/
    path-finder.ts           # Updated return type to Result

src/application/use-cases/
  create-road-segment/
    create-road-segment.use-case.ts  # Updated to use Result pattern
  get-fastest-route/
    get-fastest-route.use-case.ts    # Updated to use Result pattern
  update-road-segment-speed/
    update-road-segment-speed.use-case.ts  # Updated to use Result pattern
```

### 8.3 Removed Files

```
src/domain/repositories/city.repository.ts
src/infrastructure/database/repositories/city.typeorm-repository.ts
```

---

## 9. Migration Strategy

### 9.1 Phase 1: Introduce Result Type

1. Create the Result type and factory functions
2. Create the base DomainError class
3. Update existing errors to extend DomainError

### 9.2 Phase 2: Update Value Objects

1. Update value object factory methods to return Result types
2. Update unit tests to handle Result types

### 9.3 Phase 3: Restructure Identities

1. Update CityId to derive from CityName
2. Update RoadSegmentId to use CityId pair
3. Add uniqueKey to City entity
4. Update RoadSegment factory method

### 9.4 Phase 4: Restructure Aggregates

1. Extend RoadSegmentRepository with city query methods
2. Update RoadSegmentTypeormRepository implementation
3. Remove CityRepository from domain
4. Update use cases to use new repository methods

### 9.5 Phase 5: Update Use Cases and Services

1. Update PathFinder to return Result
2. Update all use cases to use Result pattern
3. Update controllers to handle Result types

### 9.6 Phase 6: Infrastructure Cleanup

1. Remove CityTypeormRepository
2. Update database module
3. Run full test suite
4. Update integration tests

---

## 10. Testing Considerations

### 10.1 Unit Tests

- Test Result type utility functions
- Test value object creation with both success and failure cases
- Test entity factory methods with both success and failure cases
- Test aggregate invariants (distinct cities, valid identities)

### 10.2 Use Case Tests

- Test success paths returning `Result.success`
- Test failure paths returning `Result.failure` with correct error types
- Test error aggregation in complex operations

### 10.3 Integration Tests

- Test repository save operations with city upsert logic
- Test composite key lookups for RoadSegment
- Test city uniqueness constraints

---

## 11. Backward Compatibility Notes

### 11.1 Breaking Changes

- All use case return types change from `Promise<Output>` to `Promise<Result<Output, Error>>`
- CityRepository is removed; consumers must use RoadSegmentRepository
- RoadSegmentId internal structure changes (affects serialization)

### 11.2 Migration for Consumers

- Controllers must be updated to pattern match on Result
- Any direct CityRepository usage must be refactored
- Serialized RoadSegmentId values may need migration

---

## 12. Appendix: Error Catalog

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
