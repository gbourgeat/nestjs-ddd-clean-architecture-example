import { RoadSegment } from '@/domain/entities';
import { RoadSegmentNotFoundError } from '@/domain/errors';
import { RoadSegmentRepository } from '@/domain/repositories';
import { RoadSegmentId } from '@/domain/value-objects';
import {
  CityTypeormEntity,
  RoadSegmentTypeormEntity,
} from '@/infrastructure/database';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoadSegmentMapper } from '../mappers';

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
        throw new Error(
          `Cities not found for road segment ${roadSegmentEntity.id}`,
        );
      }

      return RoadSegmentMapper.toDomain(roadSegmentEntity, cityA, cityB);
    });
  }

  async findById(id: RoadSegmentId): Promise<RoadSegment> {
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
      throw RoadSegmentNotFoundError.forRoadSegmentId(id);
    }

    const cityA = cities.find(
      (c) => c.name.toLowerCase() === normalizedCityAName,
    );
    const cityB = cities.find(
      (c) => c.name.toLowerCase() === normalizedCityBName,
    );

    if (!cityA || !cityB) {
      throw RoadSegmentNotFoundError.forRoadSegmentId(id);
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
      throw RoadSegmentNotFoundError.forRoadSegmentId(id);
    }

    return RoadSegmentMapper.toDomain(roadSegmentEntity, cityA, cityB);
  }

  async save(roadSegment: RoadSegment): Promise<void> {
    // Find cities by name (since domain IDs are name-based, not UUIDs)
    const cityAEntity = await this.cityTypeormEntityRepository.findOne({
      where: { name: roadSegment.cityA.name.value },
    });
    const cityBEntity = await this.cityTypeormEntityRepository.findOne({
      where: { name: roadSegment.cityB.name.value },
    });

    if (!cityAEntity || !cityBEntity) {
      throw RoadSegmentNotFoundError.forRoadSegmentId(roadSegment.id);
    }

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
  }
}
