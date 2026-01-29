export class CityId {
  private readonly _value: string;
  private readonly _normalizedName: string;

  private constructor(normalizedName: string) {
    this._normalizedName = normalizedName;
    this._value = normalizedName;
  }

  static fromCityName(cityName: string): CityId {
    if (!cityName || cityName.trim().length === 0) {
      throw new Error('City name cannot be empty');
    }

    const normalized = CityId.normalize(cityName);

    return new CityId(normalized);
  }

  static fromNormalizedValue(normalizedValue: string): CityId {
    if (!normalizedValue || normalizedValue.trim().length === 0) {
      throw new Error('Normalized value cannot be empty');
    }

    return new CityId(normalizedValue);
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
