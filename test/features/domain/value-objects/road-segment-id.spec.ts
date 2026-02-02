import { InvalidRoadSegmentIdError } from '@/domain/errors';
import { RoadSegmentId } from '@/domain/value-objects';

describe('RoadSegmentId', () => {
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
  const ANOTHER_VALID_UUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const INVALID_UUID = 'not-a-valid-uuid';

  describe('generate', () => {
    it('should generate a valid UUID', () => {
      const id = RoadSegmentId.generate();
      expect(id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate unique UUIDs', () => {
      const id1 = RoadSegmentId.generate();
      const id2 = RoadSegmentId.generate();
      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe('fromValue', () => {
    it('should return success Result for valid UUID', () => {
      const result = RoadSegmentId.fromValue(VALID_UUID);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(VALID_UUID);
      }
    });

    it('should return failure Result for empty value', () => {
      const result = RoadSegmentId.fromValue('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidRoadSegmentIdError);
        expect(result.error.code).toBe('INVALID_ROAD_SEGMENT_ID');
      }
    });

    it('should return failure Result for invalid UUID format', () => {
      const result = RoadSegmentId.fromValue(INVALID_UUID);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidRoadSegmentIdError);
        expect(result.error.message).toContain('valid UUID');
      }
    });

    it('should return failure Result for whitespace-only value', () => {
      const result = RoadSegmentId.fromValue('   ');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidRoadSegmentIdError);
      }
    });
  });

  describe('fromString', () => {
    it('should return RoadSegmentId for valid UUID', () => {
      const id = RoadSegmentId.fromString(VALID_UUID);
      expect(id.value).toBe(VALID_UUID);
    });

    it('should throw InvalidRoadSegmentIdError for empty value', () => {
      expect(() => RoadSegmentId.fromString('')).toThrow(
        InvalidRoadSegmentIdError as unknown as typeof Error,
      );
    });

    it('should throw InvalidRoadSegmentIdError for invalid UUID format', () => {
      expect(() => RoadSegmentId.fromString(INVALID_UUID)).toThrow(
        InvalidRoadSegmentIdError as unknown as typeof Error,
      );
    });
  });

  describe('equals', () => {
    it('should return true for equal UUIDs', () => {
      const id1 = RoadSegmentId.fromString(VALID_UUID);
      const id2 = RoadSegmentId.fromString(VALID_UUID);
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different UUIDs', () => {
      const id1 = RoadSegmentId.fromString(VALID_UUID);
      const id2 = RoadSegmentId.fromString(ANOTHER_VALID_UUID);
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the UUID value', () => {
      const id = RoadSegmentId.fromString(VALID_UUID);
      expect(id.toString()).toBe(VALID_UUID);
    });
  });
});
