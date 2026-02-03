import { type Result, fail, ok } from '@/domain/common';
import { City, RoadSegment } from '@/domain/entities';
import {
  CityNotFoundError,
  InvalidCityNameError,
  PersistenceError,
  RoadSegmentCreationError,
} from '@/domain/errors';
import { RoadSegmentRepository } from '@/domain/repositories';
import {
  CityName,
  Distance,
  RoadSegmentId,
  Speed,
} from '@/domain/value-objects';
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
    // Retrieve existing cities
    const citiesResult = await this.retrieveCities(input.cityA, input.cityB);
    if (!citiesResult.success) {
      return fail(citiesResult.error);
    }

    const { cityA, cityB } = citiesResult.value;

    // Create road segment from existing cities
    const roadSegmentResult = this.createRoadSegment(
      cityA,
      cityB,
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

  private async retrieveCities(
    cityAName: string,
    cityBName: string,
  ): Promise<
    Result<
      { cityA: City; cityB: City },
      CityNotFoundError | InvalidCityNameError
    >
  > {
    const cityANameResult = CityName.create(cityAName);
    if (!cityANameResult.success) {
      return fail(cityANameResult.error);
    }

    const cityBNameResult = CityName.create(cityBName);
    if (!cityBNameResult.success) {
      return fail(cityBNameResult.error);
    }

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

    return ok({ cityA: cityAResult.value, cityB: cityBResult.value });
  }

  private createRoadSegment(
    cityA: City,
    cityB: City,
    distanceKm: number,
    speedLimitKmh: number,
  ): Result<RoadSegment, RoadSegmentCreationError> {
    const distanceResult = Distance.tryFromKilometers(distanceKm);
    if (!distanceResult.success) {
      return fail(
        RoadSegmentCreationError.fromValidationErrors([
          {
            field: 'distance',
            code: distanceResult.error.code,
            message: distanceResult.error.message,
          },
        ]),
      );
    }

    const speedResult = Speed.tryFromKmPerHour(speedLimitKmh);
    if (!speedResult.success) {
      return fail(
        RoadSegmentCreationError.fromValidationErrors([
          {
            field: 'speedLimit',
            code: speedResult.error.code,
            message: speedResult.error.message,
          },
        ]),
      );
    }

    const roadSegmentId = RoadSegmentId.generate();

    try {
      return ok(
        RoadSegment.create(
          roadSegmentId,
          [cityA, cityB],
          distanceResult.value,
          speedResult.value,
        ),
      );
    } catch (error) {
      // Handle InvalidRoadSegmentError (e.g., same city connection)
      const message =
        error instanceof Error
          ? error.message
          : 'Road segment creation failed due to an unknown error';

      return fail(
        RoadSegmentCreationError.fromValidationErrors([
          {
            field: 'cities',
            code: 'INVALID_ROAD_SEGMENT',
            message,
          },
        ]),
      );
    }
  }
}
