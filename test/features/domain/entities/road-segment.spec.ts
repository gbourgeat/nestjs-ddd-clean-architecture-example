import { City, RoadSegment } from '@/domain/entities';
import {
  InvalidRoadSegmentError,
  InvalidRoadSegmentIdError,
} from '@/domain/errors';
import {
  CityId,
  CityName,
  Distance,
  RoadSegmentId,
  Speed,
} from '@/domain/value-objects';
import { CityBuilder } from '@test/fixtures';

describe('RoadSegment', () => {
  let parisCity: City;
  let lyonCity: City;

  beforeEach(() => {
    parisCity = CityBuilder.aCity()
      .withId(CityId.fromCityNameOrThrow('Paris'))
      .withName(CityName.createOrThrow('Paris'))
      .build();

    lyonCity = CityBuilder.aCity()
      .withId(CityId.fromCityNameOrThrow('Lyon'))
      .withName(CityName.createOrThrow('Lyon'))
      .build();
  });

  it('should throw InvalidRoadSegmentIdError when creating ID with same city', () => {
    expect(() => RoadSegmentId.fromCityNamesOrThrow('Paris', 'Paris')).toThrow(
      InvalidRoadSegmentIdError as unknown as typeof Error,
    );
  });

  it('should throw InvalidRoadSegmentError for same city connection in entity', () => {
    // Create two different City objects with the same ID to test entity validation
    const parisCity2 = CityBuilder.aCity()
      .withId(CityId.fromCityNameOrThrow('Paris'))
      .withName(CityName.createOrThrow('Paris'))
      .build();

    // Use a valid road segment ID but pass the same city twice
    const validId = RoadSegmentId.fromCityNamesOrThrow('Paris', 'Lyon');

    expect(() =>
      RoadSegment.create(
        validId,
        [parisCity, parisCity2], // Same city ID, different instances
        Distance.fromKilometersOrThrow(100),
        Speed.fromKmPerHourOrThrow(130),
      ),
    ).toThrow(InvalidRoadSegmentError as unknown as typeof Error);
  });

  it('should sort cities by name', () => {
    const segment = RoadSegment.create(
      RoadSegmentId.fromCityNamesOrThrow('Paris', 'Lyon'),
      [lyonCity, parisCity], // Reversed order
      Distance.fromKilometersOrThrow(465),
      Speed.fromKmPerHourOrThrow(130),
    );

    // Lyon < Paris alphabetically
    expect(segment.cityA.name.value).toBe('Lyon');
    expect(segment.cityB.name.value).toBe('Paris');
  });

  it('should update speed limit', () => {
    const segment = RoadSegment.create(
      RoadSegmentId.fromCityNamesOrThrow('Paris', 'Lyon'),
      [parisCity, lyonCity],
      Distance.fromKilometersOrThrow(465),
      Speed.fromKmPerHourOrThrow(130),
    );

    const newSpeed = Speed.fromKmPerHourOrThrow(110);
    segment.updateSpeedLimit(newSpeed);
    expect(segment.speedLimit.kmPerHour).toBe(110);
  });

  it('should get cities via cityA and cityB getters', () => {
    const segment = RoadSegment.create(
      RoadSegmentId.fromCityNamesOrThrow('Paris', 'Lyon'),
      [parisCity, lyonCity],
      Distance.fromKilometersOrThrow(465),
      Speed.fromKmPerHourOrThrow(130),
    );

    expect(segment.cityA).toBeDefined();
    expect(segment.cityB).toBeDefined();
  });

  it('should calculate estimated duration', () => {
    const segment = RoadSegment.create(
      RoadSegmentId.fromCityNamesOrThrow('Paris', 'Lyon'),
      [parisCity, lyonCity],
      Distance.fromKilometersOrThrow(465),
      Speed.fromKmPerHourOrThrow(130),
    );

    const estimatedDuration = segment.estimatedDuration;
    expect(estimatedDuration).toBeDefined();
    expect(estimatedDuration.hours).toBeGreaterThan(0);
  });
});
