export class DatabaseIntegrityError extends Error {
  private constructor(message: string) {
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
