export class InvalidCityIdError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static emptyCityName(): InvalidCityIdError {
    return new InvalidCityIdError('City name cannot be empty');
  }

  static emptyNormalizedValue(): InvalidCityIdError {
    return new InvalidCityIdError('Normalized value cannot be empty');
  }
}
