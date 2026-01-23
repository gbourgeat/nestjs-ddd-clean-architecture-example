import { Route } from '../../domain/entities';
import { RouteConstraints, WeatherCondition } from '../../domain/value-objects';
import { DijkstraPathfindingService } from './dijkstra-pathfinding.service';

describe('DijkstraPathfindingService (Integration)', () => {
  let service: DijkstraPathfindingService;

  beforeEach(() => {
    service = new DijkstraPathfindingService();
  });

  describe('findFastestRoute', () => {
    it('should find the fastest route in a simple graph', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Lyon', 'Marseille', 315, 120),
      ];
      const weatherData = new Map<string, WeatherCondition>([
        ['Lyon', 'sunny'],
        ['Marseille', 'sunny'],
      ]);

      const result = service.findFastestRoute(
        routes,
        'Paris',
        'Marseille',
        weatherData,
      );

      expect(result).not.toBeNull();
      expect(result!.path).toEqual(['Paris', 'Lyon', 'Marseille']);
      expect(result!.totalDistance).toBe(780);
      expect(result!.steps).toHaveLength(2);
    });

    it('should return null when no path exists', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Marseille', 'Nice', 205, 110),
      ];
      const weatherData = new Map<string, WeatherCondition>();

      const result = service.findFastestRoute(
        routes,
        'Paris',
        'Nice',
        weatherData,
      );

      expect(result).toBeNull();
    });

    it('should apply weather constraints', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Paris', 'Dijon', 315, 110),
        new Route('Dijon', 'Lyon', 195, 110),
        new Route('Dijon', 'Marseille', 450, 110), // Alternative path
        new Route('Lyon', 'Marseille', 315, 120),
      ];
      const weatherData = new Map<string, WeatherCondition>([
        ['Lyon', 'rain'],
        ['Dijon', 'sunny'],
        ['Marseille', 'sunny'],
      ]);
      const constraints = new RouteConstraints(['rain']);

      const result = service.findFastestRoute(
        routes,
        'Paris',
        'Marseille',
        weatherData,
        constraints,
      );

      // Direct route via Lyon is blocked by rain, should take detour via Dijon
      expect(result).not.toBeNull();
      expect(result!.path).toEqual(['Paris', 'Dijon', 'Marseille']);
    });

    it('should apply max distance constraint', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120), // 465 km - blocked
        new Route('Paris', 'Dijon', 315, 110), // 315 km - OK
        new Route('Dijon', 'Lyon', 195, 110), // 195 km - OK
      ];
      const weatherData = new Map<string, WeatherCondition>();
      const constraints = new RouteConstraints(undefined, 400);

      const result = service.findFastestRoute(
        routes,
        'Paris',
        'Lyon',
        weatherData,
        constraints,
      );

      expect(result).not.toBeNull();
      expect(result!.path).toEqual(['Paris', 'Dijon', 'Lyon']);
      expect(result!.steps.every((step) => step.distance <= 400)).toBe(true);
    });

    it('should apply min speed constraint', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 110), // 110 km/h - blocked
        new Route('Paris', 'Dijon', 315, 120), // 120 km/h - OK
        new Route('Dijon', 'Lyon', 195, 120), // 120 km/h - OK
      ];
      const weatherData = new Map<string, WeatherCondition>();
      const constraints = new RouteConstraints(undefined, undefined, 115);

      const result = service.findFastestRoute(
        routes,
        'Paris',
        'Lyon',
        weatherData,
        constraints,
      );

      expect(result).not.toBeNull();
      expect(result!.path).toEqual(['Paris', 'Dijon', 'Lyon']);
      expect(result!.steps.every((step) => step.speed >= 115)).toBe(true);
    });

    it('should apply multiple constraints simultaneously', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120), // distance too long
        new Route('Paris', 'Dijon', 315, 110), // speed too slow
        new Route('Paris', 'Nantes', 385, 120), // OK
        new Route('Nantes', 'Bordeaux', 330, 120), // OK but weather excluded at destination
        new Route('Nantes', 'Lyon', 350, 120), // OK - direct path
      ];
      const weatherData = new Map<string, WeatherCondition>([
        ['Dijon', 'cloudy'],
        ['Nantes', 'sunny'],
        ['Bordeaux', 'rain'],
        ['Lyon', 'sunny'],
      ]);
      const constraints = new RouteConstraints(['rain'], 400, 115);

      const result = service.findFastestRoute(
        routes,
        'Paris',
        'Lyon',
        weatherData,
        constraints,
      );

      expect(result).not.toBeNull();
      expect(result!.path).toEqual(['Paris', 'Nantes', 'Lyon']);
      // Verify all constraints are respected
      expect(result!.steps.every((step) => step.distance <= 400)).toBe(true);
      expect(result!.steps.every((step) => step.speed >= 115)).toBe(true);
      expect(
        result!.steps.every((step) => !step.weather || step.weather !== 'rain'),
      ).toBe(true);
    });

    it('should choose fastest route considering travel time', () => {
      const routes = [
        new Route('Paris', 'Lyon', 600, 100), // 6 hours
        new Route('Paris', 'Dijon', 300, 150), // 2 hours
        new Route('Dijon', 'Lyon', 300, 150), // 2 hours
      ];
      const weatherData = new Map<string, WeatherCondition>();

      const result = service.findFastestRoute(
        routes,
        'Paris',
        'Lyon',
        weatherData,
      );

      expect(result).not.toBeNull();
      // Should choose Paris -> Dijon -> Lyon (4 hours) over direct (6 hours)
      expect(result!.path).toEqual(['Paris', 'Dijon', 'Lyon']);
      expect(result!.estimatedTime).toBeCloseTo(4, 1);
    });

    it('should include weather information in steps', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Lyon', 'Marseille', 315, 120),
      ];
      const weatherData = new Map<string, WeatherCondition>([
        ['Lyon', 'cloudy'],
        ['Marseille', 'sunny'],
      ]);

      const result = service.findFastestRoute(
        routes,
        'Paris',
        'Marseille',
        weatherData,
      );

      expect(result).not.toBeNull();
      expect(result!.steps[0].weather).toBe('cloudy');
      expect(result!.steps[1].weather).toBe('sunny');
    });

    it('should handle same start and end city', () => {
      const routes = [new Route('Paris', 'Lyon', 465, 120)];
      const weatherData = new Map<string, WeatherCondition>();

      const result = service.findFastestRoute(
        routes,
        'Paris',
        'Paris',
        weatherData,
      );

      expect(result).not.toBeNull();
      expect(result!.path).toEqual(['Paris']);
      expect(result!.totalDistance).toBe(0);
      expect(result!.estimatedTime).toBe(0);
      expect(result!.steps).toHaveLength(0);
    });

    it('should work with complex real-world graph', () => {
      // Simulating a portion of French cities
      const routes = [
        new Route('Lille', 'Paris', 225, 130),
        new Route('Paris', 'Strasbourg', 490, 120),
        new Route('Paris', 'Dijon', 315, 110),
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Strasbourg', 'Dijon', 330, 110),
        new Route('Dijon', 'Lyon', 195, 110),
        new Route('Lyon', 'Marseille', 315, 120),
        new Route('Lyon', 'Nice', 470, 110),
        new Route('Marseille', 'Nice', 205, 110),
      ];
      const weatherData = new Map<string, WeatherCondition>([
        ['Paris', 'cloudy'],
        ['Lyon', 'sunny'],
        ['Marseille', 'sunny'],
        ['Nice', 'sunny'],
        ['Dijon', 'cloudy'],
        ['Strasbourg', 'rain'],
      ]);

      const result = service.findFastestRoute(
        routes,
        'Lille',
        'Nice',
        weatherData,
      );

      expect(result).not.toBeNull();
      expect(result!.path[0]).toBe('Lille');
      expect(result!.path[result!.path.length - 1]).toBe('Nice');
      expect(result!.totalDistance).toBeGreaterThan(0);
      expect(result!.estimatedTime).toBeGreaterThan(0);
    });

    it('should return null when all routes are filtered out', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Lyon', 'Marseille', 315, 120),
      ];
      const weatherData = new Map<string, WeatherCondition>([
        ['Lyon', 'rain'],
        ['Marseille', 'snow'],
      ]);
      const constraints = new RouteConstraints(['rain', 'snow']);

      const result = service.findFastestRoute(
        routes,
        'Paris',
        'Marseille',
        weatherData,
        constraints,
      );

      expect(result).toBeNull();
    });

    it('should handle empty routes array', () => {
      const routes: Route[] = [];
      const weatherData = new Map<string, WeatherCondition>();

      const result = service.findFastestRoute(
        routes,
        'Paris',
        'Lyon',
        weatherData,
      );

      expect(result).toBeNull();
    });
  });
});
