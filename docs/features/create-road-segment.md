# Feature: Create Road Segment

## Overview

This feature allows creating a new road segment between two existing cities via the REST API.

## Endpoint

**POST** `/road-segments`

## Request

```json
{
  "cityA": "Paris",
  "cityB": "Lyon",
  "distance": 465,
  "speedLimit": 130
}
```

### Parameters

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `cityA` | string | Not empty | Name of the first city |
| `cityB` | string | Not empty | Name of the second city |
| `distance` | number | >= 0 | Distance in kilometers |
| `speedLimit` | number | >= 0 | Speed limit in km/h |

## Response

### Success (201 Created)

```json
{
  "roadSegmentId": "lyon__paris",
  "cityA": "Lyon",
  "cityB": "Paris",
  "distance": 465,
  "speedLimit": 130
}
```

Note: Cities are automatically sorted alphabetically in the response.

### Errors

#### 404 - City Not Found

```json
{
  "statusCode": 404,
  "message": "City with name \"UnknownCity\" not found",
  "error": "City Not Found"
}
```

#### 400 - Invalid Road Segment (Same City)

```json
{
  "statusCode": 400,
  "message": "Cannot create a road segment connecting a city to itself",
  "error": "Invalid Road Segment"
}
```

#### 400 - Invalid Distance

```json
{
  "statusCode": 400,
  "message": "Distance must be positive",
  "error": "Invalid Distance"
}
```

#### 400 - Invalid Speed

```json
{
  "statusCode": 400,
  "message": "Speed must be positive",
  "error": "Invalid Speed"
}
```

## Architecture

This feature follows the hexagonal architecture of the project.

### Application Layer

- **Use Case**: `CreateRoadSegmentUseCase`
  - Orchestrates road segment creation
  - Verifies city existence
  - Validates data via domain Value Objects
  - Saves segment via repository

### Presentation Layer

- **Controller**: `CreateRoadSegmentController`
  - Handles HTTP route POST `/road-segments`
  - Transforms DTOs to use case inputs
  - Handles business errors and converts them to HTTP responses
- **Request DTO**: `CreateRoadSegmentRequest`
  - Validation with `class-validator`
- **Response DTO**: `CreateRoadSegmentResponse`
  - Swagger documentation with `@ApiProperty`

### Domain Layer

Reuses existing entities and value objects:

- `RoadSegment` (entity)
- `City` (entity)
- `Distance` (value object)
- `Speed` (value object)
- `RoadSegmentId` (value object)
- `CityName` (value object)

## Tests

### Unit Tests (12 tests)

File: `test/features/application/use-cases/create-road-segment/create-road-segment.use-case.spec.ts`

- Successful segment creation
- Alphabetical sorting of cities
- Minimum values accepted
- Error handling (non-existent city, empty name, negative distance/speed, same city)

### E2E Tests (15 tests)

File: `test/e2e/create-road-segment.e2e-spec.ts`

- Valid requests
- HTTP error validation
- Missing field handling
- Business constraint validation

## Business Rules

1. **Both cities must exist** in the database
2. **Cities must be different** (no loops)
3. **Distance must be >= 0** (0 km accepted)
4. **Speed must be >= 0** (0 km/h accepted to represent a stop)
5. **Cities are sorted alphabetically** in the segment ID and response
6. **Segments are bidirectional** (Paris-Lyon = Lyon-Paris)

## Usage

### With cURL

```bash
curl -X POST http://localhost:3000/road-segments \
  -H "Content-Type: application/json" \
  -d '{
    "cityA": "Paris",
    "cityB": "Lyon",
    "distance": 465,
    "speedLimit": 130
  }'
```

### With Swagger UI

1. Access http://localhost:3000/api
2. Find the "Road Segments" section
3. Click on POST `/road-segments`
4. Click "Try it out"
5. Fill in the body and execute

## Dependencies

This feature depends on:

- `CityRepository` (to verify city existence)
- `RoadSegmentRepository` (to save the segment)
- Domain Value Objects for validation
