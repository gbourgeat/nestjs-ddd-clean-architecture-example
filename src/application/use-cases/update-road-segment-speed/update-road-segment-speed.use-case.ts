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
    // 1. Create road segment ID from city names
    const roadSegmentId = RoadSegmentId.fromCityNames(input.cityA, input.cityB);

    // 2. Find the road segment
    const roadSegment =
      await this.roadSegmentRepository.findById(roadSegmentId);

    // 3. Create new speed value object with validation
    const newSpeedLimit = Speed.fromKmPerHour(input.newSpeedLimit);

    // 4. Update the speed limit
    roadSegment.updateSpeedLimit(newSpeedLimit);

    // 5. Save the updated road segment
    await this.roadSegmentRepository.save(roadSegment);

    // 6. Return the result
    return {
      roadSegmentId: roadSegment.id.value,
      cityA: roadSegment.cityA.name.value,
      cityB: roadSegment.cityB.name.value,
      distance: roadSegment.distance.kilometers,
      speedLimit: roadSegment.speedLimit.kmPerHour,
    };
  }
}
