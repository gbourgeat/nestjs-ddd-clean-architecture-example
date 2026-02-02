import { InvalidCityIdError } from '@/domain/errors';
import { CityId } from '@/domain/value-objects';

describe('CityId', () => {
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
  const ANOTHER_VALID_UUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const INVALID_UUID = 'not-a-valid-uuid';

  describe('generate', () => {
    it('should generate a valid UUID', () => {
      const id = CityId.generate();
      expect(id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate unique UUIDs', () => {
      const id1 = CityId.generate();
      const id2 = CityId.generate();
      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe('fromValue', () => {
    it('should return success Result for valid UUID', () => {
      const result = CityId.fromValue(VALID_UUID);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(VALID_UUID);
      }
    });

    it('should return failure Result for empty value', () => {
      const result = CityId.fromValue('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidCityIdError);
        expect(result.error.code).toBe('INVALID_CITY_ID');
      }
    });

    it('should return failure Result for invalid UUID format', () => {
      const result = CityId.fromValue(INVALID_UUID);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidCityIdError);
        expect(result.error.message).toContain('valid UUID');
      }
    });

    it('should return failure Result for whitespace-only value', () => {
      const result = CityId.fromValue('   ');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidCityIdError);
      }
    });
  });

  describe('fromValueOrThrow', () => {
    it('should return CityId for valid UUID', () => {
      const id = CityId.fromValueOrThrow(VALID_UUID);
      expect(id.value).toBe(VALID_UUID);
    });

    it('should throw InvalidCityIdError for empty value', () => {
      expect(() => CityId.fromValueOrThrow('')).toThrow(
        InvalidCityIdError as unknown as typeof Error,
      );
    });

    it('should throw InvalidCityIdError for invalid UUID format', () => {
      expect(() => CityId.fromValueOrThrow(INVALID_UUID)).toThrow(
        InvalidCityIdError as unknown as typeof Error,
      );
    });
  });

  describe('reconstitute', () => {
    it('should create CityId without validation', () => {
      const id = CityId.reconstitute(VALID_UUID);
      expect(id.value).toBe(VALID_UUID);
    });

    it('should work even with invalid UUID (for DB reconstitution)', () => {
      // reconstitute bypasses validation - used for trusted data from DB
      const id = CityId.reconstitute('any-value');
      expect(id.value).toBe('any-value');
    });
  });

  describe('equals', () => {
    it('should return true for equal UUIDs', () => {
      const id1 = CityId.fromValueOrThrow(VALID_UUID);
      const id2 = CityId.fromValueOrThrow(VALID_UUID);
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different UUIDs', () => {
      const id1 = CityId.fromValueOrThrow(VALID_UUID);
      const id2 = CityId.fromValueOrThrow(ANOTHER_VALID_UUID);
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the UUID value', () => {
      const id = CityId.fromValueOrThrow(VALID_UUID);
      expect(id.toString()).toBe(VALID_UUID);
    });
  });
});
