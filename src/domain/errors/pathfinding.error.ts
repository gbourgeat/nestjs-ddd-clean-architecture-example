import { DomainError } from './domain.error';

export class NoRouteFoundError extends DomainError {
  readonly code = 'NO_ROUTE_FOUND';

  private constructor(message: string) {
    super(message);
  }

  static betweenCities(startCity: string, endCity: string): NoRouteFoundError {
    return new NoRouteFoundError(
      `No route found between "${startCity}" and "${endCity}"`,
    );
  }
}

export class InvalidGraphError extends DomainError {
  readonly code = 'INVALID_GRAPH';

  private constructor(message: string) {
    super(message);
  }

  static disconnectedGraph(): InvalidGraphError {
    return new InvalidGraphError('The road network graph is disconnected');
  }

  static emptyGraph(): InvalidGraphError {
    return new InvalidGraphError('The road network graph is empty');
  }
}

export type PathfindingError = NoRouteFoundError | InvalidGraphError;
