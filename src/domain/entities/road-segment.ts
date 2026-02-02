import { Result, fail, ok } from '@/domain/common';
import {
  InvalidRoadSegmentError,
  RoadSegmentCreationError,
  ValidationErrorDetail,
} from '@/domain/errors';
import {
  CityId,
  CityName,
  Distance,
  Duration,
  RoadSegmentId,
  Speed,
} from '@/domain/value-objects';
import { City } from './city';

export class RoadSegment {
  private constructor(
    public readonly id: RoadSegmentId,
    public readonly cities: [City, City],
    public readonly distance: Distance,
    private _speedLimit: Speed,
  ) {}

  /**
   * Creates a RoadSegment from primitive values.
   * Validates all inputs and aggregates errors.
   */
  static createFromPrimitives(
    cityAName: string,
    cityBName: string,
    distanceKm: number,
    speedLimitKmh: number,
  ): Result<RoadSegment, RoadSegmentCreationError> {
    // Validate all inputs
    const cityANameResult = CityName.create(cityAName);
    const cityBNameResult = CityName.create(cityBName);
    const distanceResult = Distance.fromKilometers(distanceKm);
    const speedResult = Speed.fromKmPerHour(speedLimitKmh);

    // Collect validation errors
    const validationErrors: ValidationErrorDetail[] = [];

    if (!cityANameResult.success) {
      validationErrors.push({
        field: 'cityAName',
        code: cityANameResult.error.code,
        message: cityANameResult.error.message,
      });
    }

    if (!cityBNameResult.success) {
      validationErrors.push({
        field: 'cityBName',
        code: cityBNameResult.error.code,
        message: cityBNameResult.error.message,
      });
    }

    if (!distanceResult.success) {
      validationErrors.push({
        field: 'distance',
        code: distanceResult.error.code,
        message: distanceResult.error.message,
      });
    }

    if (!speedResult.success) {
      validationErrors.push({
        field: 'speedLimit',
        code: speedResult.error.code,
        message: speedResult.error.message,
      });
    }

    // Return early if any validation failed
    if (
      !cityANameResult.success ||
      !cityBNameResult.success ||
      !distanceResult.success ||
      !speedResult.success
    ) {
      return fail(
        RoadSegmentCreationError.fromValidationErrors(validationErrors),
      );
    }

    // All value objects are valid - TypeScript now knows these are Success types
    const cityANameVO = cityANameResult.value;
    const cityBNameVO = cityBNameResult.value;
    const distance = distanceResult.value;
    const speedLimit = speedResult.value;

    // Derive CityIds from CityNames
    const cityIdA = CityId.fromName(cityANameVO);
    const cityIdB = CityId.fromName(cityBNameVO);

    // Create RoadSegmentId (validates distinct cities)
    const roadSegmentIdResult = RoadSegmentId.create(cityIdA, cityIdB);
    if (!roadSegmentIdResult.success) {
      validationErrors.push({
        field: 'cities',
        code: roadSegmentIdResult.error.code,
        message: roadSegmentIdResult.error.message,
      });
      return fail(
        RoadSegmentCreationError.fromValidationErrors(validationErrors),
      );
    }

    const roadSegmentId = roadSegmentIdResult.value;

    // Create City entities
    const cityA = City.create(cityIdA, cityANameVO);
    const cityB = City.create(cityIdB, cityBNameVO);

    // Create the RoadSegment (cities will be sorted internally)
    const sortedCities = this.sortCitiesByNames([cityA, cityB]);

    return ok(
      new RoadSegment(roadSegmentId, sortedCities, distance, speedLimit),
    );
  }

  /**
   * Creates a RoadSegment from pre-validated value objects.
   * @deprecated Use createFromPrimitives for new code.
   */
  static create(
    id: RoadSegmentId,
    cities: [City, City],
    distance: Distance,
    speed: Speed,
  ): RoadSegment {
    this.ensureCitiesAreDistinct(cities);

    const sortedCities = this.sortCitiesByNames(cities);

    return new RoadSegment(id, sortedCities, distance, speed);
  }

  static reconstitute(
    id: RoadSegmentId,
    cities: [City, City],
    distance: Distance,
    speed: Speed,
  ): RoadSegment {
    this.ensureCitiesAreDistinct(cities);

    const sortedCities = this.sortCitiesByNames(cities);

    return new RoadSegment(id, sortedCities, distance, speed);
  }

  private static sortCitiesByNames(cities: [City, City]) {
    const sortedCities: [City, City] =
      cities[0].name.compareTo(cities[1].name) <= 0
        ? [cities[0], cities[1]]
        : [cities[1], cities[0]];

    return sortedCities;
  }

  private static ensureCitiesAreDistinct(cities: [City, City]) {
    if (cities[0].id.equals(cities[1].id)) {
      throw InvalidRoadSegmentError.sameCityConnection();
    }
  }

  get speedLimit(): Speed {
    return this._speedLimit;
  }

  get cityA(): City {
    return this.cities[0];
  }

  get cityB(): City {
    return this.cities[1];
  }

  updateSpeedLimit(newSpeedLimit: Speed): void {
    this._speedLimit = newSpeedLimit;
  }

  get estimatedDuration(): Duration {
    // Segments with speedLimit = 0 should not be used in pathfinding
    if (this.speedLimit.kmPerHour === 0) {
      throw new Error(
        'Cannot calculate duration for a segment with zero speed limit',
      );
    }

    return Duration.fromDistanceAndSpeedOrThrow(
      this.distance.kilometers,
      this.speedLimit.kmPerHour,
    );
  }
}
