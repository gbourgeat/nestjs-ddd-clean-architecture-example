import { InvalidRoadSegmentIdError } from '@/domain/errors';
import { RoadSegmentId } from '@/domain/value-objects';

describe('RoadSegmentId', () => {
  it('should throw InvalidRoadSegmentIdError for empty first city name', () => {
    expect(() => RoadSegmentId.fromCityNames('', 'Lyon')).toThrow(
      InvalidRoadSegmentIdError,
    );
  });

  it('should throw InvalidRoadSegmentIdError for empty second city name', () => {
    expect(() => RoadSegmentId.fromCityNames('Paris', '')).toThrow(
      InvalidRoadSegmentIdError,
    );
  });

  it('should throw InvalidRoadSegmentIdError for empty value', () => {
    expect(() => RoadSegmentId.fromValue('')).toThrow(
      InvalidRoadSegmentIdError,
    );
  });

  it('should throw InvalidRoadSegmentIdError for missing separator', () => {
    expect(() => RoadSegmentId.fromValue('paris-lyon')).toThrow(
      InvalidRoadSegmentIdError,
    );
  });

  it('should sort city names alphabetically', () => {
    const id1 = RoadSegmentId.fromCityNames('Paris', 'Lyon');
    const id2 = RoadSegmentId.fromCityNames('Lyon', 'Paris');
    expect(id1.value).toBe(id2.value);
  });

  it('should compare road segment ids', () => {
    const id1 = RoadSegmentId.fromCityNames('Paris', 'Lyon');
    const id2 = RoadSegmentId.fromCityNames('Lyon', 'Paris');
    expect(id1.equals(id2)).toBe(true);
  });

  it('should create from value with separator', () => {
    const id = RoadSegmentId.fromValue('lyon__paris');
    expect(id.value).toBe('lyon__paris');
  });

  it('should convert to string', () => {
    const id = RoadSegmentId.fromCityNames('Paris', 'Lyon');
    expect(id.toString()).toBeTruthy();
    expect(typeof id.toString()).toBe('string');
  });
});
