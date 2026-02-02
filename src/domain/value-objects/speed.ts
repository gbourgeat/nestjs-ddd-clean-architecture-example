import { type Result, fail, ok } from '@/domain/common';
import { InvalidSpeedError } from '@/domain/errors';

export class Speed {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  static fromKmPerHour(kmPerHour: number): Result<Speed, InvalidSpeedError> {
    if (kmPerHour < 0) {
      return fail(InvalidSpeedError.negative());
    }

    if (!Number.isFinite(kmPerHour)) {
      return fail(InvalidSpeedError.notFinite());
    }

    return ok(new Speed(kmPerHour));
  }

  static fromKmPerHourOrThrow(kmPerHour: number): Speed {
    const result = Speed.fromKmPerHour(kmPerHour);
    if (!result.success) {
      throw result.error;
    }
    return result.value;
  }

  get kmPerHour(): number {
    return this._value;
  }

  toString(): string {
    return `${this._value} km/h`;
  }
}
