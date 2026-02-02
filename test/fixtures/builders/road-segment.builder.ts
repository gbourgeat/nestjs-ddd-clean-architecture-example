import { City, RoadSegment } from '@/domain/entities';
import { Distance, RoadSegmentId, Speed } from '@/domain/value-objects';

export class RoadSegmentBuilder {
  private id: RoadSegmentId = RoadSegmentId.generate();
  private cityA?: City;
  private cityB?: City;
  private distance: Distance = Distance.fromKilometersOrThrow(100);
  private speedLimit: Speed = Speed.fromKmPerHourOrThrow(110);

  static aRoadSegment(): RoadSegmentBuilder {
    return new RoadSegmentBuilder();
  }

  withId(id: string | RoadSegmentId): this {
    this.id = typeof id === 'string' ? RoadSegmentId.fromValueOrThrow(id) : id;
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
    this.distance = Distance.fromKilometersOrThrow(kilometers);
    return this;
  }

  withSpeedLimit(kmPerHour: number): this {
    this.speedLimit = Speed.fromKmPerHourOrThrow(kmPerHour);
    return this;
  }

  build(): RoadSegment {
    if (!this.cityA || !this.cityB) {
      throw new Error('RoadSegmentBuilder: both cities must be set');
    }

    return RoadSegment.create(
      this.id,
      [this.cityA, this.cityB],
      this.distance,
      this.speedLimit,
    );
  }
}
