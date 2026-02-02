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
  RoadSegmentTypeormEntity,
} from '@/infrastructure/database';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityTypeormMapper, RoadSegmentTypeormMapper } from '../mappers';

@Injectable()
export class RoadSegmentTypeormRepository implements RoadSegmentRepository {
  constructor(
    @InjectRepository(RoadSegmentTypeormEntity)
    private readonly roadSegmentTypeormEntityRepository: Repository<RoadSegmentTypeormEntity>,
    @InjectRepository(CityTypeormEntity)
    private readonly cityTypeormEntityRepository: Repository<CityTypeormEntity>,
  ) {}

  async findAll(): Promise<Result<RoadSegment[], PersistenceError>> {
    try {
      const roadSegments = await this.roadSegmentTypeormEntityRepository.find();
      const cities = await this.cityTypeormEntityRepository.find();

      const citiesIndexById = new Map<string, CityTypeormEntity>();
      cities.forEach((city) => {
        citiesIndexById.set(city.id, city);
      });

      const result: RoadSegment[] = [];
      for (const roadSegmentEntity of roadSegments) {
        const cityA = citiesIndexById.get(roadSegmentEntity.cityAId);
        const cityB = citiesIndexById.get(roadSegmentEntity.cityBId);

        if (!cityA || !cityB) {
          return fail(
            PersistenceError.loadFailed(
              'RoadSegment',
              `Database integrity error: cities not found for road segment ${roadSegmentEntity.id}`,
            ),
          );
        }

        result.push(
          RoadSegmentTypeormMapper.toDomain({
            entity: roadSegmentEntity,
            cityA,
            cityB,
          }),
        );
      }

      return ok(result);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      return fail(PersistenceError.loadFailed('RoadSegment', reason));
    }
  }

  async findById(
    id: RoadSegmentId,
  ): Promise<Result<RoadSegment, RoadSegmentNotFoundError>> {
    // Direct lookup by UUID
    const roadSegmentEntity =
      await this.roadSegmentTypeormEntityRepository.findOne({
        where: { id: id.value },
      });

    if (!roadSegmentEntity) {
      return fail(RoadSegmentNotFoundError.forRoadSegmentId(id));
    }

    // Fetch the cities
    const cityA = await this.cityTypeormEntityRepository.findOne({
      where: { id: roadSegmentEntity.cityAId },
    });
    const cityB = await this.cityTypeormEntityRepository.findOne({
      where: { id: roadSegmentEntity.cityBId },
    });

    if (!cityA || !cityB) {
      return fail(RoadSegmentNotFoundError.forRoadSegmentId(id));
    }

    return ok(
      RoadSegmentTypeormMapper.toDomain({
        entity: roadSegmentEntity,
        cityA,
        cityB,
      }),
    );
  }

  async save(
    roadSegment: RoadSegment,
  ): Promise<Result<void, PersistenceError>> {
    try {
      // Upsert cities first (handle city persistence within the aggregate)
      const cityAEntity = await this.upsertCity(roadSegment.cityA);
      const cityBEntity = await this.upsertCity(roadSegment.cityB);

      const entity = RoadSegmentTypeormMapper.fromDomain({
        domain: roadSegment,
        cityADbId: cityAEntity.id,
        cityBDbId: cityBEntity.id,
      });
      await this.roadSegmentTypeormEntityRepository.save(entity);

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

    return ok(CityTypeormMapper.toDomain(cityEntity));
  }

  async findAllCities(): Promise<City[]> {
    const cityEntities = await this.cityTypeormEntityRepository.find();
    return cityEntities.map(CityTypeormMapper.toDomain);
  }

  private async upsertCity(city: City): Promise<CityTypeormEntity> {
    // Find by name (case-insensitive match for the same logical city)
    let cityEntity = await this.cityTypeormEntityRepository.findOne({
      where: { name: city.name.value },
    });

    if (!cityEntity) {
      cityEntity = CityTypeormMapper.fromDomain(city);
      await this.cityTypeormEntityRepository.save(cityEntity);
    }

    return cityEntity;
  }
}
