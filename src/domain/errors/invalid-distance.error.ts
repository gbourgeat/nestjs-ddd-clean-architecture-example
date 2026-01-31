export class InvalidDistanceError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static negative(): InvalidDistanceError {
    return new InvalidDistanceError('Distance cannot be negative');
  }

  static notFinite(): InvalidDistanceError {
    return new InvalidDistanceError('Distance must be a finite number');
  }
}
