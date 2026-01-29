import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoadSegmentRepository } from '@/domain/repositories';
import {
  CityTypeormEntity,
  RoadSegmentTypeormEntity,
} from '@/infrastructure/database';
import { City, RoadSegment } from '@/domain/entities';
import {
  CityId,
  CityName,
  Distance,
  RoadSegmentId,
  Speed,
} from '@/domain/value-objects';
import { RoadSegmentNotFoundError } from '@/domain/errors';

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

      return RoadSegment.create(
        RoadSegmentId.fromCityNames(cityA.name, cityB.name),
        [
          City.create(
            CityId.fromNormalizedValue(cityA.id),
            CityName.create(cityA.name),
          ),
          City.create(
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
    // Parse the id to get city names (format: "cityA__cityB")
    const [cityAName, cityBName] = id.value.split('__');

    // Find cities
    const cityA = await this.cityTypeormEntityRepository.findOne({
      where: { name: cityAName },
    });
    const cityB = await this.cityTypeormEntityRepository.findOne({
      where: { name: cityBName },
    });

    if (!cityA || !cityB) {
      throw RoadSegmentNotFoundError.forRoadSegmentId(id);
    }

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

    return RoadSegment.create(
      RoadSegmentId.fromCityNames(cityA.name, cityB.name),
      [
        City.create(
          CityId.fromNormalizedValue(cityA.id),
          CityName.create(cityA.name),
        ),
        City.create(
          CityId.fromNormalizedValue(cityB.id),
          CityName.create(cityB.name),
        ),
      ],
      Distance.fromKilometers(Number(roadSegment.distance)),
      Speed.fromKmPerHour(roadSegment.speedLimit),
    );
  }

  async save(roadSegment: RoadSegment): Promise<void> {
    // Find existing road segment to update
    const [cityAName, cityBName] = roadSegment.id.value.split('__');

    const cityA = await this.cityTypeormEntityRepository.findOne({
      where: { name: cityAName },
    });
    const cityB = await this.cityTypeormEntityRepository.findOne({
      where: { name: cityBName },
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
      // Create new
      const ormEntity = this.roadSegmentTypeormEntityRepository.create({
        cityAId: roadSegment.cityA.id.value,
        cityBId: roadSegment.cityB.id.value,
        distance: roadSegment.distance.kilometers,
        speedLimit: roadSegment.speedLimit.kmPerHour,
      });

      await this.roadSegmentTypeormEntityRepository.save(ormEntity);
    }
  }
}
