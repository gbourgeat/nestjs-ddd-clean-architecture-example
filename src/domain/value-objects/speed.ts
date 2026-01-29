export class Speed {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  static fromKmPerHour(kmPerHour: number): Speed {
    if (kmPerHour < 0) {
      throw new Error('Speed cannot be negative');
    }

    if (!isFinite(kmPerHour)) {
      throw new Error('Speed must be a finite number');
    }

    return new Speed(kmPerHour);
  }

  get kmPerHour(): number {
    return this._value;
  }

  toString(): string {
    return `${this._value} km/h`;
  }
}
