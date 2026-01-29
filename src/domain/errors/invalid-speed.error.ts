export class InvalidSpeedError extends Error {
  private constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static negative(): InvalidSpeedError {
    return new InvalidSpeedError('Speed cannot be negative');
  }

  static notFinite(): InvalidSpeedError {
    return new InvalidSpeedError('Speed must be a finite number');
  }

  static zero(): InvalidSpeedError {
    return new InvalidSpeedError('Speed cannot be zero');
  }
}
