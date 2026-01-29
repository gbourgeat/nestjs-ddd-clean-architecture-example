import { City } from './city';
import {
  Distance,
  Duration,
  RoadSegmentId,
  Speed,
} from '@/domain/value-objects';
import { InvalidRoadSegmentError } from '@/domain/errors';

export class RoadSegment {
  private constructor(
    public readonly id: RoadSegmentId,
    public readonly cities: [City, City],
    public readonly distance: Distance,
    private _speedLimit: Speed,
  ) {}

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
    return Duration.fromDistanceAndSpeed(
      this.distance.kilometers,
      this.speedLimit.kmPerHour,
    );
  }
}
