import { InvalidRoadSegmentIdError } from '@/domain/errors';
import { CityId, RoadSegmentId } from '@/domain/value-objects';

describe('RoadSegmentId', () => {
  it('should throw InvalidRoadSegmentIdError for empty first city name', () => {
    expect(() => RoadSegmentId.fromCityNamesOrThrow('', 'Lyon')).toThrow(
      InvalidRoadSegmentIdError,
    );
  });

  it('should throw InvalidRoadSegmentIdError for empty second city name', () => {
    expect(() => RoadSegmentId.fromCityNamesOrThrow('Paris', '')).toThrow(
      InvalidRoadSegmentIdError,
    );
  });

  it('should throw InvalidRoadSegmentIdError for empty value', () => {
    expect(() => RoadSegmentId.fromValueOrThrow('')).toThrow(
      InvalidRoadSegmentIdError,
    );
  });

  it('should throw InvalidRoadSegmentIdError for missing separator', () => {
    expect(() => RoadSegmentId.fromValueOrThrow('paris-lyon')).toThrow(
      InvalidRoadSegmentIdError,
    );
  });

  it('should return failure Result for empty first city name', () => {
    const result = RoadSegmentId.fromCityNames('', 'Lyon');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(InvalidRoadSegmentIdError);
      expect(result.error.code).toBe('INVALID_ROAD_SEGMENT_ID');
    }
  });

  it('should return success Result for valid city names', () => {
    const result = RoadSegmentId.fromCityNames('Paris', 'Lyon');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.value).toBe('lyon__paris');
    }
  });

  it('should sort city names alphabetically', () => {
    const id1 = RoadSegmentId.fromCityNamesOrThrow('Paris', 'Lyon');
    const id2 = RoadSegmentId.fromCityNamesOrThrow('Lyon', 'Paris');
    expect(id1.value).toBe(id2.value);
  });

  it('should compare road segment ids', () => {
    const id1 = RoadSegmentId.fromCityNamesOrThrow('Paris', 'Lyon');
    const id2 = RoadSegmentId.fromCityNamesOrThrow('Lyon', 'Paris');
    expect(id1.equals(id2)).toBe(true);
  });

  it('should create from value with separator', () => {
    const id = RoadSegmentId.fromValueOrThrow('lyon__paris');
    expect(id.value).toBe('lyon__paris');
  });

  it('should convert to string', () => {
    const id = RoadSegmentId.fromCityNamesOrThrow('Paris', 'Lyon');
    expect(id.toString()).toBeTruthy();
    expect(typeof id.toString()).toBe('string');
  });

  it('should expose cityIdA and cityIdB getters', () => {
    const id = RoadSegmentId.fromCityNamesOrThrow('Paris', 'Lyon');
    expect(id.cityIdA).toBeInstanceOf(CityId);
    expect(id.cityIdB).toBeInstanceOf(CityId);
    expect(id.cityIdA.value).toBe('lyon');
    expect(id.cityIdB.value).toBe('paris');
  });

  it('should throw for same city names', () => {
    const cityIdA = CityId.fromCityNameOrThrow('Paris');
    const cityIdB = CityId.fromCityNameOrThrow('Paris');
    expect(() => RoadSegmentId.createOrThrow(cityIdA, cityIdB)).toThrow(
      InvalidRoadSegmentIdError,
    );
  });

  it('should return failure Result for same city names', () => {
    const cityIdA = CityId.fromCityNameOrThrow('Paris');
    const cityIdB = CityId.fromCityNameOrThrow('Paris');
    const result = RoadSegmentId.create(cityIdA, cityIdB);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(InvalidRoadSegmentIdError);
    }
  });
});
