import { DijkstraPathFinder } from '@/infrastructure/pathfinding/dijkstra-path-finder';
import { WeatherConditionProvider } from '@/infrastructure/pathfinding/weather-condition-provider';
import {
  WeatherCondition,
  RoadConstraints,
  Distance,
  Speed,
} from '@/domain/value-objects';
import { City, RoadSegment } from '@/domain/entities';
import { PathfindingResult } from '@/domain/services';
import { CityBuilder, RoadSegmentBuilder } from '@test/fixtures';

class FakeWeatherConditionProvider implements WeatherConditionProvider {
  private weatherByCity: Map<string, WeatherCondition> = new Map();

  setWeather(cityName: string, condition: WeatherCondition): void {
    this.weatherByCity.set(cityName, condition);
  }

  async forCity(city: City): Promise<WeatherCondition> {
    return this.weatherByCity.get(city.name.value) || 'sunny';
  }
}

// Helper function to extract path from steps
function extractPath(result: PathfindingResult): City[] {
  if (result.steps.length === 0) return [];
  const path: City[] = [result.steps[0].from];
  for (const step of result.steps) {
    path.push(step.to);
  }
  return path;
}

describe('DijkstraPathFinder (Integration)', () => {
  let pathFinder: DijkstraPathFinder;
  let weatherProvider: FakeWeatherConditionProvider;

  // Test cities
  let paris: City;
  let lyon: City;
  let marseille: City;
  let nice: City;
  let toulouse: City;
  let bordeaux: City;
  let dijon: City;

  beforeEach(() => {
    weatherProvider = new FakeWeatherConditionProvider();
    pathFinder = new DijkstraPathFinder(weatherProvider);

    // Initialize cities
    paris = CityBuilder.aCity().withIdFromName('Paris').build();
    lyon = CityBuilder.aCity().withIdFromName('Lyon').build();
    marseille = CityBuilder.aCity().withIdFromName('Marseille').build();
    nice = CityBuilder.aCity().withIdFromName('Nice').build();
    toulouse = CityBuilder.aCity().withIdFromName('Toulouse').build();
    bordeaux = CityBuilder.aCity().withIdFromName('Bordeaux').build();
    dijon = CityBuilder.aCity().withIdFromName('Dijon').build();
  });

  describe('findFastestRoute', () => {
    it('should find the fastest direct route between two cities', async () => {
      // Arrange
      const segments = [
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, lyon)
          .withDistance(465)
          .withSpeedLimit(130)
          .build(),
      ];

      // Act
      const result = await pathFinder.findFastestRoute(segments, paris, lyon);

      // Assert
      expect(result).not.toBeNull();
      const path = extractPath(result!);
      expect(path).toHaveLength(2);
      expect(path[0].name.value).toBe('Paris');
      expect(path[1].name.value).toBe('Lyon');
    });

    it('should find the optimal route through intermediate cities', async () => {
      // Arrange
      const segments = [
        // Direct route Paris -> Lyon (slow)
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, lyon)
          .withDistance(500)
          .withSpeedLimit(90)
          .build(),
        // Fast route via Dijon
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, dijon)
          .withDistance(310)
          .withSpeedLimit(130)
          .build(),
        RoadSegmentBuilder.aRoadSegment()
          .between(dijon, lyon)
          .withDistance(190)
          .withSpeedLimit(130)
          .build(),
      ];

      // Act
      const result = await pathFinder.findFastestRoute(segments, paris, lyon);

      // Assert
      expect(result).not.toBeNull();
      const path = extractPath(result!);
      expect(path).toHaveLength(3);
      expect(path[0].name.value).toBe('Paris');
      expect(path[1].name.value).toBe('Dijon');
      expect(path[2].name.value).toBe('Lyon');
    });

    it('should return null when no route exists', async () => {
      // Arrange
      const segments = [
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, lyon)
          .withDistance(465)
          .withSpeedLimit(130)
          .build(),
        // Marseille is isolated
        RoadSegmentBuilder.aRoadSegment()
          .between(toulouse, bordeaux)
          .withDistance(250)
          .withSpeedLimit(130)
          .build(),
      ];

      // Act
      const result = await pathFinder.findFastestRoute(
        segments,
        paris,
        marseille,
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should respect max distance constraint', async () => {
      // Arrange
      const segments = [
        // Direct route Paris -> Lyon (long distance)
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, lyon)
          .withDistance(600)
          .withSpeedLimit(130)
          .build(),
        // Short segments via Dijon
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, dijon)
          .withDistance(310)
          .withSpeedLimit(130)
          .build(),
        RoadSegmentBuilder.aRoadSegment()
          .between(dijon, lyon)
          .withDistance(190)
          .withSpeedLimit(130)
          .build(),
      ];

      const constraints = new RoadConstraints(
        undefined,
        Distance.fromKilometers(500),
        undefined,
      );

      // Act
      const result = await pathFinder.findFastestRoute(
        segments,
        paris,
        lyon,
        constraints,
      );

      // Assert
      expect(result).not.toBeNull();
      const path = extractPath(result!);
      // Should use the route via Dijon because direct route exceeds maxDistance
      expect(path).toHaveLength(3);
      expect(path.map((c) => c.name.value)).toEqual(['Paris', 'Dijon', 'Lyon']);
    });

    it('should respect min speed limit constraint', async () => {
      // Arrange
      const segments = [
        // Slow route direct
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, lyon)
          .withDistance(400)
          .withSpeedLimit(90)
          .build(),
        // Fast route via Dijon
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, dijon)
          .withDistance(310)
          .withSpeedLimit(130)
          .build(),
        RoadSegmentBuilder.aRoadSegment()
          .between(dijon, lyon)
          .withDistance(190)
          .withSpeedLimit(130)
          .build(),
      ];

      const constraints = new RoadConstraints(
        undefined,
        undefined,
        Speed.fromKmPerHour(100),
      );

      // Act
      const result = await pathFinder.findFastestRoute(
        segments,
        paris,
        lyon,
        constraints,
      );

      // Assert
      expect(result).not.toBeNull();
      const path = extractPath(result!);
      // Should use the route via Dijon because direct route is too slow
      expect(path).toHaveLength(3);
    });

    it('should avoid cities with excluded weather conditions', async () => {
      // Arrange
      weatherProvider.setWeather('Lyon', 'thunderstorm');
      weatherProvider.setWeather('Marseille', 'sunny');
      weatherProvider.setWeather('Dijon', 'sunny');

      const segments = [
        // Direct to Lyon (has storm)
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, lyon)
          .withDistance(400)
          .withSpeedLimit(130)
          .build(),
        // Alternative via Dijon to Marseille
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, dijon)
          .withDistance(310)
          .withSpeedLimit(130)
          .build(),
        RoadSegmentBuilder.aRoadSegment()
          .between(dijon, marseille)
          .withDistance(450)
          .withSpeedLimit(130)
          .build(),
        RoadSegmentBuilder.aRoadSegment()
          .between(lyon, marseille)
          .withDistance(300)
          .withSpeedLimit(130)
          .build(),
      ];

      const constraints = new RoadConstraints(
        ['thunderstorm'],
        undefined,
        undefined,
      );

      // Act
      const result = await pathFinder.findFastestRoute(
        segments,
        paris,
        marseille,
        constraints,
      );

      // Assert
      expect(result).not.toBeNull();
      const path = extractPath(result!);
      // Should not pass through Lyon due to storm
      const cityNames = path.map((c) => c.name.value);
      expect(cityNames).not.toContain('Lyon');
    });

    it('should calculate total distance correctly', async () => {
      // Arrange
      const segments = [
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, lyon)
          .withDistance(465)
          .withSpeedLimit(130)
          .build(),
        RoadSegmentBuilder.aRoadSegment()
          .between(lyon, marseille)
          .withDistance(315)
          .withSpeedLimit(130)
          .build(),
      ];

      // Act
      const result = await pathFinder.findFastestRoute(
        segments,
        paris,
        marseille,
      );

      // Assert
      expect(result).not.toBeNull();
      expect(result!.totalDistance.kilometers).toBe(780); // 465 + 315
    });

    it('should calculate estimated time correctly', async () => {
      // Arrange
      const segments = [
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, lyon)
          .withDistance(130) // 1 hour at 130 km/h
          .withSpeedLimit(130)
          .build(),
      ];

      // Act
      const result = await pathFinder.findFastestRoute(segments, paris, lyon);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.estimatedTime.hours).toBeCloseTo(1, 1);
    });

    it('should include route steps with weather information', async () => {
      // Arrange
      weatherProvider.setWeather('Paris', 'cloudy');
      weatherProvider.setWeather('Lyon', 'rain');
      weatherProvider.setWeather('Marseille', 'sunny');

      const segments = [
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, lyon)
          .withDistance(465)
          .withSpeedLimit(130)
          .build(),
        RoadSegmentBuilder.aRoadSegment()
          .between(lyon, marseille)
          .withDistance(315)
          .withSpeedLimit(130)
          .build(),
      ];

      // Act
      const result = await pathFinder.findFastestRoute(
        segments,
        paris,
        marseille,
      );

      // Assert
      expect(result).not.toBeNull();
      expect(result!.steps).toHaveLength(2);
      expect(result!.steps[0].weatherCondition).toBe('rain'); // Arriving at Lyon
      expect(result!.steps[1].weatherCondition).toBe('sunny'); // Arriving at Marseille
    });

    it('should handle complex graph with multiple possible routes', async () => {
      // Arrange
      const segments = [
        // Route 1: Paris -> Lyon -> Marseille -> Nice
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, lyon)
          .withDistance(465)
          .withSpeedLimit(130)
          .build(),
        RoadSegmentBuilder.aRoadSegment()
          .between(lyon, marseille)
          .withDistance(315)
          .withSpeedLimit(130)
          .build(),
        RoadSegmentBuilder.aRoadSegment()
          .between(marseille, nice)
          .withDistance(200)
          .withSpeedLimit(130)
          .build(),
        // Route 2: Paris -> Dijon -> Lyon -> Marseille -> Nice
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, dijon)
          .withDistance(310)
          .withSpeedLimit(130)
          .build(),
        RoadSegmentBuilder.aRoadSegment()
          .between(dijon, lyon)
          .withDistance(190)
          .withSpeedLimit(130)
          .build(),
        // Route 3: Paris -> Toulouse -> Marseille -> Nice
        RoadSegmentBuilder.aRoadSegment()
          .between(paris, toulouse)
          .withDistance(680)
          .withSpeedLimit(130)
          .build(),
        RoadSegmentBuilder.aRoadSegment()
          .between(toulouse, marseille)
          .withDistance(400)
          .withSpeedLimit(130)
          .build(),
      ];

      // Act
      const result = await pathFinder.findFastestRoute(segments, paris, nice);

      // Assert
      expect(result).not.toBeNull();
      const path = extractPath(result!);
      // The algorithm should find the fastest route
      expect(path.length).toBeGreaterThanOrEqual(4);
      expect(path[0].name.value).toBe('Paris');
      expect(path[path.length - 1].name.value).toBe('Nice');
    });

    it('should throw error when weather provider is not provided', () => {
      // Act & Assert
      expect(() => {
        new DijkstraPathFinder(null as any);
      }).toThrow('WeatherConditionProvider must be provided');
    });
  });
});
