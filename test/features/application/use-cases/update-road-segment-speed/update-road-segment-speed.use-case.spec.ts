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
  // Fixed UUIDs for test reproducibility
  const ROAD_SEGMENT_UUID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const NON_EXISTENT_UUID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

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
      .withId(ROAD_SEGMENT_UUID)
      .between(cityA, cityB)
      .withDistance(465)
      .withSpeedLimit(110)
      .build();

    roadSegmentRepository.givenRoadSegments([roadSegment]);

    // Act
    const result = await useCase.execute({
      roadSegmentId: ROAD_SEGMENT_UUID,
      newSpeedLimit: 130,
    });

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({
        roadSegmentId: ROAD_SEGMENT_UUID,
        cityA: 'Lyon',
        cityB: 'Paris',
        distance: 465,
        speedLimit: 130,
      });
      expect(roadSegment.speedLimit.kmPerHour).toBe(130);
    }
  });

  it('should work with different city orders', async () => {
    // Arrange
    const cityA = CityFixtures.lyon();
    const cityB = CityFixtures.paris();

    const roadSegment = RoadSegmentBuilder.aRoadSegment()
      .withId(ROAD_SEGMENT_UUID)
      .between(cityA, cityB)
      .withDistance(465)
      .withSpeedLimit(110)
      .build();

    roadSegmentRepository.givenRoadSegments([roadSegment]);

    // Act
    const result = await useCase.execute({
      roadSegmentId: ROAD_SEGMENT_UUID,
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
      roadSegmentId: NON_EXISTENT_UUID,
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
      .withId(ROAD_SEGMENT_UUID)
      .between(cityA, cityB)
      .withDistance(465)
      .withSpeedLimit(110)
      .build();

    roadSegmentRepository.givenRoadSegments([roadSegment]);

    // Act
    const result = await useCase.execute({
      roadSegmentId: ROAD_SEGMENT_UUID,
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
      .withId(ROAD_SEGMENT_UUID)
      .between(cityA, cityB)
      .withDistance(465)
      .withSpeedLimit(110)
      .build();

    roadSegmentRepository.givenRoadSegments([roadSegment]);

    // Act
    const result = await useCase.execute({
      roadSegmentId: ROAD_SEGMENT_UUID,
      newSpeedLimit: 0,
    });

    // Assert - Speed allows 0, so this should work
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.speedLimit).toBe(0);
    }
  });

  it('should return InvalidRoadSegmentIdError for empty ID', async () => {
    // Act
    const result = await useCase.execute({
      roadSegmentId: '',
      newSpeedLimit: 130,
    });

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(InvalidRoadSegmentIdError);
    }
  });

  it('should return InvalidRoadSegmentIdError for invalid UUID format', async () => {
    // Act
    const result = await useCase.execute({
      roadSegmentId: 'invalid-format',
      newSpeedLimit: 130,
    });

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(InvalidRoadSegmentIdError);
    }
  });
});
