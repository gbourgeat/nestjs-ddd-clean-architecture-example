export class DatabaseIntegrityError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static citiesNotFoundForRoadSegment(
    roadSegmentId: string,
  ): DatabaseIntegrityError {
    return new DatabaseIntegrityError(
      `Cities not found for road segment ${roadSegmentId}`,
    );
  }
}
