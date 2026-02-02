import { type Result, fail, ok } from '@/domain/common';
import { InvalidDistanceError } from '@/domain/errors';

export class Distance {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  static fromKilometers(
    kilometers: number,
  ): Result<Distance, InvalidDistanceError> {
    if (kilometers < 0) {
      return fail(InvalidDistanceError.negative());
    }

    if (!Number.isFinite(kilometers)) {
      return fail(InvalidDistanceError.notFinite());
    }

    return ok(new Distance(kilometers));
  }

  static fromKilometersOrThrow(kilometers: number): Distance {
    const result = Distance.fromKilometers(kilometers);
    if (!result.success) {
      throw result.error;
    }
    return result.value;
  }

  get kilometers(): number {
    return this._value;
  }

  get meters(): number {
    return this._value * 1000;
  }

  equals(other: Distance): boolean {
    return this._value === other._value;
  }

  isGreaterThan(other: Distance): boolean {
    return this._value > other._value;
  }

  isLessThan(other: Distance): boolean {
    return this._value < other._value;
  }

  add(other: Distance): Distance {
    return Distance.fromKilometersOrThrow(this._value + other._value);
  }

  toString(): string {
    return `${this._value} km`;
  }
}
