export class InvalidRoadSegmentIdError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static emptyFirstCityName(): InvalidRoadSegmentIdError {
    return new InvalidRoadSegmentIdError('First city name cannot be empty');
  }

  static emptySecondCityName(): InvalidRoadSegmentIdError {
    return new InvalidRoadSegmentIdError('Second city name cannot be empty');
  }

  static emptyValue(): InvalidRoadSegmentIdError {
    return new InvalidRoadSegmentIdError(
      'Road segment id value cannot be empty',
    );
  }

  static missingSeparator(): InvalidRoadSegmentIdError {
    return new InvalidRoadSegmentIdError(
      'Road segment id value must contain the separator "__"',
    );
  }
}
