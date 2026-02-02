import { type Result, fail, ok } from '@/domain/common';
import {
  InvalidRoadSegmentIdError,
  InvalidSpeedError,
  PersistenceError,
  RoadSegmentNotFoundError,
} from '@/domain/errors';
import { RoadSegmentRepository } from '@/domain/repositories';
import { RoadSegmentId, Speed } from '@/domain/value-objects';
import { Injectable } from '@nestjs/common';
import { UpdateRoadSegmentSpeedInput } from './update-road-segment-speed.input';
import { UpdateRoadSegmentSpeedOutput } from './update-road-segment-speed.output';

export type UpdateRoadSegmentSpeedError =
  | RoadSegmentNotFoundError
  | InvalidSpeedError
  | InvalidRoadSegmentIdError
  | PersistenceError;

@Injectable()
export class UpdateRoadSegmentSpeedUseCase {
  constructor(private readonly roadSegmentRepository: RoadSegmentRepository) {}

  async execute(
    input: UpdateRoadSegmentSpeedInput,
  ): Promise<
    Result<UpdateRoadSegmentSpeedOutput, UpdateRoadSegmentSpeedError>
  > {
    const roadSegmentIdResult = RoadSegmentId.fromCityNames(
      input.cityA,
      input.cityB,
    );

    if (!roadSegmentIdResult.success) {
      return fail(roadSegmentIdResult.error);
    }

    const roadSegmentResult = await this.roadSegmentRepository.findById(
      roadSegmentIdResult.value,
    );

    if (!roadSegmentResult.success) {
      return fail(roadSegmentResult.error);
    }

    const roadSegment = roadSegmentResult.value;

    const newSpeedLimitResult = Speed.fromKmPerHour(input.newSpeedLimit);

    if (!newSpeedLimitResult.success) {
      return fail(newSpeedLimitResult.error);
    }

    roadSegment.updateSpeedLimit(newSpeedLimitResult.value);

    const saveResult = await this.roadSegmentRepository.save(roadSegment);

    if (!saveResult.success) {
      return fail(saveResult.error);
    }

    return ok({
      roadSegmentId: roadSegment.id.value,
      cityA: roadSegment.cityA.name.value,
      cityB: roadSegment.cityB.name.value,
      distance: roadSegment.distance.kilometers,
      speedLimit: roadSegment.speedLimit.kmPerHour,
    });
  }
}
