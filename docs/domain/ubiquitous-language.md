# Ubiquitous Language - Route Solver

> **Purpose**: This glossary is the source of truth for the project's business vocabulary. All terms used in code, documentation, and discussions must be consistent with this reference.

## Core Business Concepts

### City

| Aspect | Value |
|--------|-------|
| **Definition** | Geographic location in the French road network |
| **Identity** | Identified by a unique `CityId` (normalized form of the name) |
| **Examples** | Paris, Lyon, Aix-en-Provence, Saint-Denis |
| **Code** | `City` (Entity), `CityId` (VO), `CityName` (VO) |

**Business rules:**
- The name follows French naming conventions (initial capital, accents, hyphens, apostrophes)
- Two cities are equal if they have the same `CityId`

---

### RoadSegment

| Aspect | Value |
|--------|-------|
| **Definition** | Bidirectional road connection between two distinct cities |
| **Identity** | Identified by a composite `RoadSegmentId` (e.g., `lyon__paris`) |
| **Properties** | Distance (km), Speed limit (km/h) |
| **Code** | `RoadSegment` (Entity), `RoadSegmentId` (VO) |

**Business rules:**
- A segment cannot connect a city to itself
- Cities are always sorted alphabetically to ensure uniqueness
- Estimated duration = distance / speed

---

### Itinerary

| Aspect | Value |
|--------|-------|
| **Definition** | Ordered path of road segments connecting a departure city to a destination city |
| **Result of** | Pathfinding calculation (Dijkstra algorithm) |
| **Composition** | List of steps (`ItineraryStep`) |
| **REST** | `GET /itineraries` |
| **Code** | `PathfindingResult`, `RouteStep` |

> **Note**: We use "Itinerary" (not "Route") to avoid confusion with "Road" (which translates to "route" in French).

**Business rules:**
- Departure and destination cities must be different
- An itinerary may not exist if no path is available

---

### ItineraryStep

| Aspect | Value |
|--------|-------|
| **Definition** | Portion of an itinerary corresponding to a traversed road segment |
| **Properties** | Departure city, Destination city, Distance, Speed, Duration, Weather |
| **Code** | `RouteStep` (Interface) |

---

### PathFinder

| Aspect | Value |
|--------|-------|
| **Definition** | Abstract service responsible for calculating the fastest itinerary |
| **Algorithm** | Dijkstra (infrastructure implementation) |
| **Code** | `PathFinder` (Abstract Service) |

---

## Value Objects

### Distance

| Aspect | Value |
|--------|-------|
| **Definition** | Length measurement of a road segment |
| **Unit** | Kilometers (km) |
| **Constraints** | >= 0, finite |
| **Code** | `Distance` |

---

### Speed

| Aspect | Value |
|--------|-------|
| **Definition** | Authorized speed limit on a road segment |
| **Unit** | Kilometers per hour (km/h) |
| **Constraints** | >= 0, finite |
| **Code** | `Speed` |

---

### Duration

| Aspect | Value |
|--------|-------|
| **Definition** | Estimated travel time |
| **Unit** | Hours (with minutes/seconds conversion) |
| **Calculation** | distance / speed |
| **Constraints** | >= 0, finite, speed != 0 for calculation |
| **Code** | `Duration` |

---

### WeatherCondition

| Aspect | Value |
|--------|-------|
| **Definition** | Meteorological state affecting road conditions |
| **Values** | `sunny`, `cloudy`, `rain`, `snow`, `thunderstorm`, `fog` |
| **Code** | `WeatherCondition` |

---

### RoadConstraints

| Aspect | Value |
|--------|-------|
| **Definition** | Optional filtering criteria for itinerary search |
| **Properties** | Weather conditions to exclude, Max distance, Min speed |
| **Code** | `RoadConstraints` |

---

## REST API

### Overview

| Resource | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| Itinerary | GET | `/itineraries` | Calculate an itinerary |
| RoadSegment | POST | `/road-segments` | Create a road segment |
| RoadSegment | PATCH | `/road-segments/:id` | Update segment speed limit |

### GET /itineraries

