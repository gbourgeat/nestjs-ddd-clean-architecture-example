import { GetFastestRouteInput } from '@/application/use-cases/get-fastest-route/get-fastest-route.input';
import { GetFastestRouteUseCase } from '@/application/use-cases/get-fastest-route/get-fastest-route.use-case';
import { City, RoadSegment } from '@/domain/entities';
import {
  CityNotFoundError,
  InvalidCityNameError,
  SameStartAndEndCityError,
} from '@/domain/errors';
import {
  CityFixtures,
  PathFinderFake,
  PathfindingResultBuilder,
  RoadSegmentBuilder,
  RoadSegmentInMemoryRepository,
  RouteStepBuilder,
} from '@test/fixtures';

describe('GetFastestRouteUseCase', () => {
  let useCase: GetFastestRouteUseCase;
  let roadSegmentRepository: RoadSegmentInMemoryRepository;
  let pathFinder: PathFinderFake;

  // Test data
  let parisCity: City;
  let lyonCity: City;
  let marseilleCity: City;
  let roadSegmentParisLyon: RoadSegment;
  let roadSegmentLyonMarseille: RoadSegment;

  beforeEach(() => {
    // Create repositories and services
    roadSegmentRepository = new RoadSegmentInMemoryRepository();
    pathFinder = new PathFinderFake();

    // Create test cities using builders
    parisCity = CityFixtures.paris();
    lyonCity = CityFixtures.lyon();
    marseilleCity = CityFixtures.marseille();

    // Create test road segments using builders
    roadSegmentParisLyon = RoadSegmentBuilder.aRoadSegment()
      .between(parisCity, lyonCity)
      .withDistance(465)
      .withSpeedLimit(130)
      .build();

    roadSegmentLyonMarseille = RoadSegmentBuilder.aRoadSegment()
      .between(lyonCity, marseilleCity)
      .withDistance(315)
      .withSpeedLimit(130)
      .build();

    // Populate repository with test data (cities are registered automatically)
    roadSegmentRepository.givenRoadSegments([
      roadSegmentParisLyon,
      roadSegmentLyonMarseille,
    ]);

    // Create use case instance
    useCase = new GetFastestRouteUseCase(pathFinder, roadSegmentRepository);
  });

  describe('execute', () => {
    it('should return the fastest route when valid input is provided', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'Paris',
        endCity: 'Lyon',
      };

      const pathfindingResult = PathfindingResultBuilder.aPathfindingResult()
        .withTotalDistance(465)
        .withEstimatedTime(3.58)
        .withStep(
          RouteStepBuilder.aRouteStep()
            .withFrom(parisCity)
            .withTo(lyonCity)
            .withDistance(465)
            .withSpeedLimit(130)
            .withEstimatedDuration(3.58)
            .withWeatherCondition('sunny')
            .build(),
        )
        .build();

      pathFinder.givenResult(pathfindingResult);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({
          totalDistance: 465,
          estimatedDuration: 3.6, // Rounded to 1 decimal by mapper
          steps: [
            {
              fromCity: 'Paris',
              toCity: 'Lyon',
              distance: 465,
              speedLimit: 130,
              weatherCondition: 'sunny',
            },
          ],
        });
      }
    });

    it('should apply constraints when provided', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'Paris',
        endCity: 'Lyon',
        constraints: {
          excludeWeatherConditions: ['rain', 'snow'],
          maxDistance: 500,
          minSpeedLimit: 110,
        },
      };

      const pathfindingResult = PathfindingResultBuilder.aPathfindingResult()
        .withTotalDistance(465)
        .withEstimatedTime(3.58)
        .withStep(
          RouteStepBuilder.aRouteStep()
            .withFrom(parisCity)
            .withTo(lyonCity)
            .withDistance(465)
            .withSpeedLimit(130)
            .withEstimatedDuration(3.58)
            .withWeatherCondition('sunny')
            .build(),
        )
        .build();

      pathFinder.givenResult(pathfindingResult);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.totalDistance).toBe(465);
      }
    });

    it('should return InvalidCityNameError when start city name is empty', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: '',
        endCity: 'Lyon',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidCityNameError);
      }
    });

    it('should return InvalidCityNameError when end city name is empty', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'Paris',
        endCity: '',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidCityNameError);
      }
    });

    it('should return SameStartAndEndCityError when start and end cities are the same', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'Paris',
        endCity: 'Paris',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(SameStartAndEndCityError);
        expect(result.error.message).toBe(
          'Start city and end city cannot be the same: "Paris"',
        );
      }
    });

    it('should return InvalidCityNameError for city name with lowercase start', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'paris',
        endCity: 'Lyon',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidCityNameError);
      }
    });

    it('should return CityNotFoundError when start city is not found', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'UnknownCity',
        endCity: 'Lyon',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(CityNotFoundError);
        expect(result.error.message).toMatch(/City.*UnknownCity.*not found/);
      }
    });

    it('should return CityNotFoundError when end city is not found', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'Paris',
        endCity: 'UnknownCity',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(CityNotFoundError);
        expect(result.error.message).toMatch(/City.*UnknownCity.*not found/);
      }
    });

    it('should handle multi-step routes', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'Paris',
        endCity: 'Marseille',
      };

      const pathfindingResult = PathfindingResultBuilder.aPathfindingResult()
        .withTotalDistance(780)
        .withEstimatedTime(6.0)
        .withSteps(
          RouteStepBuilder.aRouteStep()
            .withFrom(parisCity)
            .withTo(lyonCity)
            .withDistance(465)
            .withSpeedLimit(130)
            .withEstimatedDuration(3.58)
            .withWeatherCondition('sunny')
            .build(),
          RouteStepBuilder.aRouteStep()
            .withFrom(lyonCity)
            .withTo(marseilleCity)
            .withDistance(315)
            .withSpeedLimit(130)
            .withEstimatedDuration(2.42)
            .withWeatherCondition('cloudy')
            .build(),
        )
        .build();

      pathFinder.givenResult(pathfindingResult);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.steps).toHaveLength(2);
        expect(result.value.totalDistance).toBe(780);
        expect(result.value.estimatedDuration).toBe(6.0);
        expect(result.value.steps[0].fromCity).toBe('Paris');
        expect(result.value.steps[0].toCity).toBe('Lyon');
        expect(result.value.steps[1].fromCity).toBe('Lyon');
        expect(result.value.steps[1].toCity).toBe('Marseille');
      }
    });

    it('should return empty result when no route is found', async () => {
      // Arrange
      const input: GetFastestRouteInput = {
        startCity: 'Paris',
        endCity: 'Lyon',
      };

      pathFinder.givenResult(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({
          totalDistance: 0,
          estimatedDuration: 0,
          steps: [],
        });
      }
    });
  });
});
