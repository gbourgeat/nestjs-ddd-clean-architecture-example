import { CityName } from '@/domain/value-objects';

export class CityNotFoundError extends Error {
  private constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static forCityName(cityName: CityName): CityNotFoundError {
    return new CityNotFoundError(
      `City with name "${cityName.value}" not found`,
    );
  }
}
