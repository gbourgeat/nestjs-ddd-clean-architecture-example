import {
  UpdateRoadSegmentSpeedUseCase,
} from '@/application/use-cases/update-road-segment-speed/update-road-segment-speed.use-case';
import { RoadSegment, City } from '@/domain/entities';
import {
  RoadSegmentNotFoundError,
  InvalidSpeedError,
  InvalidRoadSegmentIdError,
} from '@/domain/errors';
import {
  CityBuilder,
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
    expect(result).toEqual({
      roadSegmentId: 'lyon__paris',
      cityA: 'Lyon',
      cityB: 'Paris',
      distance: 465,
      speedLimit: 130,
    });
    expect(roadSegment.speedLimit.kmPerHour).toBe(130);
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
    expect(result.speedLimit).toBe(90);
  });

  it('should throw RoadSegmentNotFoundError when road segment does not exist', async () => {
    // Arrange - repository is empty, no segments added

    // Act & Assert
    await expect(
      useCase.execute({
        cityA: 'Paris',
        cityB: 'UnknownCity',
        newSpeedLimit: 130,
      }),
    ).rejects.toThrow(RoadSegmentNotFoundError);
  });

  it('should throw InvalidSpeedError for negative speed', async () => {
    // Arrange
    const cityA = CityFixtures.paris();
    const cityB = CityFixtures.lyon();

    const roadSegment = RoadSegmentBuilder.aRoadSegment()
      .between(cityA, cityB)
      .withDistance(465)
      .withSpeedLimit(110)
      .build();

    roadSegmentRepository.givenRoadSegments([roadSegment]);

    // Act & Assert
    await expect(
      useCase.execute({
        cityA: 'Paris',
        cityB: 'Lyon',
        newSpeedLimit: -10,
      }),
    ).rejects.toThrow(InvalidSpeedError);
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
    expect(result.speedLimit).toBe(0);
  });

  it('should throw InvalidRoadSegmentIdError for empty city name', async () => {
    // Act & Assert
    await expect(
      useCase.execute({
        cityA: '',
        cityB: 'Lyon',
        newSpeedLimit: 130,
      }),
    ).rejects.toThrow(InvalidRoadSegmentIdError);
  });
});
