export class Duration {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  static fromHours(hours: number): Duration {
    if (hours < 0) {
      throw new Error('Travel time cannot be negative');
    }

    if (!isFinite(hours)) {
      throw new Error('Travel time must be a finite number');
    }

    return new Duration(hours);
  }

  static fromDistanceAndSpeed(
    distanceKm: number,
    speedKmPerHour: number,
  ): Duration {
    if (speedKmPerHour === 0) {
      throw new Error('Speed cannot be zero');
    }

    return Duration.fromHours(distanceKm / speedKmPerHour);
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
