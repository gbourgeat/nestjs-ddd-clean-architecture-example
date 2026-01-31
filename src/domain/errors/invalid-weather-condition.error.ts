export class InvalidWeatherConditionError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
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
