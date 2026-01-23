import { Route } from '../../domain/entities';
import { RouteConstraints, WeatherCondition } from '../../domain/value-objects';
import { RouteFilter } from './route-filter';

describe('RouteFilter', () => {
  let routeFilter: RouteFilter;

  beforeEach(() => {
    routeFilter = new RouteFilter();
  });

  describe('filter with no constraints', () => {
    it('should return all routes when no constraints provided', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Lyon', 'Marseille', 315, 120),
        new Route('Paris', 'Lille', 225, 130),
      ];
      const weatherData = new Map<string, WeatherCondition>();

      const result = routeFilter.filter(routes, weatherData);

      expect(result).toEqual(routes);
      expect(result).toHaveLength(3);
    });
  });

  describe('filter by max distance', () => {
    it('should filter routes exceeding max distance', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Lyon', 'Marseille', 315, 120),
        new Route('Paris', 'Dijon', 225, 110),
      ];
      const weatherData = new Map<string, WeatherCondition>();
      const constraints = new RouteConstraints(undefined, 400);

      const result = routeFilter.filter(routes, weatherData, constraints);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(routes[1]); // 315 km
      expect(result).toContainEqual(routes[2]); // 225 km
      expect(result).not.toContainEqual(routes[0]); // 465 km (filtered out)
    });

    it('should include routes equal to max distance', () => {
      const routes = [
        new Route('A', 'B', 500, 120),
        new Route('C', 'D', 501, 120),
      ];
      const weatherData = new Map<string, WeatherCondition>();
      const constraints = new RouteConstraints(undefined, 500);

      const result = routeFilter.filter(routes, weatherData, constraints);

      expect(result).toHaveLength(1);
      expect(result[0].distance).toBe(500);
    });

    it('should return empty array when all routes exceed max distance', () => {
      const routes = [
        new Route('A', 'B', 600, 120),
        new Route('C', 'D', 700, 120),
      ];
      const weatherData = new Map<string, WeatherCondition>();
      const constraints = new RouteConstraints(undefined, 500);

      const result = routeFilter.filter(routes, weatherData, constraints);

      expect(result).toHaveLength(0);
    });
  });

  describe('filter by min speed', () => {
    it('should filter routes below min speed', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Lyon', 'Marseille', 315, 110),
        new Route('Marseille', 'Nice', 205, 100),
      ];
      const weatherData = new Map<string, WeatherCondition>();
      const constraints = new RouteConstraints(undefined, undefined, 115);

      const result = routeFilter.filter(routes, weatherData, constraints);

      expect(result).toHaveLength(1);
      expect(result[0].speed).toBe(120);
    });

    it('should include routes equal to min speed', () => {
      const routes = [
        new Route('A', 'B', 100, 110),
        new Route('C', 'D', 100, 109),
      ];
      const weatherData = new Map<string, WeatherCondition>();
      const constraints = new RouteConstraints(undefined, undefined, 110);

      const result = routeFilter.filter(routes, weatherData, constraints);

      expect(result).toHaveLength(1);
      expect(result[0].speed).toBe(110);
    });
  });

  describe('filter by weather', () => {
    it('should filter routes to cities with excluded weather', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Paris', 'Marseille', 775, 120),
        new Route('Paris', 'Dijon', 315, 110),
      ];
      const weatherData = new Map<string, WeatherCondition>([
        ['Lyon', 'rain'],
        ['Marseille', 'sunny'],
        ['Dijon', 'cloudy'],
      ]);
      const constraints = new RouteConstraints(['rain', 'snow']);

      const result = routeFilter.filter(routes, weatherData, constraints);

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.to)).toContain('Marseille');
      expect(result.map((r) => r.to)).toContain('Dijon');
      expect(result.map((r) => r.to)).not.toContain('Lyon');
    });

    it('should allow routes to cities without weather data', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Paris', 'Unknown', 500, 120),
      ];
      const weatherData = new Map<string, WeatherCondition>([['Lyon', 'rain']]);
      const constraints = new RouteConstraints(['rain']);

      const result = routeFilter.filter(routes, weatherData, constraints);

      expect(result).toHaveLength(1);
      expect(result[0].to).toBe('Unknown');
    });

    it('should filter multiple weather conditions', () => {
      const routes = [
        new Route('Start', 'Rain', 100, 120),
        new Route('Start', 'Snow', 100, 120),
        new Route('Start', 'Thunderstorm', 100, 120),
        new Route('Start', 'Sunny', 100, 120),
      ];
      const weatherData = new Map<string, WeatherCondition>([
        ['Rain', 'rain'],
        ['Snow', 'snow'],
        ['Thunderstorm', 'thunderstorm'],
        ['Sunny', 'sunny'],
      ]);
      const constraints = new RouteConstraints([
        'rain',
        'snow',
        'thunderstorm',
      ]);

      const result = routeFilter.filter(routes, weatherData, constraints);

      expect(result).toHaveLength(1);
      expect(result[0].to).toBe('Sunny');
    });

    it('should not filter when excludeWeather is empty array', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Paris', 'Marseille', 775, 120),
      ];
      const weatherData = new Map<string, WeatherCondition>([
        ['Lyon', 'rain'],
        ['Marseille', 'snow'],
      ]);
      const constraints = new RouteConstraints([]);

      const result = routeFilter.filter(routes, weatherData, constraints);

      expect(result).toHaveLength(2);
    });
  });

  describe('filter with combined constraints', () => {
    it('should apply all constraints together', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120), // OK
        new Route('Paris', 'Marseille', 775, 120), // distance too long
        new Route('Paris', 'Dijon', 315, 100), // speed too slow
        new Route('Paris', 'Lille', 225, 130), // weather excluded
        new Route('Paris', 'Nantes', 385, 110), // OK
      ];
      const weatherData = new Map<string, WeatherCondition>([
        ['Lyon', 'sunny'],
        ['Marseille', 'cloudy'],
        ['Dijon', 'cloudy'],
        ['Lille', 'rain'],
        ['Nantes', 'cloudy'],
      ]);
      const constraints = new RouteConstraints(['rain', 'snow'], 600, 110);

      const result = routeFilter.filter(routes, weatherData, constraints);

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.to)).toContain('Lyon');
      expect(result.map((r) => r.to)).toContain('Nantes');
    });

    it('should return empty array when no routes satisfy all constraints', () => {
      const routes = [
        new Route('A', 'B', 600, 100), // both constraints violated
        new Route('A', 'C', 400, 90), // speed constraint violated
      ];
      const weatherData = new Map<string, WeatherCondition>();
      const constraints = new RouteConstraints(undefined, 500, 110);

      const result = routeFilter.filter(routes, weatherData, constraints);

      expect(result).toHaveLength(0);
    });
  });
});
