import { DomainError } from './domain.error';

export class InvalidCityIdError extends DomainError {
  readonly code = 'INVALID_CITY_ID';

  private constructor(message: string) {
    super(message);
  }

  static emptyValue(): InvalidCityIdError {
    return new InvalidCityIdError('City ID cannot be empty');
  }

  static invalidUuidFormat(value: string): InvalidCityIdError {
    return new InvalidCityIdError(
      `City ID must be a valid UUID, got: "${value}"`,
    );
  }
}
