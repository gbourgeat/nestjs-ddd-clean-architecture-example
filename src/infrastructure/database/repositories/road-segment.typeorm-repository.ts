import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoadSegmentRepository } from '../../../domain/repositories/road-segment.repository';
import { RoadSegment } from '../../../domain/entities/road-segment';
import { RoadSegmentId } from '../../../domain/value-objects/road-segment-id';
import { City } from '../../../domain/entities/city';
import { CityId } from '../../../domain/value-objects/city-id';
import { CityName } from '../../../domain/value-objects/city-name';
import { Distance } from '../../../domain/value-objects/distance';
import { Speed } from '../../../domain/value-objects/speed';
import { RoadSegmentTypeormEntity } from '../entities/route.typeorm-entity';
import { CityTypeormEntity } from '../entities/city.typeorm-entity';

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

    const cityMap = new Map<string, { id: string; name: string }>();
    cities.forEach((city) => {
      cityMap.set(city.id, { id: city.id, name: city.name });
    });

    return roadSegments.map((route) => {
      const cityA = cityMap.get(route.cityAId) || { id: '', name: '' };
      const cityB = cityMap.get(route.cityBId) || { id: '', name: '' };

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
        Speed.fromKmPerHour(route.speed),
      );
    });
  }

  async save(roadSegment: RoadSegment): Promise<void> {
    const ormEntity = this.roadSegmentTypeormEntityRepository.create({
      cityAId: roadSegment.cityA.id.value,
      cityBId: roadSegment.cityB.id.value,
      distance: roadSegment.distance.kilometers,
      speed: roadSegment.speedLimit.kmPerHour,
    });

    await this.roadSegmentTypeormEntityRepository.save(ormEntity);
  }
}
