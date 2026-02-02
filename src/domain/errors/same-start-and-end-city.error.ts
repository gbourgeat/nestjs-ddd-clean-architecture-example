import { CityName } from '@/domain/value-objects';
import { DomainError } from './domain.error';

export class SameStartAndEndCityError extends DomainError {
  readonly code = 'SAME_START_END_CITY';

  private constructor(message: string) {
    super(message);
  }

  static forCityName(cityName: CityName): SameStartAndEndCityError {
    return new SameStartAndEndCityError(
      `Start city and end city cannot be the same: "${cityName.value}"`,
    );
  }
}
