import { RoadSegmentId } from '@/domain/value-objects';

export class RoadSegmentNotFoundError extends Error {
  private constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static forRoadSegmentId(
    roadSegmentId: RoadSegmentId,
  ): RoadSegmentNotFoundError {
    return new RoadSegmentNotFoundError(
      `Road segment with id "${roadSegmentId.value}" not found`,
    );
  }

  static forCityNames(
    cityName1: string,
    cityName2: string,
  ): RoadSegmentNotFoundError {
    return new RoadSegmentNotFoundError(
      `Road segment between "${cityName1}" and "${cityName2}" not found`,
    );
  }
}
