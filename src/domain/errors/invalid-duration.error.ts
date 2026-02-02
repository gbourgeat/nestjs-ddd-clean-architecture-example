import { DomainError } from './domain.error';

export class InvalidDurationError extends DomainError {
  readonly code = 'INVALID_DURATION';

  private constructor(message: string) {
    super(message);
  }

  static negative(): InvalidDurationError {
    return new InvalidDurationError('Travel time cannot be negative');
  }

  static notFinite(): InvalidDurationError {
    return new InvalidDurationError('Travel time must be a finite number');
  }
}
