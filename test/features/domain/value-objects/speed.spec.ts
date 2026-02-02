import { InvalidSpeedError } from '@/domain/errors';
import { Speed } from '@/domain/value-objects';

describe('Speed', () => {
  it('should throw InvalidSpeedError for negative speed', () => {
    expect(() => Speed.fromKmPerHour(-50)).toThrow(
      InvalidSpeedError as unknown as typeof Error,
    );
  });

  it('should throw InvalidSpeedError for non-finite speed', () => {
    expect(() => Speed.fromKmPerHour(Number.POSITIVE_INFINITY)).toThrow(
      InvalidSpeedError as unknown as typeof Error,
    );
  });

  it('should return failure Result for negative speed', () => {
    const result = Speed.tryFromKmPerHour(-50);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(InvalidSpeedError);
      expect(result.error.code).toBe('INVALID_SPEED');
    }
  });

  it('should return success Result for valid speed', () => {
    const result = Speed.tryFromKmPerHour(130);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.kmPerHour).toBe(130);
    }
  });

  it('should convert to string', () => {
    const speed = Speed.fromKmPerHour(130);
    expect(speed.toString()).toBe('130 km/h');
  });
});
