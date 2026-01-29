import { RoadSegment, City } from '@/domain/entities';
import { RoadSegmentId, Distance, Speed } from '@/domain/value-objects';

export class RoadSegmentBuilder {
  private id?: RoadSegmentId;
  private cityA?: City;
  private cityB?: City;
  private distance: Distance = Distance.fromKilometers(100);
  private speedLimit: Speed = Speed.fromKmPerHour(110);

  static aRoadSegment(): RoadSegmentBuilder {
    return new RoadSegmentBuilder();
  }

  withId(id: string | RoadSegmentId): this {
    this.id =
      typeof id === 'string' ? RoadSegmentId.fromNormalizedValue(id) : id;
    return this;
  }

  withCityA(city: City): this {
    this.cityA = city;
    return this;
  }

  withCityB(city: City): this {
    this.cityB = city;
    return this;
  }

  between(cityA: City, cityB: City): this {
    this.cityA = cityA;
    this.cityB = cityB;
    return this;
  }

  withDistance(kilometers: number): this {
    this.distance = Distance.fromKilometers(kilometers);
    return this;
  }

  withSpeedLimit(kmPerHour: number): this {
    this.speedLimit = Speed.fromKmPerHour(kmPerHour);
    return this;
  }

  build(): RoadSegment {
    if (!this.cityA || !this.cityB) {
      throw new Error('RoadSegmentBuilder: both cities must be set');
    }

    const id =
      this.id ||
      RoadSegmentId.fromCityNames(this.cityA.name.value, this.cityB.name.value);

    return RoadSegment.create(
      id,
      [this.cityA, this.cityB],
      this.distance,
      this.speedLimit,
    );
  }
}
