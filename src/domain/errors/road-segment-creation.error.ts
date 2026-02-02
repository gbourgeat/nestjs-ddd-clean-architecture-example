import { DomainError } from './domain.error';

export interface ValidationErrorDetail {
  field: string;
  code: string;
  message: string;
}

export class RoadSegmentCreationError extends DomainError {
  readonly code = 'ROAD_SEGMENT_CREATION_ERROR';
  readonly validationErrors: ValidationErrorDetail[];

  private constructor(validationErrors: ValidationErrorDetail[]) {
    super(validationErrors.map((e) => e.message).join('; '));
    this.validationErrors = validationErrors;
  }

  static fromValidationErrors(
    errors: ValidationErrorDetail[],
  ): RoadSegmentCreationError {
    return new RoadSegmentCreationError(errors);
  }

  static singleError(
    field: string,
    code: string,
    message: string,
  ): RoadSegmentCreationError {
    return new RoadSegmentCreationError([{ field, code, message }]);
  }
}
