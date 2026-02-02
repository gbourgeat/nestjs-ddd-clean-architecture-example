import { type Result, fail, ok } from '@/domain/common';
import { InvalidDurationError, InvalidSpeedError } from '@/domain/errors';

export class Duration {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  static tryFromHours(hours: number): Result<Duration, InvalidDurationError> {
    if (hours < 0) {
      return fail(InvalidDurationError.negative());
    }

    if (!Number.isFinite(hours)) {
      return fail(InvalidDurationError.notFinite());
    }

    return ok(new Duration(hours));
  }

  static fromHours(hours: number): Duration {
    const result = Duration.tryFromHours(hours);
    if (!result.success) {
      throw result.error;
    }
    return result.value;
  }

  static tryFromDistanceAndSpeed(
    distanceKm: number,
    speedKmPerHour: number,
  ): Result<Duration, InvalidDurationError | InvalidSpeedError> {
    if (speedKmPerHour === 0) {
      return fail(InvalidSpeedError.zero());
    }

    return Duration.tryFromHours(distanceKm / speedKmPerHour);
  }

  static fromDistanceAndSpeed(
    distanceKm: number,
    speedKmPerHour: number,
  ): Duration {
    const result = Duration.tryFromDistanceAndSpeed(distanceKm, speedKmPerHour);
    if (!result.success) {
      throw result.error;
    }
    return result.value;
  }

  get hours(): number {
    return this._value;
  }

  get minutes(): number {
    return this._value * 60;
  }

  get seconds(): number {
    return this._value * 3600;
  }

  equals(other: Duration): boolean {
    return this._value === other._value;
  }

  isGreaterThan(other: Duration): boolean {
    return this._value > other._value;
  }

  isLessThan(other: Duration): boolean {
    return this._value < other._value;
  }

  add(other: Duration): Duration {
    return Duration.fromHours(this._value + other._value);
  }

  subtract(other: Duration): Duration {
    return Duration.fromHours(this._value - other._value);
  }

  toString(): string {
    const hours = Math.floor(this._value);
    const minutes = Math.floor((this._value - hours) * 60);

    return `${hours}h ${minutes}m`;
  }
}
