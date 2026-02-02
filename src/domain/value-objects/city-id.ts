import { type Result, fail, ok } from '@/domain/common';
import { InvalidCityIdError } from '@/domain/errors';
import { CityName } from './city-name';

export class CityId {
  private readonly _value: string;
  private readonly _normalizedName: string;

  private constructor(normalizedName: string) {
    this._normalizedName = normalizedName;
    this._value = normalizedName;
  }

  static fromName(name: CityName): CityId {
    const normalized = CityId.normalize(name.value);
    return new CityId(normalized);
  }

  static fromCityName(cityName: string): Result<CityId, InvalidCityIdError> {
    if (!cityName || cityName.trim().length === 0) {
      return fail(InvalidCityIdError.emptyCityName());
    }

    const normalized = CityId.normalize(cityName);
    return ok(new CityId(normalized));
  }

  static fromCityNameOrThrow(cityName: string): CityId {
    const result = CityId.fromCityName(cityName);
    if (!result.success) {
      throw result.error;
    }
    return result.value;
  }

  static fromNormalizedValue(
    normalizedValue: string,
  ): Result<CityId, InvalidCityIdError> {
    if (!normalizedValue || normalizedValue.trim().length === 0) {
      return fail(InvalidCityIdError.emptyNormalizedValue());
    }

    return ok(new CityId(normalizedValue));
  }

  static fromNormalizedValueOrThrow(normalizedValue: string): CityId {
    const result = CityId.fromNormalizedValue(normalizedValue);
    if (!result.success) {
      throw result.error;
    }
    return result.value;
  }

  private static normalize(cityName: string): string {
    return cityName
      .trim()
      .toLowerCase()
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  get value(): string {
    return this._value;
  }

  get normalizedName(): string {
    return this._normalizedName;
  }

  equals(other: CityId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
