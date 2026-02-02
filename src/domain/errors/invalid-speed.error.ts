import { DomainError } from './domain.error';

export class InvalidSpeedError extends DomainError {
  readonly code = 'INVALID_SPEED';

  private constructor(message: string) {
    super(message);
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
