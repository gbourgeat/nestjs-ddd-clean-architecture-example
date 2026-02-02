import { DomainError } from './domain.error';

export class InvalidDistanceError extends DomainError {
  readonly code = 'INVALID_DISTANCE';

  private constructor(message: string) {
    super(message);
  }

  static negative(): InvalidDistanceError {
    return new InvalidDistanceError('Distance cannot be negative');
  }

  static notFinite(): InvalidDistanceError {
    return new InvalidDistanceError('Distance must be a finite number');
  }
}
