import { DomainError } from './domain.error';

export class PersistenceError extends DomainError {
  readonly code = 'PERSISTENCE_ERROR';

  private constructor(message: string) {
    super(message);
  }

  static saveFailed(entityType: string, reason?: string): PersistenceError {
    const msg = reason
      ? `Failed to save ${entityType}: ${reason}`
      : `Failed to save ${entityType}`;
    return new PersistenceError(msg);
  }

  static deleteFailed(entityType: string, reason?: string): PersistenceError {
    const msg = reason
      ? `Failed to delete ${entityType}: ${reason}`
      : `Failed to delete ${entityType}`;
    return new PersistenceError(msg);
  }

  static loadFailed(entityType: string, reason?: string): PersistenceError {
    const msg = reason
      ? `Failed to load ${entityType}: ${reason}`
      : `Failed to load ${entityType}`;
    return new PersistenceError(msg);
  }
}
