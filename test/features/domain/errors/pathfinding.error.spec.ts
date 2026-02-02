import {
  InvalidGraphError,
  NoRouteFoundError,
} from '@/domain/errors/pathfinding.error';

describe('PathfindingError', () => {
  describe('NoRouteFoundError', () => {
    it('should create error with correct message for cities', () => {
      const error = NoRouteFoundError.betweenCities('Paris', 'Lyon');

      expect(error.message).toBe('No route found between "Paris" and "Lyon"');
      expect(error.code).toBe('NO_ROUTE_FOUND');
      expect(error.name).toBe('NoRouteFoundError');
    });
  });

  describe('InvalidGraphError', () => {
    it('should create error for disconnected graph', () => {
      const error = InvalidGraphError.disconnectedGraph();

      expect(error.message).toBe('The road network graph is disconnected');
      expect(error.code).toBe('INVALID_GRAPH');
      expect(error.name).toBe('InvalidGraphError');
    });

    it('should create error for empty graph', () => {
      const error = InvalidGraphError.emptyGraph();

      expect(error.message).toBe('The road network graph is empty');
      expect(error.code).toBe('INVALID_GRAPH');
      expect(error.name).toBe('InvalidGraphError');
    });
  });
});
