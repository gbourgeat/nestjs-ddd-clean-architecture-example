export class InvalidDurationError extends Error {
  private constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static negative(): InvalidDurationError {
    return new InvalidDurationError('Travel time cannot be negative');
  }

  static notFinite(): InvalidDurationError {
    return new InvalidDurationError('Travel time must be a finite number');
  }
}
