import { type Result, fail, ok } from '@/domain/common';
import { InvalidRoadSegmentIdError } from '@/domain/errors';
import { CityId } from './city-id';

export class RoadSegmentId {
  private readonly _value: string;
  private readonly _cityIdA: CityId;
  private readonly _cityIdB: CityId;

  private constructor(cityIdA: CityId, cityIdB: CityId) {
    // Always store in alphabetical order for consistency
    if (cityIdA.value <= cityIdB.value) {
      this._cityIdA = cityIdA;
      this._cityIdB = cityIdB;
    } else {
      this._cityIdA = cityIdB;
      this._cityIdB = cityIdA;
    }
    this._value = `${this._cityIdA.value}__${this._cityIdB.value}`;
  }

  static create(
    cityIdA: CityId,
    cityIdB: CityId,
  ): Result<RoadSegmentId, InvalidRoadSegmentIdError> {
    if (cityIdA.equals(cityIdB)) {
      return fail(InvalidRoadSegmentIdError.sameCities());
    }
    return ok(new RoadSegmentId(cityIdA, cityIdB));
  }

  static createOrThrow(cityIdA: CityId, cityIdB: CityId): RoadSegmentId {
    const result = RoadSegmentId.create(cityIdA, cityIdB);
    if (!result.success) {
      throw result.error;
    }
    return result.value;
  }

  static fromCityNames(
    cityName1: string,
    cityName2: string,
  ): Result<RoadSegmentId, InvalidRoadSegmentIdError> {
    if (!cityName1 || cityName1.trim().length === 0) {
      return fail(InvalidRoadSegmentIdError.emptyFirstCityName());
    }

    if (!cityName2 || cityName2.trim().length === 0) {
      return fail(InvalidRoadSegmentIdError.emptySecondCityName());
    }

    const cityIdAResult = CityId.fromCityName(cityName1);
    if (!cityIdAResult.success) {
      return fail(InvalidRoadSegmentIdError.invalidCityId('first'));
    }

    const cityIdBResult = CityId.fromCityName(cityName2);
    if (!cityIdBResult.success) {
      return fail(InvalidRoadSegmentIdError.invalidCityId('second'));
    }

    return RoadSegmentId.create(cityIdAResult.value, cityIdBResult.value);
  }

  static fromCityNamesOrThrow(
    cityName1: string,
    cityName2: string,
  ): RoadSegmentId {
    const result = RoadSegmentId.fromCityNames(cityName1, cityName2);
    if (!result.success) {
      throw result.error;
    }
    return result.value;
  }

  static fromValue(
    value: string,
  ): Result<RoadSegmentId, InvalidRoadSegmentIdError> {
    if (!value || value.trim().length === 0) {
      return fail(InvalidRoadSegmentIdError.emptyValue());
    }

    if (!value.includes('__')) {
      return fail(InvalidRoadSegmentIdError.missingSeparator());
    }

    const [cityAId, cityBId] = value.split('__');

    const cityIdAResult = CityId.fromNormalizedValue(cityAId);
    if (!cityIdAResult.success) {
      return fail(InvalidRoadSegmentIdError.invalidCityId('first'));
    }

    const cityIdBResult = CityId.fromNormalizedValue(cityBId);
    if (!cityIdBResult.success) {
      return fail(InvalidRoadSegmentIdError.invalidCityId('second'));
    }

    // Use the constructor directly since the value is already normalized and sorted
    return ok(new RoadSegmentId(cityIdAResult.value, cityIdBResult.value));
  }

  static fromValueOrThrow(value: string): RoadSegmentId {
    const result = RoadSegmentId.fromValue(value);
    if (!result.success) {
      throw result.error;
    }
    return result.value;
  }

  get value(): string {
    return this._value;
  }

  get cityIdA(): CityId {
    return this._cityIdA;
  }

  get cityIdB(): CityId {
    return this._cityIdB;
  }

  equals(other: RoadSegmentId): boolean {
    // Order-independent equality (already handled by sorting in constructor)
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
