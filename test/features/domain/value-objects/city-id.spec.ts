import { InvalidCityIdError } from '@/domain/errors';
import { CityId } from '@/domain/value-objects';

describe('CityId', () => {
  it('should throw InvalidCityIdError for empty city name when creating from city name', () => {
    expect(() => CityId.fromCityName('')).toThrow(InvalidCityIdError);
  });

  it('should throw InvalidCityIdError for empty normalized value', () => {
    expect(() => CityId.fromNormalizedValue('')).toThrow(InvalidCityIdError);
  });

  it('should normalize city names correctly', () => {
    const id1 = CityId.fromCityName('Paris');
    const id2 = CityId.fromCityName('PARIS');
    expect(id1.value).toBe(id2.value);
  });

  it('should compare city ids for equality', () => {
    const id1 = CityId.fromCityName('Paris');
    const id2 = CityId.fromCityName('Paris');
    expect(id1.equals(id2)).toBe(true);
  });

  it('should get normalized name', () => {
    const id = CityId.fromCityName('Paris');
    expect(id.normalizedName).toBe('paris');
  });

  it('should convert to string', () => {
    const id = CityId.fromCityName('Paris');
    expect(id.toString()).toBe('paris');
  });
});
