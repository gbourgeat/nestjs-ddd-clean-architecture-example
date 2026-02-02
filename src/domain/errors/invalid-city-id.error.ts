import { DomainError } from './domain.error';

export class InvalidCityIdError extends DomainError {
  readonly code = 'INVALID_CITY_ID';

  private constructor(message: string) {
    super(message);
  }

  static emptyCityName(): InvalidCityIdError {
    return new InvalidCityIdError('City name cannot be empty');
  }

  static emptyNormalizedValue(): InvalidCityIdError {
    return new InvalidCityIdError('Normalized value cannot be empty');
  }
}
