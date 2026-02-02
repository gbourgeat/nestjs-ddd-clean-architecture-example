import { DomainError } from './domain.error';

export class InvalidRoadSegmentError extends DomainError {
  readonly code = 'INVALID_ROAD_SEGMENT';

  private constructor(message: string) {
    super(message);
  }

  static sameCityConnection(): InvalidRoadSegmentError {
    return new InvalidRoadSegmentError(
      'Road segments must not connect two cities in a row',
    );
  }
}
