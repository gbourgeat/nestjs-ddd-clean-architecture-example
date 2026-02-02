import { UpdateRoadSegmentSpeedUseCase } from '@/application/use-cases/update-road-segment-speed/update-road-segment-speed.use-case';
import {
  InvalidRoadSegmentIdError,
  InvalidSpeedError,
  RoadSegmentNotFoundError,
} from '@/domain/errors';
import {
  CityFixtures,
  RoadSegmentBuilder,
  RoadSegmentInMemoryRepository,
} from '@test/fixtures';

describe('UpdateRoadSegmentSpeedUseCase', () => {
  let useCase: UpdateRoadSegmentSpeedUseCase;
  let roadSegmentRepository: RoadSegmentInMemoryRepository;

  beforeEach(() => {
    roadSegmentRepository = new RoadSegmentInMemoryRepository();
    useCase = new UpdateRoadSegmentSpeedUseCase(roadSegmentRepository);
  });

  it('should update road segment speed limit successfully', async () => {
    // Arrange
    const cityA = CityFixtures.paris();
    const cityB = CityFixtures.lyon();

    const roadSegment = RoadSegmentBuilder.aRoadSegment()
      .between(cityA, cityB)
      .withDistance(465)
      .withSpeedLimit(110)
      .build();

    roadSegmentRepository.givenRoadSegments([roadSegment]);

    // Act
    const result = await useCase.execute({
      cityA: 'Paris',
      cityB: 'Lyon',
      newSpeedLimit: 130,
    });

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({
        roadSegmentId: 'lyon__paris',
        cityA: 'Lyon',
        cityB: 'Paris',
        distance: 465,
        speedLimit: 130,
      });
      expect(roadSegment.speedLimit.kmPerHour).toBe(130);
    }
  });

  it('should work with cities in reverse order', async () => {
    // Arrange
    const cityA = CityFixtures.lyon();
    const cityB = CityFixtures.paris();

    const roadSegment = RoadSegmentBuilder.aRoadSegment()
      .between(cityA, cityB)
      .withDistance(465)
      .withSpeedLimit(110)
      .build();

    roadSegmentRepository.givenRoadSegments([roadSegment]);

    // Act
    const result = await useCase.execute({
      cityA: 'Lyon',
      cityB: 'Paris',
      newSpeedLimit: 90,
    });

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.speedLimit).toBe(90);
    }
  });

  it('should return RoadSegmentNotFoundError when road segment does not exist', async () => {
    // Arrange - repository is empty, no segments added

    // Act
    const result = await useCase.execute({
      cityA: 'Paris',
      cityB: 'UnknownCity',
      newSpeedLimit: 130,
    });

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(RoadSegmentNotFoundError);
    }
  });

  it('should return InvalidSpeedError for negative speed', async () => {
    // Arrange
    const cityA = CityFixtures.paris();
    const cityB = CityFixtures.lyon();

    const roadSegment = RoadSegmentBuilder.aRoadSegment()
      .between(cityA, cityB)
      .withDistance(465)
      .withSpeedLimit(110)
      .build();

    roadSegmentRepository.givenRoadSegments([roadSegment]);

    // Act
    const result = await useCase.execute({
      cityA: 'Paris',
      cityB: 'Lyon',
      newSpeedLimit: -10,
    });

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(InvalidSpeedError);
    }
  });

  it('should accept zero speed (edge case - currently allowed)', async () => {
    // Arrange
    const cityA = CityFixtures.paris();
    const cityB = CityFixtures.lyon();

    const roadSegment = RoadSegmentBuilder.aRoadSegment()
      .between(cityA, cityB)
      .withDistance(465)
      .withSpeedLimit(110)
      .build();

    roadSegmentRepository.givenRoadSegments([roadSegment]);

    // Act
    const result = await useCase.execute({
      cityA: 'Paris',
      cityB: 'Lyon',
      newSpeedLimit: 0,
    });

    // Assert - Speed allows 0, so this should work
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.speedLimit).toBe(0);
    }
  });

  it('should return InvalidRoadSegmentIdError for empty city name', async () => {
    // Act
    const result = await useCase.execute({
      cityA: '',
      cityB: 'Lyon',
      newSpeedLimit: 130,
    });

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(InvalidRoadSegmentIdError);
    }
  });
});
