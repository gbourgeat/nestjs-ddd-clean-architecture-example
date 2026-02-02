import { InvalidDistanceError } from '@/domain/errors';
import { Distance } from '@/domain/value-objects';

describe('Distance', () => {
  it('should throw InvalidDistanceError for negative distance', () => {
    expect(() => Distance.fromKilometers(-10)).toThrow(
      InvalidDistanceError as unknown as typeof Error,
    );
  });

  it('should throw InvalidDistanceError for non-finite distance', () => {
    expect(() => Distance.fromKilometers(Number.POSITIVE_INFINITY)).toThrow(
      InvalidDistanceError as unknown as typeof Error,
    );
  });

  it('should return failure Result for negative distance', () => {
    const result = Distance.tryFromKilometers(-10);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(InvalidDistanceError);
      expect(result.error.code).toBe('INVALID_DISTANCE');
    }
  });

  it('should return success Result for valid distance', () => {
    const result = Distance.tryFromKilometers(100);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.kilometers).toBe(100);
    }
  });

  it('should convert kilometers to meters', () => {
    const distance = Distance.fromKilometers(5);
    expect(distance.meters).toBe(5000);
  });

  it('should compare distances', () => {
    const dist1 = Distance.fromKilometers(100);
    const dist2 = Distance.fromKilometers(200);
    expect(dist1.isLessThan(dist2)).toBe(true);
    expect(dist2.isGreaterThan(dist1)).toBe(true);
  });

  it('should check equality of distances', () => {
    const dist1 = Distance.fromKilometers(100);
    const dist2 = Distance.fromKilometers(100);
    expect(dist1.equals(dist2)).toBe(true);
  });

  it('should add distances', () => {
    const dist1 = Distance.fromKilometers(100);
    const dist2 = Distance.fromKilometers(50);
    const sum = dist1.add(dist2);
    expect(sum.kilometers).toBe(150);
  });

  it('should convert to string', () => {
    const distance = Distance.fromKilometers(100);
    expect(distance.toString()).toBe('100 km');
  });
});
