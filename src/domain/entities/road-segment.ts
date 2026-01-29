import { City } from './city';
import { RoadSegmentId } from '../value-objects/road-segment-id';
import { Distance } from '../value-objects/distance';
import { Speed } from '../value-objects/speed';
import { Duration } from '../value-objects/duration';

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

    const alphaNameSortedCities = this.sortByNames(cities);

    return new RoadSegment(id, alphaNameSortedCities, distance, speed);
  }

  private static sortByNames(cities: [City, City]) {
    const sortedCities: [City, City] =
      cities[0].name.compareTo(cities[1].name) <= 0
        ? [cities[0], cities[1]]
        : [cities[1], cities[0]];

    return sortedCities;
  }

  private static ensureCitiesAreDistinct(cities: [City, City]) {
    if (cities[0].id.equals(cities[1].id)) {
      throw new Error('Road segments must not connect two cities in a row');
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

  updateSpeed(newSpeed: Speed): void {
    this._speedLimit = newSpeed;
  }

  get estimatedDuration(): Duration {
    return Duration.fromDistanceAndSpeed(
      this.distance.kilometers,
      this.speedLimit.kmPerHour,
    );
  }
}
