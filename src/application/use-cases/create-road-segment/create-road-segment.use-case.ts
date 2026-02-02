import { RoadSegment } from '@/domain/entities';
import { RoadSegmentRepository } from '@/domain/repositories';
import { CityName } from '@/domain/value-objects';
import { Injectable } from '@nestjs/common';
import { CreateRoadSegmentInput } from './create-road-segment.input';
import { CreateRoadSegmentOutput } from './create-road-segment.output';

@Injectable()
export class CreateRoadSegmentUseCase {
  constructor(private readonly roadSegmentRepository: RoadSegmentRepository) {}

  async execute(
    input: CreateRoadSegmentInput,
  ): Promise<CreateRoadSegmentOutput> {
    // Validate city names exist in the system first
    const cityAName = CityName.createOrThrow(input.cityA);
    const cityBName = CityName.createOrThrow(input.cityB);

    // Check if cities exist (via road segments that contain them)
    const cityAResult =
      await this.roadSegmentRepository.findCityByName(cityAName);
    if (!cityAResult.success) {
      throw cityAResult.error;
    }

    const cityBResult =
      await this.roadSegmentRepository.findCityByName(cityBName);
    if (!cityBResult.success) {
      throw cityBResult.error;
    }

    // Create road segment using the new factory method
    const roadSegmentResult = RoadSegment.createFromPrimitives(
      input.cityA,
      input.cityB,
      input.distance,
      input.speedLimit,
    );

    if (!roadSegmentResult.success) {
      throw roadSegmentResult.error;
    }

    const roadSegment = roadSegmentResult.value;

    const saveResult = await this.roadSegmentRepository.save(roadSegment);

    if (!saveResult.success) {
      throw saveResult.error;
    }

    return {
      roadSegmentId: roadSegment.id.value,
      cityA: roadSegment.cityA.name.value,
      cityB: roadSegment.cityB.name.value,
      distance: roadSegment.distance.kilometers,
      speedLimit: roadSegment.speedLimit.kmPerHour,
    };
  }
}
