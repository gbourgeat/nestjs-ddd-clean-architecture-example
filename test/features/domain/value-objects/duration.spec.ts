import { InvalidDurationError, InvalidSpeedError } from '@/domain/errors';
import { Duration } from '@/domain/value-objects';

describe('Duration', () => {
  it('should throw InvalidDurationError for negative duration', () => {
    expect(() => Duration.fromHoursOrThrow(-5)).toThrow(InvalidDurationError);
  });

  it('should throw InvalidDurationError for non-finite duration', () => {
    expect(() => Duration.fromHoursOrThrow(Number.POSITIVE_INFINITY)).toThrow(
      InvalidDurationError,
    );
  });

  it('should throw InvalidSpeedError when speed is zero in fromDistanceAndSpeed', () => {
    expect(() => Duration.fromDistanceAndSpeedOrThrow(100, 0)).toThrow(
      InvalidSpeedError,
    );
  });

  it('should return failure Result for negative duration', () => {
    const result = Duration.fromHours(-5);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(InvalidDurationError);
      expect(result.error.code).toBe('INVALID_DURATION');
    }
  });

  it('should return success Result for valid duration', () => {
    const result = Duration.fromHours(2);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.hours).toBe(2);
    }
  });

  it('should return failure Result for zero speed in fromDistanceAndSpeed', () => {
    const result = Duration.fromDistanceAndSpeed(100, 0);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(InvalidSpeedError);
    }
  });

  it('should convert hours to minutes', () => {
    const duration = Duration.fromHoursOrThrow(2);
    expect(duration.minutes).toBe(120);
  });

  it('should calculate duration from distance and speed', () => {
    const duration = Duration.fromDistanceAndSpeedOrThrow(100, 50);
    expect(duration.hours).toBe(2);
  });

  it('should compare durations', () => {
    const dur1 = Duration.fromHoursOrThrow(1);
    const dur2 = Duration.fromHoursOrThrow(2);
    expect(dur1.isLessThan(dur2)).toBe(true);
    expect(dur2.isGreaterThan(dur1)).toBe(true);
  });

  it('should add durations', () => {
    const dur1 = Duration.fromHoursOrThrow(1);
    const dur2 = Duration.fromHoursOrThrow(2);
    const sum = dur1.add(dur2);
    expect(sum.hours).toBe(3);
  });

  it('should subtract durations', () => {
    const dur1 = Duration.fromHoursOrThrow(3);
    const dur2 = Duration.fromHoursOrThrow(1);
    const diff = dur1.subtract(dur2);
    expect(diff.hours).toBe(2);
  });

  it('should check equality of durations', () => {
    const dur1 = Duration.fromHoursOrThrow(2);
    const dur2 = Duration.fromHoursOrThrow(2);
    expect(dur1.equals(dur2)).toBe(true);
  });

  it('should convert to seconds', () => {
    const duration = Duration.fromHoursOrThrow(1);
    expect(duration.seconds).toBe(3600);
  });

  it('should convert to string', () => {
    const duration = Duration.fromHoursOrThrow(2.5);
    expect(duration.toString()).toContain('h');
    expect(duration.toString()).toContain('m');
  });
});
