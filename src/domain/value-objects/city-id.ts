import { type Result, fail, isValidUuid, ok } from '@/domain/common';
import { InvalidCityIdError } from '@/domain/errors';

export class CityId {
  private readonly _value: string;

  private constructor(uuid: string) {
    this._value = uuid;
  }

  static generate(): CityId {
    return new CityId(crypto.randomUUID());
  }

  static fromValue(value: string): Result<CityId, InvalidCityIdError> {
    if (!value || value.trim().length === 0) {
      return fail(InvalidCityIdError.emptyValue());
    }

    if (!isValidUuid(value)) {
      return fail(InvalidCityIdError.invalidUuidFormat(value));
    }

    return ok(new CityId(value));
  }

  static fromString(value: string): CityId {
    const result = CityId.fromValue(value);
    if (!result.success) {
      throw result.error;
    }
    return result.value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: CityId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
