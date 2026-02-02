import { InvalidCityNameError } from '@/domain/errors';
import { CityName } from '@/domain/value-objects';

describe('CityName', () => {
  it('should throw InvalidCityNameError for too short name', () => {
    expect(() => CityName.fromString('')).toThrow(
      InvalidCityNameError as unknown as typeof Error,
    );
  });

  it('should throw InvalidCityNameError for whitespace-only name', () => {
    expect(() => CityName.fromString('   ')).toThrow(
      InvalidCityNameError as unknown as typeof Error,
    );
  });

  it('should throw InvalidCityNameError for name starting with parenthesis', () => {
    expect(() => CityName.fromString('(Paris)')).toThrow(
      InvalidCityNameError as unknown as typeof Error,
    );
  });

  it('should throw InvalidCityNameError for too long name', () => {
    const longName = 'A'.repeat(101);
    expect(() => CityName.fromString(longName)).toThrow(
      InvalidCityNameError as unknown as typeof Error,
    );
  });

  it('should throw InvalidCityNameError for invalid format (starting with hyphen)', () => {
    expect(() => CityName.fromString('-Paris')).toThrow(
      InvalidCityNameError as unknown as typeof Error,
    );
  });

  it('should throw InvalidCityNameError for mismatched parentheses', () => {
    expect(() => CityName.fromString('Paris (France')).toThrow(
      InvalidCityNameError as unknown as typeof Error,
    );
  });

  it('should throw InvalidCityNameError for multiple consecutive spaces', () => {
    expect(() => CityName.fromString('Saint  Denis')).toThrow(
      InvalidCityNameError as unknown as typeof Error,
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
    const name1 = CityName.fromString('Paris');
    const name2 = CityName.fromString('Lyon');
    expect(name1.compareTo(name2)).toBeGreaterThan(0);
  });

  it('should normalize city names', () => {
    const name = CityName.fromString('Saint-Étienne');
    expect(name.toNormalized()).toBe('saintetienne');
  });

  it('should convert to string', () => {
    const name = CityName.fromString('Paris');
    expect(name.toString()).toBe('Paris');
  });
});
