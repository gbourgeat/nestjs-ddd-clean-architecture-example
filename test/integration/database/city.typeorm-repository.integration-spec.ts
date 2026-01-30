import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CityTypeormRepository } from '@/infrastructure/database/repositories/city.typeorm-repository';
import { CityTypeormEntity } from '@/infrastructure/database/entities/city.typeorm-entity';
import { CityName, CityId } from '@/domain/value-objects';
import { City } from '@/domain/entities';
import { CityNotFoundError } from '@/domain/errors';

describe('CityTypeormRepository (Integration)', () => {
  let repository: CityTypeormRepository;
  let typeormRepository: Repository<CityTypeormEntity>;
  let dataSource: DataSource;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST || 'localhost',
          port: parseInt(process.env.DATABASE_PORT || '54322'),
          username: process.env.DATABASE_USER || 'postgres',
          password: process.env.DATABASE_PASSWORD || 'postgres',
          database:
            process.env.DATABASE_NAME || 'route_solver_integration_test',
          entities: [CityTypeormEntity],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([CityTypeormEntity]),
      ],
      providers: [CityTypeormRepository],
    }).compile();

    repository = module.get<CityTypeormRepository>(CityTypeormRepository);
    dataSource = module.get<DataSource>(DataSource);
    typeormRepository = dataSource.getRepository(CityTypeormEntity);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  beforeEach(async () => {
    await typeormRepository.clear();
  });

  describe('findByName', () => {
    it('should find a city by name', async () => {
      // Arrange
      const cityEntity = typeormRepository.create({
        name: 'Paris',
      });
      await typeormRepository.save(cityEntity);

      // Act
      const result = await repository.findByName(CityName.create('Paris'));

      // Assert
      expect(result).toBeInstanceOf(City);
      expect(result.name.value).toBe('Paris');
      expect(result.id.value).toBe(cityEntity.id);
    });

    it('should throw CityNotFoundError when city does not exist', async () => {
      // Arrange
      const cityName = CityName.create('NonExistentCity');

      // Act & Assert
      await expect(repository.findByName(cityName)).rejects.toThrow(
        CityNotFoundError,
      );
    });

    it('should be case-sensitive when searching for cities', async () => {
      // Arrange
      const cityEntity = typeormRepository.create({
        name: 'Paris',
      });
      await typeormRepository.save(cityEntity);

      // Act & Assert - searching for lowercase should not find the city
      await expect(
        repository.findByName(CityName.create('PARIS')),
      ).rejects.toThrow(CityNotFoundError);
    });
  });

  describe('save', () => {
    it('should save a new city', async () => {
      // Arrange
      const city = City.create(
        CityId.fromCityName('Lyon'),
        CityName.create('Lyon'),
      );

      // Act
      await repository.save(city);

      // Assert
      const savedEntity = await typeormRepository.findOne({
        where: { name: 'Lyon' },
      });
      expect(savedEntity).not.toBeNull();
      expect(savedEntity!.name).toBe('Lyon');
    });

    it('should update an existing city', async () => {
      // Arrange
      const cityEntity = typeormRepository.create({
        name: 'OldName',
      });
      await typeormRepository.save(cityEntity);

      const updatedCity = City.create(
        CityId.fromCityName('OldName'),
        CityName.create('NewName'),
      );

      // Act
      await repository.save(updatedCity);

      // Assert
      const savedEntity = await typeormRepository.findOne({
        where: { name: 'NewName' },
      });
      expect(savedEntity).not.toBeNull();
      expect(savedEntity!.name).toBe('NewName');
    });

    it('should be able to find a city after saving it', async () => {
      // Arrange
      const city = City.create(
        CityId.fromCityName('Marseille'),
        CityName.create('Marseille'),
      );

      // Act
      await repository.save(city);
      const foundCity = await repository.findByName(
        CityName.create('Marseille'),
      );

      // Assert
      expect(foundCity.name.value).toBe('Marseille');
    });
  });
});
