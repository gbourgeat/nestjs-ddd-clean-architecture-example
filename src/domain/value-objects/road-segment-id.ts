import { type Result, fail, isValidUuid, ok } from '@/domain/common';
import { InvalidRoadSegmentIdError } from '@/domain/errors';

export class RoadSegmentId {
  private readonly _value: string;

  private constructor(uuid: string) {
    this._value = uuid;
  }

  static generate(): RoadSegmentId {
    return new RoadSegmentId(crypto.randomUUID());
  }

  static fromValue(
    value: string,
  ): Result<RoadSegmentId, InvalidRoadSegmentIdError> {
    if (!value || value.trim().length === 0) {
      return fail(InvalidRoadSegmentIdError.emptyValue());
    }

    if (!isValidUuid(value)) {
      return fail(InvalidRoadSegmentIdError.invalidUuidFormat(value));
    }

    return ok(new RoadSegmentId(value));
  }

  static fromString(value: string): RoadSegmentId {
    const result = RoadSegmentId.fromValue(value);
    if (!result.success) {
      throw result.error;
    }

    return result.value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: RoadSegmentId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
