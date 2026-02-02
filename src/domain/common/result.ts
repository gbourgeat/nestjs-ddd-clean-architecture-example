export interface Success<T> {
  readonly success: true;
  readonly value: T;
}

export interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

export type Result<T, E> = Success<T> | Failure<E>;

export function ok<T>(value: T): Success<T> {
  return { success: true, value };
}

export function fail<E>(error: E): Failure<E> {
  return { success: false, error };
}

export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success === true;
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.success === false;
}
