import { type Result, fail, ok } from '@/domain/common';
import { InvalidDurationError, InvalidSpeedError } from '@/domain/errors';

export class Duration {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  static fromHours(hours: number): Result<Duration, InvalidDurationError> {
    if (hours < 0) {
      return fail(InvalidDurationError.negative());
    }

    if (!Number.isFinite(hours)) {
      return fail(InvalidDurationError.notFinite());
    }

    return ok(new Duration(hours));
  }

  static fromHoursOrThrow(hours: number): Duration {
    const result = Duration.fromHours(hours);
    if (!result.success) {
      throw result.error;
    }
    return result.value;
  }

  static fromDistanceAndSpeed(
    distanceKm: number,
    speedKmPerHour: number,
  ): Result<Duration, InvalidDurationError | InvalidSpeedError> {
    if (speedKmPerHour === 0) {
      return fail(InvalidSpeedError.zero());
    }

    return Duration.fromHours(distanceKm / speedKmPerHour);
  }

  static fromDistanceAndSpeedOrThrow(
    distanceKm: number,
    speedKmPerHour: number,
  ): Duration {
    const result = Duration.fromDistanceAndSpeed(distanceKm, speedKmPerHour);
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
    return Duration.fromHoursOrThrow(this._value + other._value);
  }

  subtract(other: Duration): Duration {
    return Duration.fromHoursOrThrow(this._value - other._value);
  }

  toString(): string {
    const hours = Math.floor(this._value);
    const minutes = Math.floor((this._value - hours) * 60);

    return `${hours}h ${minutes}m`;
  }
}
