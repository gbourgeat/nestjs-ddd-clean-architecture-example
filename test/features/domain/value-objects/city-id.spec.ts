import { InvalidCityIdError } from '@/domain/errors';
import { CityId, CityName } from '@/domain/value-objects';

describe('CityId', () => {
  it('should throw InvalidCityIdError for empty city name when creating from city name', () => {
    expect(() => CityId.fromCityNameOrThrow('')).toThrow(
      InvalidCityIdError as unknown as typeof Error,
    );
  });

  it('should throw InvalidCityIdError for empty normalized value', () => {
    expect(() => CityId.fromNormalizedValueOrThrow('')).toThrow(
      InvalidCityIdError as unknown as typeof Error,
    );
  });

  it('should return failure Result for empty city name', () => {
    const result = CityId.fromCityName('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(InvalidCityIdError);
      expect(result.error.code).toBe('INVALID_CITY_ID');
    }
  });

  it('should return success Result for valid city name', () => {
    const result = CityId.fromCityName('Paris');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.value).toBe('paris');
    }
  });

  it('should normalize city names correctly', () => {
    const id1 = CityId.fromCityNameOrThrow('Paris');
    const id2 = CityId.fromCityNameOrThrow('PARIS');
    expect(id1.value).toBe(id2.value);
  });

  it('should compare city ids for equality', () => {
    const id1 = CityId.fromCityNameOrThrow('Paris');
    const id2 = CityId.fromCityNameOrThrow('Paris');
    expect(id1.equals(id2)).toBe(true);
  });

  it('should get normalized name', () => {
    const id = CityId.fromCityNameOrThrow('Paris');
    expect(id.normalizedName).toBe('paris');
  });

  it('should convert to string', () => {
    const id = CityId.fromCityNameOrThrow('Paris');
    expect(id.toString()).toBe('paris');
  });

  it('should create from CityName value object', () => {
    const name = CityName.createOrThrow('Paris');
    const id = CityId.fromName(name);
    expect(id.value).toBe('paris');
  });
});
