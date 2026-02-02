import { CreateRoadSegmentUseCase } from '@/application/use-cases/create-road-segment/create-road-segment.use-case';
import {
  CityNotFoundError,
  InvalidCityNameError,
  RoadSegmentCreationError,
} from '@/domain/errors';
import { CityFixtures, RoadSegmentInMemoryRepository } from '@test/fixtures';

describe('CreateRoadSegmentUseCase', () => {
  let useCase: CreateRoadSegmentUseCase;
  let roadSegmentRepository: RoadSegmentInMemoryRepository;

  beforeEach(() => {
    roadSegmentRepository = new RoadSegmentInMemoryRepository();
    useCase = new CreateRoadSegmentUseCase(roadSegmentRepository);
  });

  describe('Successful creation', () => {
    it('should create a road segment between two cities', async () => {
      // Arrange
      const cityA = CityFixtures.paris();
      const cityB = CityFixtures.lyon();
      roadSegmentRepository.givenCities([cityA, cityB]);

      // Act
      const result = await useCase.execute({
        cityA: 'Paris',
        cityB: 'Lyon',
        distance: 465,
        speedLimit: 130,
      });

      // Assert
      expect(result).toEqual({
        roadSegmentId: 'lyon__paris',
        cityA: 'Lyon',
        cityB: 'Paris',
        distance: 465,
        speedLimit: 130,
      });

      // Verify segment was saved
      const savedSegments = roadSegmentRepository.getAll();
      expect(savedSegments).toHaveLength(1);
      expect(savedSegments[0].distance.kilometers).toBe(465);
      expect(savedSegments[0].speedLimit.kmPerHour).toBe(130);
    });

    it('should sort cities alphabetically in the road segment ID', async () => {
      // Arrange
      const cityA = CityFixtures.paris();
      const cityB = CityFixtures.lyon();
      roadSegmentRepository.givenCities([cityA, cityB]);

      // Act - Input in reverse order
      const result = await useCase.execute({
        cityA: 'Paris',
        cityB: 'Lyon',
        distance: 465,
        speedLimit: 130,
      });

      // Assert - Cities are sorted: Lyon comes before Paris
      expect(result.cityA).toBe('Lyon');
      expect(result.cityB).toBe('Paris');
      expect(result.roadSegmentId).toBe('lyon__paris');
    });

    it('should allow creating a segment with minimum valid values', async () => {
      // Arrange
      const cityA = CityFixtures.paris();
      const cityB = CityFixtures.lyon();
      roadSegmentRepository.givenCities([cityA, cityB]);

      // Act
      const result = await useCase.execute({
        cityA: 'Paris',
        cityB: 'Lyon',
        distance: 0.1,
        speedLimit: 1,
      });

      // Assert
      expect(result.distance).toBe(0.1);
      expect(result.speedLimit).toBe(1);
    });
  });

  describe('Validation errors', () => {
    it('should throw CityNotFoundError when cityA does not exist', async () => {
      // Arrange
      const cityB = CityFixtures.lyon();
      roadSegmentRepository.givenCities([cityB]);

      // Act & Assert
      await expect(
        useCase.execute({
          cityA: 'UnknownCity',
          cityB: 'Lyon',
          distance: 465,
          speedLimit: 130,
        }),
      ).rejects.toThrow(CityNotFoundError);
    });

    it('should throw CityNotFoundError when cityB does not exist', async () => {
      // Arrange
      const cityA = CityFixtures.paris();
      roadSegmentRepository.givenCities([cityA]);

      // Act & Assert
      await expect(
        useCase.execute({
          cityA: 'Paris',
          cityB: 'UnknownCity',
          distance: 465,
          speedLimit: 130,
        }),
      ).rejects.toThrow(CityNotFoundError);
    });

    it('should throw InvalidCityNameError when cityA is empty', async () => {
      // Arrange
      const cityB = CityFixtures.lyon();
      roadSegmentRepository.givenCities([cityB]);

      // Act & Assert
      await expect(
        useCase.execute({
          cityA: '',
          cityB: 'Lyon',
          distance: 465,
          speedLimit: 130,
        }),
      ).rejects.toThrow(InvalidCityNameError);
    });

    it('should throw InvalidCityNameError when cityB is empty', async () => {
      // Arrange
      const cityA = CityFixtures.paris();
      roadSegmentRepository.givenCities([cityA]);

      // Act & Assert
      await expect(
        useCase.execute({
          cityA: 'Paris',
          cityB: '',
          distance: 465,
          speedLimit: 130,
        }),
      ).rejects.toThrow(InvalidCityNameError);
    });

    it('should allow creating a segment with zero distance', async () => {
      // Arrange
      const cityA = CityFixtures.paris();
      const cityB = CityFixtures.lyon();
      roadSegmentRepository.givenCities([cityA, cityB]);

      // Act
      const result = await useCase.execute({
        cityA: 'Paris',
        cityB: 'Lyon',
        distance: 0,
        speedLimit: 130,
      });

      // Assert - Zero distance is allowed (domain rule)
      expect(result.distance).toBe(0);
    });

    it('should throw RoadSegmentCreationError when distance is negative', async () => {
      // Arrange
      const cityA = CityFixtures.paris();
      const cityB = CityFixtures.lyon();
      roadSegmentRepository.givenCities([cityA, cityB]);

      // Act & Assert
      await expect(
        useCase.execute({
          cityA: 'Paris',
          cityB: 'Lyon',
          distance: -100,
          speedLimit: 130,
        }),
      ).rejects.toThrow(RoadSegmentCreationError);
    });

    it('should allow creating a segment with zero speed limit', async () => {
      // Arrange
      const cityA = CityFixtures.paris();
      const cityB = CityFixtures.lyon();
      roadSegmentRepository.givenCities([cityA, cityB]);

      // Act
      const result = await useCase.execute({
        cityA: 'Paris',
        cityB: 'Lyon',
        distance: 465,
        speedLimit: 0,
      });

      // Assert - Zero speed is allowed (domain rule)
      expect(result.speedLimit).toBe(0);
    });

    it('should throw RoadSegmentCreationError when speedLimit is negative', async () => {
      // Arrange
      const cityA = CityFixtures.paris();
      const cityB = CityFixtures.lyon();
      roadSegmentRepository.givenCities([cityA, cityB]);

      // Act & Assert
      await expect(
        useCase.execute({
          cityA: 'Paris',
          cityB: 'Lyon',
          distance: 465,
          speedLimit: -50,
        }),
      ).rejects.toThrow(RoadSegmentCreationError);
    });

    it('should throw RoadSegmentCreationError when both cities are the same', async () => {
      // Arrange
      const city = CityFixtures.paris();
      roadSegmentRepository.givenCities([city]);

      // Act & Assert
      await expect(
        useCase.execute({
          cityA: 'Paris',
          cityB: 'Paris',
          distance: 100,
          speedLimit: 130,
        }),
      ).rejects.toThrow(RoadSegmentCreationError);
    });
  });
});
