export class Distance {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  static fromKilometers(kilometers: number): Distance {
    if (kilometers < 0) {
      throw new Error('Distance cannot be negative');
    }

    if (!isFinite(kilometers)) {
      throw new Error('Distance must be a finite number');
    }

    return new Distance(kilometers);
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
    return Distance.fromKilometers(this._value + other._value);
  }

  toString(): string {
    return `${this._value} km`;
  }
}
