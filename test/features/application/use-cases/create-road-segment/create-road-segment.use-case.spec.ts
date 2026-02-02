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
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({
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
      }
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
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.cityA).toBe('Lyon');
        expect(result.value.cityB).toBe('Paris');
        expect(result.value.roadSegmentId).toBe('lyon__paris');
      }
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
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.distance).toBe(0.1);
        expect(result.value.speedLimit).toBe(1);
      }
    });
  });

  describe('Validation errors', () => {
    it('should return CityNotFoundError when cityA does not exist', async () => {
      // Arrange
      const cityB = CityFixtures.lyon();
      roadSegmentRepository.givenCities([cityB]);

      // Act
      const result = await useCase.execute({
        cityA: 'UnknownCity',
        cityB: 'Lyon',
        distance: 465,
        speedLimit: 130,
      });

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(CityNotFoundError);
      }
    });

    it('should return CityNotFoundError when cityB does not exist', async () => {
      // Arrange
      const cityA = CityFixtures.paris();
      roadSegmentRepository.givenCities([cityA]);

      // Act
      const result = await useCase.execute({
        cityA: 'Paris',
        cityB: 'UnknownCity',
        distance: 465,
        speedLimit: 130,
      });

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(CityNotFoundError);
      }
    });

    it('should return InvalidCityNameError when cityA is empty', async () => {
      // Arrange
      const cityB = CityFixtures.lyon();
      roadSegmentRepository.givenCities([cityB]);

      // Act
      const result = await useCase.execute({
        cityA: '',
        cityB: 'Lyon',
        distance: 465,
        speedLimit: 130,
      });

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidCityNameError);
      }
    });

    it('should return InvalidCityNameError when cityB is empty', async () => {
      // Arrange
      const cityA = CityFixtures.paris();
      roadSegmentRepository.givenCities([cityA]);

      // Act
      const result = await useCase.execute({
        cityA: 'Paris',
        cityB: '',
        distance: 465,
        speedLimit: 130,
      });

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidCityNameError);
      }
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
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.distance).toBe(0);
      }
    });

    it('should return RoadSegmentCreationError when distance is negative', async () => {
      // Arrange
      const cityA = CityFixtures.paris();
      const cityB = CityFixtures.lyon();
      roadSegmentRepository.givenCities([cityA, cityB]);

      // Act
      const result = await useCase.execute({
        cityA: 'Paris',
        cityB: 'Lyon',
        distance: -100,
        speedLimit: 130,
      });

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(RoadSegmentCreationError);
      }
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
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.speedLimit).toBe(0);
      }
    });

    it('should return RoadSegmentCreationError when speedLimit is negative', async () => {
      // Arrange
      const cityA = CityFixtures.paris();
      const cityB = CityFixtures.lyon();
      roadSegmentRepository.givenCities([cityA, cityB]);

      // Act
      const result = await useCase.execute({
        cityA: 'Paris',
        cityB: 'Lyon',
        distance: 465,
        speedLimit: -50,
      });

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(RoadSegmentCreationError);
      }
    });

    it('should return RoadSegmentCreationError when both cities are the same', async () => {
      // Arrange
      const city = CityFixtures.paris();
      roadSegmentRepository.givenCities([city]);

      // Act
      const result = await useCase.execute({
        cityA: 'Paris',
        cityB: 'Paris',
        distance: 100,
        speedLimit: 130,
      });

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(RoadSegmentCreationError);
      }
    });
  });
});
