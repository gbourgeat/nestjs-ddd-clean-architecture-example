import { Distance } from '@/domain/value-objects';
import { InvalidDistanceError } from '@/domain/errors';

describe('Distance', () => {
  it('should throw InvalidDistanceError for negative distance', () => {
    expect(() => Distance.fromKilometers(-10)).toThrow(InvalidDistanceError);
  });

  it('should throw InvalidDistanceError for non-finite distance', () => {
    expect(() => Distance.fromKilometers(Infinity)).toThrow(
      InvalidDistanceError,
    );
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
