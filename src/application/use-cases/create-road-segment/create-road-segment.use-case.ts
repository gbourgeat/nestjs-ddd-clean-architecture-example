import { type Result, fail, ok } from '@/domain/common';
import { RoadSegment } from '@/domain/entities';
import {
  CityNotFoundError,
  InvalidCityNameError,
  PersistenceError,
  RoadSegmentCreationError,
} from '@/domain/errors';
import { RoadSegmentRepository } from '@/domain/repositories';
import { CityName } from '@/domain/value-objects';
import { Injectable } from '@nestjs/common';
import { CreateRoadSegmentInput } from './create-road-segment.input';
import { CreateRoadSegmentOutput } from './create-road-segment.output';

export type CreateRoadSegmentError =
  | CityNotFoundError
  | InvalidCityNameError
  | RoadSegmentCreationError
  | PersistenceError;

@Injectable()
export class CreateRoadSegmentUseCase {
  constructor(private readonly roadSegmentRepository: RoadSegmentRepository) {}

  async execute(
    input: CreateRoadSegmentInput,
  ): Promise<Result<CreateRoadSegmentOutput, CreateRoadSegmentError>> {
    // Validate city names
    const cityANameResult = CityName.create(input.cityA);
    if (!cityANameResult.success) {
      return fail(cityANameResult.error);
    }

    const cityBNameResult = CityName.create(input.cityB);
    if (!cityBNameResult.success) {
      return fail(cityBNameResult.error);
    }

    // Check if cities exist (via road segments that contain them)
    const cityAResult = await this.roadSegmentRepository.findCityByName(
      cityANameResult.value,
    );
    if (!cityAResult.success) {
      return fail(cityAResult.error);
    }

    const cityBResult = await this.roadSegmentRepository.findCityByName(
      cityBNameResult.value,
    );
    if (!cityBResult.success) {
      return fail(cityBResult.error);
    }

    // Create road segment using the new factory method
    const roadSegmentResult = RoadSegment.createFromPrimitives(
      input.cityA,
      input.cityB,
      input.distance,
      input.speedLimit,
    );

    if (!roadSegmentResult.success) {
      return fail(roadSegmentResult.error);
    }

    const roadSegment = roadSegmentResult.value;

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
