import { RoadSegmentRepository } from '@/domain/repositories';
import { RoadSegmentId, Speed } from '@/domain/value-objects';
import { Injectable } from '@nestjs/common';
import { UpdateRoadSegmentSpeedInput } from './update-road-segment-speed.input';
import { UpdateRoadSegmentSpeedOutput } from './update-road-segment-speed.output';

@Injectable()
export class UpdateRoadSegmentSpeedUseCase {
  constructor(private readonly roadSegmentRepository: RoadSegmentRepository) {}

  async execute(
    input: UpdateRoadSegmentSpeedInput,
  ): Promise<UpdateRoadSegmentSpeedOutput> {
    const roadSegmentId = RoadSegmentId.fromCityNamesOrThrow(
      input.cityA,
      input.cityB,
    );

    const roadSegmentResult =
      await this.roadSegmentRepository.findById(roadSegmentId);

    if (!roadSegmentResult.success) {
      throw roadSegmentResult.error;
    }

    const roadSegment = roadSegmentResult.value;

    const newSpeedLimit = Speed.fromKmPerHourOrThrow(input.newSpeedLimit);

    roadSegment.updateSpeedLimit(newSpeedLimit);

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
