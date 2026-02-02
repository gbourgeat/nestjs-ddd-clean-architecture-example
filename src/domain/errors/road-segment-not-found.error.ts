import { RoadSegmentId } from '@/domain/value-objects';
import { DomainError } from './domain.error';

export class RoadSegmentNotFoundError extends DomainError {
  readonly code = 'ROAD_SEGMENT_NOT_FOUND';

  private constructor(message: string) {
    super(message);
  }

  static forRoadSegmentId(
    roadSegmentId: RoadSegmentId,
  ): RoadSegmentNotFoundError {
    return new RoadSegmentNotFoundError(
      `Road segment with id "${roadSegmentId.value}" not found`,
    );
  }
}
