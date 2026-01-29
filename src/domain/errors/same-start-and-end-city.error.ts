import { CityName } from '@/domain/value-objects';

export class SameStartAndEndCityError extends Error {
  private constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static forCityName(cityName: CityName): SameStartAndEndCityError {
    return new SameStartAndEndCityError(
      `Start city and end city cannot be the same: "${cityName.value}"`,
    );
  }
}
