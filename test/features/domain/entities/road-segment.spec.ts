import { RoadSegment, City } from '@/domain/entities';
import {
  RoadSegmentId,
  Distance,
  Speed,
  CityName,
  CityId,
} from '@/domain/value-objects';
import { InvalidRoadSegmentError } from '@/domain/errors';
import { CityBuilder } from '@test/fixtures';

describe('RoadSegment', () => {
  let parisCity: City;
  let lyonCity: City;

  beforeEach(() => {
    parisCity = CityBuilder.aCity()
      .withId(CityId.fromCityName('Paris'))
      .withName(CityName.create('Paris'))
      .build();

    lyonCity = CityBuilder.aCity()
      .withId(CityId.fromCityName('Lyon'))
      .withName(CityName.create('Lyon'))
      .build();
  });

  it('should throw InvalidRoadSegmentError for same city connection', () => {
    expect(() =>
      RoadSegment.create(
        RoadSegmentId.fromCityNames('Paris', 'Paris'),
        [parisCity, parisCity],
        Distance.fromKilometers(100),
        Speed.fromKmPerHour(130),
      ),
    ).toThrow(InvalidRoadSegmentError);
  });

  it('should sort cities by name', () => {
    const segment = RoadSegment.create(
      RoadSegmentId.fromCityNames('Paris', 'Lyon'),
      [lyonCity, parisCity], // Reversed order
      Distance.fromKilometers(465),
      Speed.fromKmPerHour(130),
    );

    // Lyon < Paris alphabetically
    expect(segment.cityA.name.value).toBe('Lyon');
    expect(segment.cityB.name.value).toBe('Paris');
  });

  it('should update speed limit', () => {
    const segment = RoadSegment.create(
      RoadSegmentId.fromCityNames('Paris', 'Lyon'),
      [parisCity, lyonCity],
      Distance.fromKilometers(465),
      Speed.fromKmPerHour(130),
    );

    const newSpeed = Speed.fromKmPerHour(110);
    segment.updateSpeedLimit(newSpeed);
    expect(segment.speedLimit.kmPerHour).toBe(110);
  });

  it('should get cities via cityA and cityB getters', () => {
    const segment = RoadSegment.create(
      RoadSegmentId.fromCityNames('Paris', 'Lyon'),
      [parisCity, lyonCity],
      Distance.fromKilometers(465),
      Speed.fromKmPerHour(130),
    );

    expect(segment.cityA).toBeDefined();
    expect(segment.cityB).toBeDefined();
  });

  it('should calculate estimated duration', () => {
    const segment = RoadSegment.create(
      RoadSegmentId.fromCityNames('Paris', 'Lyon'),
      [parisCity, lyonCity],
      Distance.fromKilometers(465),
      Speed.fromKmPerHour(130),
    );

    const estimatedDuration = segment.estimatedDuration;
    expect(estimatedDuration).toBeDefined();
    expect(estimatedDuration.hours).toBeGreaterThan(0);
  });
});
