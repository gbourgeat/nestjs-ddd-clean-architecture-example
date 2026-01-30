import { Injectable } from '@nestjs/common';
import { RoadSegmentRepository } from '@/domain/repositories';
import { RoadSegmentId, Speed } from '@/domain/value-objects';
import { UpdateRoadSegmentSpeedInput } from './update-road-segment-speed.input';
import { UpdateRoadSegmentSpeedOutput } from './update-road-segment-speed.output';

@Injectable()
export class UpdateRoadSegmentSpeedUseCase {
  constructor(private readonly roadSegmentRepository: RoadSegmentRepository) {}

  async execute(
    input: UpdateRoadSegmentSpeedInput,
  ): Promise<UpdateRoadSegmentSpeedOutput> {
    const roadSegmentId = RoadSegmentId.fromCityNames(input.cityA, input.cityB);

    const roadSegment =
      await this.roadSegmentRepository.findById(roadSegmentId);

    const newSpeedLimit = Speed.fromKmPerHour(input.newSpeedLimit);

    roadSegment.updateSpeedLimit(newSpeedLimit);

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
