import { InvalidSpeedError } from '@/domain/errors';
import { Speed } from '@/domain/value-objects';

describe('Speed', () => {
  it('should throw InvalidSpeedError for negative speed', () => {
    expect(() => Speed.fromKmPerHour(-50)).toThrow(InvalidSpeedError);
  });

  it('should throw InvalidSpeedError for non-finite speed', () => {
    expect(() => Speed.fromKmPerHour(Number.POSITIVE_INFINITY)).toThrow(
      InvalidSpeedError,
    );
  });

  it('should convert to string', () => {
    const speed = Speed.fromKmPerHour(130);
    expect(speed.toString()).toBe('130 km/h');
  });
});
