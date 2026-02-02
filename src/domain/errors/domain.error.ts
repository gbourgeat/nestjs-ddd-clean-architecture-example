export abstract class DomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  toString(): string {
    return `[${this.code}] ${this.message}`;
  }
}
