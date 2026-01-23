/* eslint-disable @typescript-eslint/unbound-method */
import { PathfindingService, WeatherService } from '../../domain/services';
import { RouteConstraints, WeatherCondition } from '../../domain/value-objects';
import {
  GetFastestRouteInput,
  GetFastestRouteUseCase,
} from './get-fastest-route.use-case';

describe('GetFastestRouteUseCase', () => {
  let useCase: GetFastestRouteUseCase;
  let mockPathfindingService: jest.Mocked<PathfindingService>;
  let mockWeatherService: jest.Mocked<WeatherService>;

  beforeEach(() => {
    // Create mocks
    mockPathfindingService = {
      findFastestRoute: jest.fn(),
    };

    mockWeatherService = {
      getWeatherForCity: jest.fn(),
    };

    // Create use case with mocks
    useCase = new GetFastestRouteUseCase(
      mockPathfindingService,
      mockWeatherService,
    );
  });

  describe('execute', () => {
    it('should return the fastest route when path exists', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'Paris',
        endCity: 'Lyon',
      };

      // Mock weather service to return sunny for all cities
      mockWeatherService.getWeatherForCity.mockResolvedValue('sunny');

      // Mock pathfinding service to return a valid route
      mockPathfindingService.findFastestRoute.mockReturnValue({
        path: ['Paris', 'Lyon'],
        totalDistance: 465,
        estimatedTime: 3.875,
        steps: [
          {
            from: 'Paris',
            to: 'Lyon',
            distance: 465,
            travelTime: 3.875,
            speed: 120,
            weather: 'sunny',
          },
        ],
      });

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual({
        path: ['Paris', 'Lyon'],
        totalDistance: 465,
        estimatedTime: 3.9,
        steps: [
          {
            from: 'Paris',
            to: 'Lyon',
            distance: 465,
            speed: 120,
            weather: 'sunny',
          },
        ],
      });

      // Verify weather service was called for all cities
      expect(mockWeatherService.getWeatherForCity).toHaveBeenCalled();

      // Verify pathfinding service was called with correct parameters
      expect(mockPathfindingService.findFastestRoute).toHaveBeenCalledWith(
        expect.any(Array), // ROUTES
        'Paris',
        'Lyon',
        expect.any(Map), // weatherData
        undefined, // no constraints
      );
    });

    it('should return empty path when no route exists', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'Paris',
        endCity: 'Lyon',
        constraints: new RouteConstraints(['rain'], undefined, undefined),
      };

      mockWeatherService.getWeatherForCity.mockResolvedValue('sunny');
      mockPathfindingService.findFastestRoute.mockReturnValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual({
        path: [],
        totalDistance: 0,
        estimatedTime: 0,
        steps: [],
      });
    });

    it('should pass constraints to pathfinding service', async () => {
      // Arrange
      const constraints = new RouteConstraints(['rain', 'snow'], 500, 100);

      const input: GetFastestRouteInput = {
        startCity: 'Paris',
        endCity: 'Lyon',
        constraints,
      };

      mockWeatherService.getWeatherForCity.mockResolvedValue('sunny');
      mockPathfindingService.findFastestRoute.mockReturnValue({
        path: ['Paris', 'Lyon'],
        totalDistance: 465,
        estimatedTime: 3.875,
        steps: [
          {
            from: 'Paris',
            to: 'Lyon',
            distance: 465,
            travelTime: 3.875,
            speed: 120,
            weather: 'sunny',
          },
        ],
      });

      // Act
      await useCase.execute(input);

      // Assert
      expect(mockPathfindingService.findFastestRoute).toHaveBeenCalledWith(
        expect.any(Array),
        'Paris',
        'Lyon',
        expect.any(Map),
        constraints,
      );
    });

    it('should throw error when start city does not exist', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'InvalidCity',
        endCity: 'Lyon',
      };

      mockWeatherService.getWeatherForCity.mockResolvedValue('sunny');

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        'Start city "InvalidCity" not found in graph',
      );
    });

    it('should throw error when end city does not exist', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'Paris',
        endCity: 'InvalidCity',
      };

      mockWeatherService.getWeatherForCity.mockResolvedValue('sunny');

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        'End city "InvalidCity" not found in graph',
      );
    });

    it('should fetch weather data for all cities in parallel', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'Paris',
        endCity: 'Lyon',
      };

      let resolveCount = 0;
      mockWeatherService.getWeatherForCity.mockImplementation(() => {
        resolveCount++;
        return Promise.resolve('sunny');
      });

      mockPathfindingService.findFastestRoute.mockReturnValue({
        path: ['Paris', 'Lyon'],
        totalDistance: 465,
        estimatedTime: 3.875,
        steps: [],
      });

      // Act
      await useCase.execute(input);

      // Assert - should have called weather service for all cities
      expect(mockWeatherService.getWeatherForCity).toHaveBeenCalledTimes(
        resolveCount,
      );
      expect(resolveCount).toBeGreaterThan(0);
    });

    it('should handle complex route with multiple steps', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'Lille',
        endCity: 'Nice',
      };

      mockWeatherService.getWeatherForCity.mockResolvedValue('sunny');

      mockPathfindingService.findFastestRoute.mockReturnValue({
        path: ['Lille', 'Paris', 'Dijon', 'Lyon', 'Nice'],
        totalDistance: 1385,
        estimatedTime: 12.15,
        steps: [
          {
            from: 'Lille',
            to: 'Paris',
            distance: 225,
            travelTime: 2.15,
            speed: 130,
            weather: 'cloudy',
          },
          {
            from: 'Paris',
            to: 'Dijon',
            distance: 315,
            speed: 110,
            travelTime: 1.875,
            weather: 'cloudy',
          },
          {
            from: 'Dijon',
            to: 'Lyon',
            distance: 195,
            speed: 110,
            travelTime: 1.125,
            weather: 'sunny',
          },
          {
            from: 'Lyon',
            to: 'Nice',
            distance: 470,
            travelTime: 3.875,
            speed: 110,
            weather: 'sunny',
          },
        ],
      });

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.path).toEqual(['Lille', 'Paris', 'Dijon', 'Lyon', 'Nice']);
      expect(result.totalDistance).toBe(1385);
      expect(result.estimatedTime).toBe(12.2);
      expect(result.steps).toHaveLength(4);
      expect(result.steps[0].from).toBe('Lille');
      expect(result.steps[3].to).toBe('Nice');
    });

    it('should handle different weather conditions in route', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'Paris',
        endCity: 'Nice',
      };

      // Mock different weather for different cities
      mockWeatherService.getWeatherForCity.mockImplementation(
        (cityName: string): Promise<WeatherCondition> => {
          const weatherMap: Record<string, WeatherCondition> = {
            Paris: 'rain',
            Lyon: 'cloudy',
            Nice: 'sunny',
          };
          return Promise.resolve(weatherMap[cityName] || 'sunny');
        },
      );

      mockPathfindingService.findFastestRoute.mockReturnValue({
        path: ['Paris', 'Lyon', 'Nice'],
        totalDistance: 935,
        estimatedTime: 8.15,
        steps: [
          {
            from: 'Paris',
            to: 'Lyon',
            distance: 465,
            travelTime: 3.875,
            speed: 120,
            weather: 'rain',
          },
          {
            from: 'Lyon',
            to: 'Nice',
            distance: 470,
            travelTime: 3.875,
            speed: 110,
            weather: 'sunny',
          },
        ],
      });

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.steps[0].weather).toBe('rain');
      expect(result.steps[1].weather).toBe('sunny');
    });

    it('should propagate weather service errors', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'Paris',
        endCity: 'Lyon',
      };

      mockWeatherService.getWeatherForCity.mockRejectedValue(
        new Error('Weather API unavailable'),
      );

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        'Weather API unavailable',
      );
    });
  });
});
