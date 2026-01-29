import { CityName } from '@/domain/value-objects';
import { InvalidCityNameError } from '@/domain/errors';

describe('CityName', () => {
  it('should throw InvalidCityNameError for too short name', () => {
    expect(() => CityName.create('')).toThrow(InvalidCityNameError);
  });

  it('should throw InvalidCityNameError for whitespace-only name', () => {
    expect(() => CityName.create('   ')).toThrow(InvalidCityNameError);
  });

  it('should throw InvalidCityNameError for name starting with parenthesis', () => {
    expect(() => CityName.create('(Paris)')).toThrow(InvalidCityNameError);
  });

  it('should throw InvalidCityNameError for too long name', () => {
    const longName = 'A'.repeat(101);
    expect(() => CityName.create(longName)).toThrow(InvalidCityNameError);
  });

  it('should throw InvalidCityNameError for invalid format (starting with hyphen)', () => {
    expect(() => CityName.create('-Paris')).toThrow(InvalidCityNameError);
  });

  it('should throw InvalidCityNameError for mismatched parentheses', () => {
    expect(() => CityName.create('Paris (France')).toThrow(
      InvalidCityNameError,
    );
  });

  it('should throw InvalidCityNameError for multiple consecutive spaces', () => {
    expect(() => CityName.create('Saint  Denis')).toThrow(
      InvalidCityNameError,
    );
  });

  it('should compare city names', () => {
    const name1 = CityName.create('Paris');
    const name2 = CityName.create('Lyon');
    expect(name1.compareTo(name2)).toBeGreaterThan(0);
  });

  it('should normalize city names', () => {
    const name = CityName.create('Saint-Étienne');
    expect(name.toNormalized()).toBe('saintetienne');
  });

  it('should convert to string', () => {
    const name = CityName.create('Paris');
    expect(name.toString()).toBe('Paris');
  });
});
