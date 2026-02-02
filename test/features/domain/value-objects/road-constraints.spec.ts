import { GetFastestRouteInput } from '@/application/use-cases/get-fastest-route/get-fastest-route.input';
import { GetFastestRouteUseCase } from '@/application/use-cases/get-fastest-route/get-fastest-route.use-case';
import { City, RoadSegment } from '@/domain/entities';
import {
  CityFixtures,
  PathFinderFake,
  PathfindingResultBuilder,
  RoadSegmentBuilder,
  RoadSegmentInMemoryRepository,
  RouteStepBuilder,
} from '@test/fixtures';

describe('RoadConstraints', () => {
  let useCase: GetFastestRouteUseCase;
  let roadSegmentRepository: RoadSegmentInMemoryRepository;
  let pathFinder: PathFinderFake;

  let parisCity: City;
  let lyonCity: City;
  let marseilleCity: City;
  let roadSegmentParisLyon: RoadSegment;
  let roadSegmentLyonMarseille: RoadSegment;

  beforeEach(() => {
    roadSegmentRepository = new RoadSegmentInMemoryRepository();
    pathFinder = new PathFinderFake();

    parisCity = CityFixtures.paris();
    lyonCity = CityFixtures.lyon();
    marseilleCity = CityFixtures.marseille();

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

    roadSegmentRepository.givenRoadSegments([
      roadSegmentParisLyon,
      roadSegmentLyonMarseille,
    ]);

    useCase = new GetFastestRouteUseCase(pathFinder, roadSegmentRepository);
  });

  it('should handle constraints with excluded weather conditions', async () => {
    const input: GetFastestRouteInput = {
      startCity: 'Paris',
      endCity: 'Lyon',
      constraints: {
        excludeWeatherConditions: ['rain', 'snow', 'fog'],
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

    const result = await useCase.execute(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.totalDistance).toBe(465);
    }
  });

  it('should handle constraints with max distance', async () => {
    const input: GetFastestRouteInput = {
      startCity: 'Paris',
      endCity: 'Lyon',
      constraints: {
        maxDistance: 1000,
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

    const result = await useCase.execute(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.totalDistance).toBe(465);
    }
  });

  it('should handle constraints with min speed limit', async () => {
    const input: GetFastestRouteInput = {
      startCity: 'Paris',
      endCity: 'Lyon',
      constraints: {
        minSpeedLimit: 90,
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

    const result = await useCase.execute(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.totalDistance).toBe(465);
    }
  });

  it('should throw InvalidWeatherConditionError for invalid weather in constraints', async () => {
    const input: GetFastestRouteInput = {
      startCity: 'Paris',
      endCity: 'Lyon',
      constraints: {
        excludeWeatherConditions: ['invalid-weather'],
      },
    };

    // Note: Invalid weather validation happens in the mapper before the use case returns
    // This test verifies the error is thrown during constraint mapping
    await expect(useCase.execute(input)).rejects.toThrow(
      /Invalid weather condition/,
    );
  });
});
