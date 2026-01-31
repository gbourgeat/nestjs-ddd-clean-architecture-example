import { Injectable } from '@nestjs/common';
import { RoadSegmentRepository, CityRepository } from '@/domain/repositories';
import { RoadSegment } from '@/domain/entities';
import {
  CityName,
  Distance,
  RoadSegmentId,
  Speed,
} from '@/domain/value-objects';
import { CreateRoadSegmentInput } from './create-road-segment.input';
import { CreateRoadSegmentOutput } from './create-road-segment.output';

@Injectable()
export class CreateRoadSegmentUseCase {
  constructor(
    private readonly roadSegmentRepository: RoadSegmentRepository,
    private readonly cityRepository: CityRepository,
  ) {}

  async execute(
    input: CreateRoadSegmentInput,
  ): Promise<CreateRoadSegmentOutput> {
    const cityAName = CityName.create(input.cityA);
    const cityBName = CityName.create(input.cityB);

    const cityA = await this.cityRepository.findByName(cityAName);
    const cityB = await this.cityRepository.findByName(cityBName);

    const distance = Distance.fromKilometers(input.distance);
    const speedLimit = Speed.fromKmPerHour(input.speedLimit);

    const roadSegmentId = RoadSegmentId.fromCityNames(
      cityAName.value,
      cityBName.value,
    );

    const roadSegment = RoadSegment.create(
      roadSegmentId,
      [cityA, cityB],
      distance,
      speedLimit,
    );

    await this.roadSegmentRepository.save(roadSegment);

    return {
      roadSegmentId: roadSegment.id.value,
      cityA: roadSegment.cityA.name.value,
      cityB: roadSegment.cityB.name.value,
      distance: roadSegment.distance.kilometers,
      speedLimit: roadSegment.speedLimit.kmPerHour,
    };
  }
}
