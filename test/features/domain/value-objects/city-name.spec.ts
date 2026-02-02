import { InvalidCityNameError } from '@/domain/errors';
import { CityName } from '@/domain/value-objects';

describe('CityName', () => {
  it('should throw InvalidCityNameError for too short name', () => {
    expect(() => CityName.createOrThrow('')).toThrow(InvalidCityNameError);
  });

  it('should throw InvalidCityNameError for whitespace-only name', () => {
    expect(() => CityName.createOrThrow('   ')).toThrow(InvalidCityNameError);
  });

  it('should throw InvalidCityNameError for name starting with parenthesis', () => {
    expect(() => CityName.createOrThrow('(Paris)')).toThrow(
      InvalidCityNameError,
    );
  });

  it('should throw InvalidCityNameError for too long name', () => {
    const longName = 'A'.repeat(101);
    expect(() => CityName.createOrThrow(longName)).toThrow(
      InvalidCityNameError,
    );
  });

  it('should throw InvalidCityNameError for invalid format (starting with hyphen)', () => {
    expect(() => CityName.createOrThrow('-Paris')).toThrow(
      InvalidCityNameError,
    );
  });

  it('should throw InvalidCityNameError for mismatched parentheses', () => {
    expect(() => CityName.createOrThrow('Paris (France')).toThrow(
      InvalidCityNameError,
    );
  });

  it('should throw InvalidCityNameError for multiple consecutive spaces', () => {
    expect(() => CityName.createOrThrow('Saint  Denis')).toThrow(
      InvalidCityNameError,
    );
  });

  it('should return failure Result for empty name', () => {
    const result = CityName.create('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(InvalidCityNameError);
      expect(result.error.code).toBe('INVALID_CITY_NAME');
    }
  });

  it('should return success Result for valid name', () => {
    const result = CityName.create('Paris');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.value).toBe('Paris');
    }
  });

  it('should compare city names', () => {
    const name1 = CityName.createOrThrow('Paris');
    const name2 = CityName.createOrThrow('Lyon');
    expect(name1.compareTo(name2)).toBeGreaterThan(0);
  });

  it('should normalize city names', () => {
    const name = CityName.createOrThrow('Saint-Étienne');
    expect(name.toNormalized()).toBe('saintetienne');
  });

  it('should convert to string', () => {
    const name = CityName.createOrThrow('Paris');
    expect(name.toString()).toBe('Paris');
  });
});
