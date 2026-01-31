export class InvalidRoadSegmentError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static sameCityConnection(): InvalidRoadSegmentError {
    return new InvalidRoadSegmentError(
      'Road segments must not connect two cities in a row',
    );
  }
}
