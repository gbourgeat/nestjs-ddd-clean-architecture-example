import { Route } from '../../domain/entities';
import { WeatherCondition } from '../../domain/value-objects';
import { PathReconstructor } from './path-reconstructor';
import { PreviousCity } from './types';

describe('PathReconstructor', () => {
  let pathReconstructor: PathReconstructor;

  beforeEach(() => {
    pathReconstructor = new PathReconstructor();
  });

  describe('reconstruct', () => {
    it('should reconstruct a simple path with one step', () => {
      const previous = new Map<string, PreviousCity>([
        [
          'Lyon',
          {
            city: 'Paris',
            route: new Route('Paris', 'Lyon', 465, 120),
          },
        ],
      ]);
      const weatherData = new Map<string, WeatherCondition>([
        ['Lyon', 'sunny'],
      ]);

      const result = pathReconstructor.reconstruct(
        previous,
        'Paris',
        'Lyon',
        3.875,
        weatherData,
      );

      expect(result.path).toEqual(['Paris', 'Lyon']);
      expect(result.totalDistance).toBe(465);
      expect(result.estimatedTime).toBeCloseTo(3.875, 3);
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0]).toEqual({
        from: 'Paris',
        to: 'Lyon',
        distance: 465,
        speed: 120,
        travelTime: 3.875,
        weather: 'sunny',
      });
    });

    it('should reconstruct a path with multiple steps', () => {
      const previous = new Map<string, PreviousCity>([
        [
          'Dijon',
          {
            city: 'Paris',
            route: new Route('Paris', 'Dijon', 315, 110),
          },
        ],
        [
          'Lyon',
          {
            city: 'Dijon',
            route: new Route('Dijon', 'Lyon', 195, 110),
          },
        ],
        [
          'Marseille',
          {
            city: 'Lyon',
            route: new Route('Lyon', 'Marseille', 315, 120),
          },
        ],
      ]);
      const weatherData = new Map<string, WeatherCondition>([
        ['Dijon', 'cloudy'],
        ['Lyon', 'sunny'],
        ['Marseille', 'sunny'],
      ]);

      const result = pathReconstructor.reconstruct(
        previous,
        'Paris',
        'Marseille',
        7.5,
        weatherData,
      );

      expect(result.path).toEqual(['Paris', 'Dijon', 'Lyon', 'Marseille']);
      expect(result.totalDistance).toBe(825); // 315 + 195 + 315
      expect(result.estimatedTime).toBeCloseTo(7.5, 3);
      expect(result.steps).toHaveLength(3);
      expect(result.steps[0].from).toBe('Paris');
      expect(result.steps[0].to).toBe('Dijon');
      expect(result.steps[1].from).toBe('Dijon');
      expect(result.steps[1].to).toBe('Lyon');
      expect(result.steps[2].from).toBe('Lyon');
      expect(result.steps[2].to).toBe('Marseille');
    });

    it('should handle path with same start and end', () => {
      const previous = new Map<string, PreviousCity>();
      const weatherData = new Map<string, WeatherCondition>();

      const result = pathReconstructor.reconstruct(
        previous,
        'Paris',
        'Paris',
        0,
        weatherData,
      );

      expect(result.path).toEqual(['Paris']);
      expect(result.totalDistance).toBe(0);
      expect(result.estimatedTime).toBe(0);
      expect(result.steps).toHaveLength(0);
    });

    it('should include weather data in steps', () => {
      const previous = new Map<string, PreviousCity>([
        [
          'Lyon',
          {
            city: 'Paris',
            route: new Route('Paris', 'Lyon', 465, 120),
          },
        ],
        [
          'Marseille',
          {
            city: 'Lyon',
            route: new Route('Lyon', 'Marseille', 315, 120),
          },
        ],
      ]);
      const weatherData = new Map<string, WeatherCondition>([
        ['Lyon', 'rain'],
        ['Marseille', 'sunny'],
      ]);

      const result = pathReconstructor.reconstruct(
        previous,
        'Paris',
        'Marseille',
        6.5,
        weatherData,
      );

      expect(result.steps[0].weather).toBe('rain');
      expect(result.steps[1].weather).toBe('sunny');
    });

    it('should handle missing weather data', () => {
      const previous = new Map<string, PreviousCity>([
        [
          'Lyon',
          {
            city: 'Paris',
            route: new Route('Paris', 'Lyon', 465, 120),
          },
        ],
      ]);
      const weatherData = new Map<string, WeatherCondition>();

      const result = pathReconstructor.reconstruct(
        previous,
        'Paris',
        'Lyon',
        3.875,
        weatherData,
      );

      expect(result.steps[0].weather).toBeUndefined();
    });

    it('should calculate correct total distance', () => {
      const previous = new Map<string, PreviousCity>([
        [
          'B',
          {
            city: 'A',
            route: new Route('A', 'B', 100, 100),
          },
        ],
        [
          'C',
          {
            city: 'B',
            route: new Route('B', 'C', 200, 100),
          },
        ],
        [
          'D',
          {
            city: 'C',
            route: new Route('C', 'D', 300, 100),
          },
        ],
      ]);
      const weatherData = new Map<string, WeatherCondition>();

      const result = pathReconstructor.reconstruct(
        previous,
        'A',
        'D',
        6,
        weatherData,
      );

      expect(result.totalDistance).toBe(600); // 100 + 200 + 300
      expect(result.steps).toHaveLength(3);
    });

    it('should preserve route properties in steps', () => {
      const previous = new Map<string, PreviousCity>([
        [
          'Lyon',
          {
            city: 'Paris',
            route: new Route('Paris', 'Lyon', 465, 120),
          },
        ],
      ]);
      const weatherData = new Map<string, WeatherCondition>();

      const result = pathReconstructor.reconstruct(
        previous,
        'Paris',
        'Lyon',
        3.875,
        weatherData,
      );

      const step = result.steps[0];
      expect(step.from).toBe('Paris');
      expect(step.to).toBe('Lyon');
      expect(step.distance).toBe(465);
      expect(step.speed).toBe(120);
      expect(step.travelTime).toBeCloseTo(3.875, 3);
    });
  });
});
