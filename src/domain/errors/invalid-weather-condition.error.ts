import { DomainError } from './domain.error';

export class InvalidWeatherConditionError extends DomainError {
  readonly code = 'INVALID_WEATHER_CONDITION';

  private constructor(message: string) {
    super(message);
  }

  static forInvalidCondition(
    invalidCondition: string,
    validConditions: readonly string[],
  ): InvalidWeatherConditionError {
    return new InvalidWeatherConditionError(
      `Invalid weather condition: "${invalidCondition}". Valid conditions are: ${validConditions.join(', ')}`,
    );
  }
}
