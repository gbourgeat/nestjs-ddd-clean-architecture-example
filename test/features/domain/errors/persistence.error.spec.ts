import { PersistenceError } from '@/domain/errors/persistence.error';

describe('PersistenceError', () => {
  describe('saveFailed', () => {
    it('should create error with reason', () => {
      const error = PersistenceError.saveFailed(
        'RoadSegment',
        'Database error',
      );

      expect(error.message).toBe('Failed to save RoadSegment: Database error');
      expect(error.code).toBe('PERSISTENCE_ERROR');
      expect(error.name).toBe('PersistenceError');
    });

    it('should create error without reason', () => {
      const error = PersistenceError.saveFailed('RoadSegment');

      expect(error.message).toBe('Failed to save RoadSegment');
      expect(error.code).toBe('PERSISTENCE_ERROR');
    });
  });

  describe('deleteFailed', () => {
    it('should create error with reason', () => {
      const error = PersistenceError.deleteFailed('City', 'Not found');

      expect(error.message).toBe('Failed to delete City: Not found');
      expect(error.code).toBe('PERSISTENCE_ERROR');
    });

    it('should create error without reason', () => {
      const error = PersistenceError.deleteFailed('City');

      expect(error.message).toBe('Failed to delete City');
      expect(error.code).toBe('PERSISTENCE_ERROR');
    });
  });

  describe('loadFailed', () => {
    it('should create error with reason', () => {
      const error = PersistenceError.loadFailed('Route', 'Connection failed');

      expect(error.message).toBe('Failed to load Route: Connection failed');
      expect(error.code).toBe('PERSISTENCE_ERROR');
    });

    it('should create error without reason', () => {
      const error = PersistenceError.loadFailed('Route');

      expect(error.message).toBe('Failed to load Route');
      expect(error.code).toBe('PERSISTENCE_ERROR');
    });
  });
});
