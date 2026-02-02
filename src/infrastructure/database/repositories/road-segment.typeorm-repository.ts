import { Result, fail, ok } from '@/domain/common';
import { City, RoadSegment } from '@/domain/entities';
import {
  CityNotFoundError,
  PersistenceError,
  RoadSegmentNotFoundError,
} from '@/domain/errors';
import { RoadSegmentRepository } from '@/domain/repositories';
import { CityName, RoadSegmentId } from '@/domain/value-objects';
import {
  CityTypeormEntity,
  DatabaseIntegrityError,
  RoadSegmentTypeormEntity,
} from '@/infrastructure/database';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityMapper, RoadSegmentMapper } from '../mappers';

@Injectable()
export class RoadSegmentTypeormRepository implements RoadSegmentRepository {
  constructor(
    @InjectRepository(RoadSegmentTypeormEntity)
    private readonly roadSegmentTypeormEntityRepository: Repository<RoadSegmentTypeormEntity>,
    @InjectRepository(CityTypeormEntity)
    private readonly cityTypeormEntityRepository: Repository<CityTypeormEntity>,
  ) {}

  async findAll(): Promise<RoadSegment[]> {
    const roadSegments = await this.roadSegmentTypeormEntityRepository.find();
    const cities = await this.cityTypeormEntityRepository.find();

    const citiesIndexById = new Map<string, CityTypeormEntity>();
    cities.forEach((city) => {
      citiesIndexById.set(city.id, city);
    });

    return roadSegments.map((roadSegmentEntity) => {
      const cityA = citiesIndexById.get(roadSegmentEntity.cityAId);
      const cityB = citiesIndexById.get(roadSegmentEntity.cityBId);

      if (!cityA || !cityB) {
        throw DatabaseIntegrityError.citiesNotFoundForRoadSegment(
          roadSegmentEntity.id,
        );
      }

      return RoadSegmentMapper.toDomain(roadSegmentEntity, cityA, cityB);
    });
  }

  async findById(
    id: RoadSegmentId,
  ): Promise<Result<RoadSegment, RoadSegmentNotFoundError>> {
    // Parse the id to get normalized city names (format: "cityA__cityB")
    const [normalizedCityAName, normalizedCityBName] = id.value.split('__');

    // Find cities using case-insensitive search
    // The ID contains normalized names (lowercase), but database has original case
    const cities = await this.cityTypeormEntityRepository
      .createQueryBuilder('city')
      .where('LOWER(city.name) IN (:...names)', {
        names: [normalizedCityAName, normalizedCityBName],
      })
      .getMany();

    if (cities.length !== 2) {
      return fail(RoadSegmentNotFoundError.forRoadSegmentId(id));
    }

    const cityA = cities.find(
      (c) => c.name.toLowerCase() === normalizedCityAName,
    );
    const cityB = cities.find(
      (c) => c.name.toLowerCase() === normalizedCityBName,
    );

    if (!cityA || !cityB) {
      return fail(RoadSegmentNotFoundError.forRoadSegmentId(id));
    }

    // Find road segment connecting these cities
    const roadSegmentEntity =
      await this.roadSegmentTypeormEntityRepository.findOne({
        where: [
          { cityAId: cityA.id, cityBId: cityB.id },
          { cityAId: cityB.id, cityBId: cityA.id },
        ],
      });

    if (!roadSegmentEntity) {
      return fail(RoadSegmentNotFoundError.forRoadSegmentId(id));
    }

    return ok(RoadSegmentMapper.toDomain(roadSegmentEntity, cityA, cityB));
  }

  async save(
    roadSegment: RoadSegment,
  ): Promise<Result<void, PersistenceError>> {
    try {
      // Upsert cities first (handle city persistence within the aggregate)
      const cityAEntity = await this.upsertCity(roadSegment.cityA);
      const cityBEntity = await this.upsertCity(roadSegment.cityB);

      const existingSegment =
        await this.roadSegmentTypeormEntityRepository.findOne({
          where: [
            { cityAId: cityAEntity.id, cityBId: cityBEntity.id },
            { cityAId: cityBEntity.id, cityBId: cityAEntity.id },
          ],
        });

      if (existingSegment) {
        // Update existing using mapper
        const updatedEntity = RoadSegmentMapper.toTypeorm(
          roadSegment,
          cityAEntity.id,
          cityBEntity.id,
          existingSegment,
        );
        await this.roadSegmentTypeormEntityRepository.save(updatedEntity);
      } else {
        // Create new using mapper
        const newEntityData = RoadSegmentMapper.toTypeormForCreation(
          roadSegment,
          cityAEntity.id,
          cityBEntity.id,
        );
        const newEntity =
          this.roadSegmentTypeormEntityRepository.create(newEntityData);
        await this.roadSegmentTypeormEntityRepository.save(newEntity);
      }

      return ok(undefined);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      return fail(PersistenceError.saveFailed('RoadSegment', reason));
    }
  }

  async findCityByName(
    name: CityName,
  ): Promise<Result<City, CityNotFoundError>> {
    const cityEntity = await this.cityTypeormEntityRepository.findOne({
      where: { name: name.value },
    });

    if (!cityEntity) {
      return fail(CityNotFoundError.forCityName(name));
    }

    return ok(CityMapper.toDomain(cityEntity));
  }

  async findAllCities(): Promise<City[]> {
    const cityEntities = await this.cityTypeormEntityRepository.find();
    return cityEntities.map(CityMapper.toDomain);
  }

  private async upsertCity(city: City): Promise<CityTypeormEntity> {
    // Find by name (case-insensitive match for the same logical city)
    let cityEntity = await this.cityTypeormEntityRepository.findOne({
      where: { name: city.name.value },
    });

    if (!cityEntity) {
      // City doesn't exist, create it
      const newCityData = CityMapper.toTypeormForCreation(city);
      cityEntity = this.cityTypeormEntityRepository.create(newCityData);
      await this.cityTypeormEntityRepository.save(cityEntity);
    }

    return cityEntity;
  }
}
