import { City, RoadSegment } from '@/domain/entities';
import { RoadSegmentNotFoundError } from '@/domain/errors';
import { RoadSegmentRepository } from '@/domain/repositories';
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
} from '@/infrastructure/database';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

    const citiesIndexById = new Map<string, { id: string; name: string }>();
    cities.forEach((city) => {
      citiesIndexById.set(city.id, { id: city.id, name: city.name });
    });

    return roadSegments.map((route) => {
      const cityA = citiesIndexById.get(route.cityAId) || { id: '', name: '' };
      const cityB = citiesIndexById.get(route.cityBId) || { id: '', name: '' };

      return RoadSegment.reconstitute(
        RoadSegmentId.fromCityNames(cityA.name, cityB.name),
        [
          City.reconstitute(
            CityId.fromNormalizedValue(cityA.id),
            CityName.create(cityA.name),
          ),
          City.reconstitute(
            CityId.fromNormalizedValue(cityB.id),
            CityName.create(cityB.name),
          ),
        ],
        Distance.fromKilometers(Number(route.distance)),
        Speed.fromKmPerHour(route.speedLimit),
      );
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
    )!;
    const cityB = cities.find(
      (c) => c.name.toLowerCase() === normalizedCityBName,
    )!;

    // Find road segment connecting these cities
    const roadSegment = await this.roadSegmentTypeormEntityRepository.findOne({
      where: [
        { cityAId: cityA.id, cityBId: cityB.id },
        { cityAId: cityB.id, cityBId: cityA.id },
      ],
    });

    if (!roadSegment) {
      throw RoadSegmentNotFoundError.forRoadSegmentId(id);
    }

    return RoadSegment.reconstitute(
      RoadSegmentId.fromCityNames(cityA.name, cityB.name),
      [
        City.reconstitute(
          CityId.fromNormalizedValue(cityA.id),
          CityName.create(cityA.name),
        ),
        City.reconstitute(
          CityId.fromNormalizedValue(cityB.id),
          CityName.create(cityB.name),
        ),
      ],
      Distance.fromKilometers(Number(roadSegment.distance)),
      Speed.fromKmPerHour(roadSegment.speedLimit),
    );
  }

  async save(roadSegment: RoadSegment): Promise<void> {
    // Find cities by name (since domain IDs are name-based, not UUIDs)
    const cityA = await this.cityTypeormEntityRepository.findOne({
      where: { name: roadSegment.cityA.name.value },
    });
    const cityB = await this.cityTypeormEntityRepository.findOne({
      where: { name: roadSegment.cityB.name.value },
    });

    if (!cityA || !cityB) {
      throw RoadSegmentNotFoundError.forRoadSegmentId(roadSegment.id);
    }

    const existingSegment =
      await this.roadSegmentTypeormEntityRepository.findOne({
        where: [
          { cityAId: cityA.id, cityBId: cityB.id },
          { cityAId: cityB.id, cityBId: cityA.id },
        ],
      });

    if (existingSegment) {
      // Update existing
      existingSegment.speedLimit = roadSegment.speedLimit.kmPerHour;
      existingSegment.distance = roadSegment.distance.kilometers;
      await this.roadSegmentTypeormEntityRepository.save(existingSegment);
    } else {
      // Create new - use the database UUIDs, not domain IDs
      const ormEntity = this.roadSegmentTypeormEntityRepository.create({
        cityAId: cityA.id,
        cityBId: cityB.id,
        distance: roadSegment.distance.kilometers,
        speedLimit: roadSegment.speedLimit.kmPerHour,
      });

      await this.roadSegmentTypeormEntityRepository.save(ormEntity);
    }
  }
}
