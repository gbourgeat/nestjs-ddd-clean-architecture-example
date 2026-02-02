import { DomainError } from './domain.error';

export class InvalidRoadSegmentIdError extends DomainError {
  readonly code = 'INVALID_ROAD_SEGMENT_ID';

  private constructor(message: string) {
    super(message);
  }

  static emptyValue(): InvalidRoadSegmentIdError {
    return new InvalidRoadSegmentIdError('Road segment ID cannot be empty');
  }

  static invalidUuidFormat(value: string): InvalidRoadSegmentIdError {
    return new InvalidRoadSegmentIdError(
      `Road segment ID must be a valid UUID, got: "${value}"`,
    );
  }
}
