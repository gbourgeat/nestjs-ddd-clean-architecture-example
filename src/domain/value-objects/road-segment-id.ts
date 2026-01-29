import { InvalidRoadSegmentIdError } from '@/domain/errors';

export class RoadSegmentId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static fromCityNames(cityName1: string, cityName2: string): RoadSegmentId {
    if (!cityName1 || cityName1.trim().length === 0) {
      throw InvalidRoadSegmentIdError.emptyFirstCityName();
    }

    if (!cityName2 || cityName2.trim().length === 0) {
      throw InvalidRoadSegmentIdError.emptySecondCityName();
    }

    const normalized1 = RoadSegmentId.normalize(cityName1);
    const normalized2 = RoadSegmentId.normalize(cityName2);

    // Sort alphabetically toCity ensure consistency
    const [first, second] =
      normalized1 <= normalized2
        ? [normalized1, normalized2]
        : [normalized2, normalized1];

    const value = `${first}__${second}`;

    return new RoadSegmentId(value);
  }

  static fromValue(value: string): RoadSegmentId {
    if (!value || value.trim().length === 0) {
      throw InvalidRoadSegmentIdError.emptyValue();
    }

    if (!value.includes('__')) {
      throw InvalidRoadSegmentIdError.missingSeparator();
    }

    return new RoadSegmentId(value);
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

  equals(other: RoadSegmentId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