Calculates the fastest itinerary between two cities.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from` | string | Yes | Departure city |
| `to` | string | Yes | Destination city |
| `maxDistance` | number | No | Max distance per segment (km) |
| `minSpeed` | number | No | Min required speed (km/h) |
| `excludeWeather` | string | No | Weather conditions to exclude (comma-separated) |

**Example:**
```
GET /itineraries?from=Paris&to=Lyon
GET /itineraries?from=Paris&to=Lyon&maxDistance=500&excludeWeather=rain,snow
```

**Responses:**
- `200 OK` - Itinerary calculated successfully
- `400 Bad Request` - Invalid parameters or identical cities
- `404 Not Found` - City not found

---

### POST /road-segments

Creates a new road segment between two cities.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cityA` | string | Yes | First city |
| `cityB` | string | Yes | Second city |
| `distance` | number | Yes | Distance in km |
| `speedLimit` | number | Yes | Speed limit in km/h |

**Example:**
```json
{
  "cityA": "Paris",
  "cityB": "Lyon",
  "distance": 465,
  "speedLimit": 130
}
```

**Responses:**
- `201 Created` - Segment created successfully
- `400 Bad Request` - Invalid data
- `404 Not Found` - City not found

---

### PATCH /road-segments/:id

Updates the speed limit of a road segment.

**Path Parameters:**

| Parameter | Description |
|-----------|-------------|
| `id` | Segment ID (format: `cityA__cityB`, e.g., `lyon__paris`) |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `newSpeedLimit` | number | Yes | New speed limit in km/h |

**Example:**
```
PATCH /road-segments/lyon__paris
```
```json
{
  "newSpeedLimit": 110
}
```

**Responses:**
- `200 OK` - Speed updated
- `400 Bad Request` - Invalid speed or malformed ID
- `404 Not Found` - Segment not found

---

## Business Errors

| Code | Name | Description |
|------|------|-------------|
| `CITY_NOT_FOUND` | City Not Found | The requested city does not exist in the repository |
| `ROAD_SEGMENT_NOT_FOUND` | Road Segment Not Found | The road segment does not exist |
| `SAME_START_END_CITY` | Same Start And End City | Cannot calculate an itinerary to the same city |
| `NO_ROUTE_FOUND` | No Route Found | No path available between the two cities |
| `INVALID_CITY_NAME` | Invalid City Name | The name format does not follow conventions |
| `INVALID_DISTANCE` | Invalid Distance | Negative or non-finite value |
| `INVALID_SPEED` | Invalid Speed | Negative, zero, or non-finite value |

---

## Naming Conventions

### Code

| Type | Pattern | Example |
|------|---------|---------|
| Entity | `PascalCase` | `City`, `RoadSegment` |
| Value Object | `PascalCase` | `CityId`, `Distance` |
| Error | `PascalCase` + `Error` | `CityNotFoundError` |
| Repository | `Abstract` + `PascalCase` + `Repository` | `RoadSegmentRepository` |
| Use Case | `PascalCase` + `UseCase` | `GetFastestRouteUseCase` |
| Controller | `PascalCase` + `Controller` | `CalculateItineraryController` |
| Query DTO | `PascalCase` + `Query` | `SearchItineraryQuery` |
| Request DTO | `PascalCase` + `Request` | `CreateRoadSegmentRequest` |

### Files

| Type | Pattern | Example |
|------|---------|---------|
| Entity | `kebab-case.ts` | `road-segment.ts` |
| Value Object | `kebab-case.ts` | `city-id.ts` |
| Error | `kebab-case.error.ts` | `city-not-found.error.ts` |
| Controller | `kebab-case.controller.ts` | `calculate.controller.ts` |
| Query DTO | `kebab-case.query.ts` | `search-itinerary.query.ts` |

### Controller Structure

```
controllers/
├── itineraries/
│   ├── index.ts
│   └── calculate.controller.ts
└── road-segments/
    ├── index.ts
    ├── create.controller.ts
    └── update-speed.controller.ts
```

---

## Terminology Note

> **Important**: "Route" in French means "Road" in English (the physical road). To avoid confusion, we use "Itinerary" to designate the calculated path.

---

## Updates

| Date | Change | Author |
|------|--------|--------|
| 2026-02-02 | Initial glossary creation | Claude Code |
| 2026-02-02 | Added complete REST API documentation | Claude Code |
| 2026-02-02 | Changed POST to GET for /itineraries | Claude Code |
| 2026-02-02 | Translated documentation to English | Claude Code |
