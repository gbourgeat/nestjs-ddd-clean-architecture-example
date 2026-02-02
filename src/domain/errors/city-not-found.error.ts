import { CityName } from '@/domain/value-objects';
import { DomainError } from './domain.error';

export class CityNotFoundError extends DomainError {
  readonly code = 'CITY_NOT_FOUND';

  private constructor(message: string) {
    super(message);
  }

  static forCityName(cityName: CityName): CityNotFoundError {
    return new CityNotFoundError(
      `City with name "${cityName.value}" not found`,
    );
  }
}
