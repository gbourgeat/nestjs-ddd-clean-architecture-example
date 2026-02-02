import { City, RoadSegment } from '@/domain/entities';
import { InvalidRoadSegmentError } from '@/domain/errors';
import {
  CityName,
  Distance,
  RoadSegmentId,
  Speed,
} from '@/domain/value-objects';
import { CityBuilder } from '@test/fixtures';

describe('RoadSegment', () => {
  const PARIS_UUID = '11111111-1111-1111-1111-111111111111';
  const LYON_UUID = '22222222-2222-2222-2222-222222222222';
  const SEGMENT_UUID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  let parisCity: City;
  let lyonCity: City;

  beforeEach(() => {
    parisCity = CityBuilder.aCity()
      .withId(PARIS_UUID)
      .withName(CityName.createOrThrow('Paris'))
      .build();

    lyonCity = CityBuilder.aCity()
      .withId(LYON_UUID)
      .withName(CityName.createOrThrow('Lyon'))
      .build();
  });

  it('should throw InvalidRoadSegmentError for same city connection in entity', () => {
    // Create two different City objects with the same ID to test entity validation
    const parisCity2 = CityBuilder.aCity()
      .withId(PARIS_UUID)
      .withName(CityName.createOrThrow('Paris'))
      .build();

    const validId = RoadSegmentId.fromValueOrThrow(SEGMENT_UUID);

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
    const segmentId = RoadSegmentId.fromValueOrThrow(SEGMENT_UUID);
    const segment = RoadSegment.create(
      segmentId,
      [parisCity, lyonCity], // Paris before Lyon (wrong alphabetical order)
      Distance.fromKilometersOrThrow(465),
      Speed.fromKmPerHourOrThrow(130),
    );

    // Lyon < Paris alphabetically
    expect(segment.cityA.name.value).toBe('Lyon');
    expect(segment.cityB.name.value).toBe('Paris');
  });

  it('should update speed limit', () => {
    const segmentId = RoadSegmentId.fromValueOrThrow(SEGMENT_UUID);
    const segment = RoadSegment.create(
      segmentId,
      [parisCity, lyonCity],
      Distance.fromKilometersOrThrow(465),
      Speed.fromKmPerHourOrThrow(130),
    );

    const newSpeed = Speed.fromKmPerHourOrThrow(110);
    segment.updateSpeedLimit(newSpeed);
    expect(segment.speedLimit.kmPerHour).toBe(110);
  });

  it('should get cities via cityA and cityB getters', () => {
    const segmentId = RoadSegmentId.fromValueOrThrow(SEGMENT_UUID);
    const segment = RoadSegment.create(
      segmentId,
      [parisCity, lyonCity],
      Distance.fromKilometersOrThrow(465),
      Speed.fromKmPerHourOrThrow(130),
    );

    expect(segment.cityA).toBeDefined();
    expect(segment.cityB).toBeDefined();
  });

  it('should calculate estimated duration', () => {
    const segmentId = RoadSegmentId.fromValueOrThrow(SEGMENT_UUID);
    const segment = RoadSegment.create(
      segmentId,
      [parisCity, lyonCity],
      Distance.fromKilometersOrThrow(465),
      Speed.fromKmPerHourOrThrow(130),
    );

    const estimatedDuration = segment.estimatedDuration;
    expect(estimatedDuration).toBeDefined();
    expect(estimatedDuration.hours).toBeGreaterThan(0);
  });

  it('should use UUID for road segment id', () => {
    const segmentId = RoadSegmentId.fromValueOrThrow(SEGMENT_UUID);
    const segment = RoadSegment.create(
      segmentId,
      [parisCity, lyonCity],
      Distance.fromKilometersOrThrow(465),
      Speed.fromKmPerHourOrThrow(130),
    );

    expect(segment.id.value).toBe(SEGMENT_UUID);
  });
});
