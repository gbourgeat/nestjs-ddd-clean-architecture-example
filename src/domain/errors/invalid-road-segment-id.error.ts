import { DomainError } from './domain.error';

export class InvalidRoadSegmentIdError extends DomainError {
  readonly code = 'INVALID_ROAD_SEGMENT_ID';

  private constructor(message: string) {
    super(message);
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

  static sameCities(): InvalidRoadSegmentIdError {
    return new InvalidRoadSegmentIdError(
      'Road segment cannot connect a city to itself',
    );
  }

  static invalidCityId(
    position: 'first' | 'second',
  ): InvalidRoadSegmentIdError {
    return new InvalidRoadSegmentIdError(
      `Invalid ${position} city ID in road segment`,
    );
  }
}
