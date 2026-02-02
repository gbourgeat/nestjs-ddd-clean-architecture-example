import { City, RoadSegment } from '@/domain/entities';
import { RoadSegmentNotFoundError } from '@/domain/errors';
import {
  CityId,
  CityName,
  Distance,
  RoadSegmentId,
  Speed,
} from '@/domain/value-objects';
import {
  CityTypeormEntity,
  RoadSegmentTypeormEntity,
} from '@/infrastructure/database/entities';
import { RoadSegmentTypeormRepository } from '@/infrastructure/database/repositories/road-segment.typeorm-repository';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

describe('RoadSegmentTypeormRepository (Integration)', () => {
  let repository: RoadSegmentTypeormRepository;
  let roadSegmentTypeormRepository: Repository<RoadSegmentTypeormEntity>;
  let cityTypeormRepository: Repository<CityTypeormEntity>;
  let dataSource: DataSource;
  let module: TestingModule;

  // Test data
  let parisEntity: CityTypeormEntity;
  let lyonEntity: CityTypeormEntity;
  let marseilleEntity: CityTypeormEntity;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST || 'localhost',
          port: Number.parseInt(process.env.DATABASE_PORT || '54322'),
          username: process.env.DATABASE_USER || 'postgres',
          password: process.env.DATABASE_PASSWORD || 'postgres',
          database:
            process.env.DATABASE_NAME || 'route_solver_integration_test',
          entities: [CityTypeormEntity, RoadSegmentTypeormEntity],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([CityTypeormEntity, RoadSegmentTypeormEntity]),
      ],
      providers: [RoadSegmentTypeormRepository],
    }).compile();

    repository = module.get<RoadSegmentTypeormRepository>(
      RoadSegmentTypeormRepository,
    );
    dataSource = module.get<DataSource>(DataSource);
    roadSegmentTypeormRepository = dataSource.getRepository(
      RoadSegmentTypeormEntity,
    );
    cityTypeormRepository = dataSource.getRepository(CityTypeormEntity);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  beforeEach(async () => {
    await roadSegmentTypeormRepository.clear();
    await cityTypeormRepository.clear();

    // Create test cities without specifying ID (let PostgreSQL generate UUIDs)
    parisEntity = cityTypeormRepository.create({
      name: 'Paris',
    });
    lyonEntity = cityTypeormRepository.create({ name: 'Lyon' });
    marseilleEntity = cityTypeormRepository.create({
      name: 'Marseille',
    });

    await cityTypeormRepository.save([
      parisEntity,
      lyonEntity,
      marseilleEntity,
    ]);
  });

  describe('findAll', () => {
    it('should return all road segments', async () => {
      // Arrange
      const segment1 = roadSegmentTypeormRepository.create({
        id: crypto.randomUUID(),
        cityAId: parisEntity.id,
        cityBId: lyonEntity.id,
        distance: 465,
        speedLimit: 130,
      });
      const segment2 = roadSegmentTypeormRepository.create({
        id: crypto.randomUUID(),
        cityAId: lyonEntity.id,
        cityBId: marseilleEntity.id,
        distance: 315,
        speedLimit: 130,
      });
      await roadSegmentTypeormRepository.save([segment1, segment2]);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toHaveLength(2);
        expect(result.value.every((s) => s instanceof RoadSegment)).toBe(true);
      }
    });

    it('should return empty array when no road segments exist', async () => {
      // Act
      const result = await repository.findAll();

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toHaveLength(0);
      }
    });

    it('should correctly map road segment properties', async () => {
      // Arrange
      const segment = roadSegmentTypeormRepository.create({
        id: crypto.randomUUID(),
        cityAId: parisEntity.id,
        cityBId: lyonEntity.id,
        distance: 465,
        speedLimit: 130,
      });
      await roadSegmentTypeormRepository.save(segment);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toHaveLength(1);
        const roadSegment = result.value[0];
        // Cities are sorted alphabetically, so Lyon comes before Paris
        expect(roadSegment.cityA.name.value).toBe('Lyon');
        expect(roadSegment.cityB.name.value).toBe('Paris');
        expect(roadSegment.distance.kilometers).toBe(465);
        expect(roadSegment.speedLimit.kmPerHour).toBe(130);
      }
    });
  });

  describe('findById', () => {
    it('should find a road segment by id', async () => {
      // Arrange
      const segmentId = crypto.randomUUID();
      const segment = roadSegmentTypeormRepository.create({
        id: segmentId,
        cityAId: parisEntity.id,
        cityBId: lyonEntity.id,
        distance: 465,
        speedLimit: 130,
      });
      await roadSegmentTypeormRepository.save(segment);

      const roadSegmentId = RoadSegmentId.fromString(segmentId);

      // Act
      const result = await repository.findById(roadSegmentId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeInstanceOf(RoadSegment);
        // Cities are sorted alphabetically, so Lyon comes before Paris
        expect(result.value.cityA.name.value).toBe('Lyon');
        expect(result.value.cityB.name.value).toBe('Paris');
      }
    });

    it('should return RoadSegmentNotFoundError when road segment does not exist', async () => {
      // Arrange
      const nonExistentId = RoadSegmentId.fromString(crypto.randomUUID());

      // Act
      const result = await repository.findById(nonExistentId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(RoadSegmentNotFoundError);
      }
    });
  });

  describe('save', () => {
    it('should update an existing road segment speed limit', async () => {
      // Arrange
      const segmentId = crypto.randomUUID();
      const segment = roadSegmentTypeormRepository.create({
        id: segmentId,
        cityAId: parisEntity.id,
        cityBId: lyonEntity.id,
        distance: 465,
        speedLimit: 130,
      });
      await roadSegmentTypeormRepository.save(segment);

      const paris = City.reconstitute(
        CityId.fromString(parisEntity.id),
        CityName.fromString('Paris'),
      );
      const lyon = City.reconstitute(
        CityId.fromString(lyonEntity.id),
        CityName.fromString('Lyon'),
      );
      const updatedRoadSegment = RoadSegment.reconstitute(
        RoadSegmentId.fromString(segmentId),
        [paris, lyon],
        Distance.fromKilometersOrThrow(465),
        Speed.fromKmPerHourOrThrow(110), // Changed speed
      );

      // Act
      await repository.save(updatedRoadSegment);

      // Assert
      const savedSegment = await roadSegmentTypeormRepository.findOne({
        where: { id: segmentId },
      });
      expect(savedSegment!.speedLimit).toBe(110);
    });

    it('should update road segment distance', async () => {
      // Arrange
      const segmentId = crypto.randomUUID();
      const segment = roadSegmentTypeormRepository.create({
        id: segmentId,
        cityAId: parisEntity.id,
        cityBId: lyonEntity.id,
        distance: 465,
        speedLimit: 130,
      });
      await roadSegmentTypeormRepository.save(segment);

      const paris = City.reconstitute(
        CityId.fromString(parisEntity.id),
        CityName.fromString('Paris'),
      );
      const lyon = City.reconstitute(
        CityId.fromString(lyonEntity.id),
        CityName.fromString('Lyon'),
      );
      const updatedRoadSegment = RoadSegment.reconstitute(
        RoadSegmentId.fromString(segmentId),
        [paris, lyon],
        Distance.fromKilometersOrThrow(500), // Changed distance
        Speed.fromKmPerHourOrThrow(130),
      );

      // Act
      await repository.save(updatedRoadSegment);

      // Assert
      const savedSegment = await roadSegmentTypeormRepository.findOne({
        where: { id: segmentId },
      });
      expect(Number(savedSegment!.distance)).toBe(500);
    });

    it('should create new cities when saving road segment with non-existent city names', async () => {
      // Arrange - Create a road segment with a new city that doesn't exist in DB
      const newCityId = CityId.generate();
      const newCity = City.reconstitute(
        newCityId,
        CityName.fromString('Bordeaux'),
      );
      const paris = City.reconstitute(
        CityId.fromString(parisEntity.id),
        CityName.fromString('Paris'),
      );
      const roadSegment = RoadSegment.reconstitute(
        RoadSegmentId.generate(),
        [newCity, paris],
        Distance.fromKilometersOrThrow(580),
        Speed.fromKmPerHourOrThrow(130),
      );

      // Act
      const result = await repository.save(roadSegment);

      // Assert - Save should succeed and create the new city
      expect(result.success).toBe(true);

      // Verify the road segment was saved
      const savedSegment = await roadSegmentTypeormRepository.findOne({
        where: [{ cityAId: parisEntity.id }, { cityBId: parisEntity.id }],
      });
      expect(savedSegment).not.toBeNull();
      expect(Number(savedSegment!.distance)).toBe(580);

      // Verify the new city was created
      const bordeauxEntity = await cityTypeormRepository.findOne({
        where: { name: 'Bordeaux' },
      });
      expect(bordeauxEntity).not.toBeNull();
    });
  });
});
