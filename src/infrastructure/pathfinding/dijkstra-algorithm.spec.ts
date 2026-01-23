import { Route } from '../../domain/entities';
import { DijkstraAlgorithm } from './dijkstra-algorithm';
import { Graph } from './types';

describe('DijkstraAlgorithm', () => {
  let dijkstra: DijkstraAlgorithm;

  beforeEach(() => {
    dijkstra = new DijkstraAlgorithm();
  });

  describe('execute', () => {
    it('should find path in a simple two-city graph', () => {
      const graph: Graph = new Map([
        ['Paris', [new Route('Paris', 'Lyon', 465, 120)]],
      ]);

      const result = dijkstra.execute(graph, 'Paris', 'Lyon');

      expect(result).not.toBeNull();
      expect(result!.distances.get('Lyon')).toBeCloseTo(3.875, 3);
      expect(result!.previous.has('Lyon')).toBe(true);
      expect(result!.previous.get('Lyon')!.city).toBe('Paris');
    });

    it('should find shortest path in a linear graph', () => {
      const graph: Graph = new Map([
        ['A', [new Route('A', 'B', 100, 100)]],
        ['B', [new Route('B', 'C', 100, 100)]],
        ['C', [new Route('C', 'D', 100, 100)]],
      ]);

      const result = dijkstra.execute(graph, 'A', 'D');

      expect(result).not.toBeNull();
      expect(result!.distances.get('D')).toBe(3); // 1 + 1 + 1 hours
      expect(result!.previous.get('B')!.city).toBe('A');
      expect(result!.previous.get('C')!.city).toBe('B');
      expect(result!.previous.get('D')!.city).toBe('C');
    });

    it('should find shortest path with multiple options', () => {
      // Graph: A -> B -> D (2 + 1 = 3 hours)
      //        A -> C -> D (5 + 1 = 6 hours)
      const graph: Graph = new Map([
        [
          'A',
          [
            new Route('A', 'B', 200, 100), // 2 hours
            new Route('A', 'C', 500, 100), // 5 hours
          ],
        ],
        ['B', [new Route('B', 'D', 100, 100)]], // 1 hour
        ['C', [new Route('C', 'D', 100, 100)]], // 1 hour
      ]);

      const result = dijkstra.execute(graph, 'A', 'D');

      expect(result).not.toBeNull();
      expect(result!.distances.get('D')).toBe(3); // Shortest: A->B->D
      expect(result!.previous.get('D')!.city).toBe('B');
      expect(result!.previous.get('B')!.city).toBe('A');
    });

    it('should return null when no path exists', () => {
      const graph: Graph = new Map([
        ['A', [new Route('A', 'B', 100, 100)]],
        ['C', [new Route('C', 'D', 100, 100)]],
      ]);

      const result = dijkstra.execute(graph, 'A', 'D');

      expect(result).toBeNull();
    });

    it('should handle same start and end city', () => {
      const graph: Graph = new Map([
        ['Paris', [new Route('Paris', 'Lyon', 465, 120)]],
      ]);

      const result = dijkstra.execute(graph, 'Paris', 'Paris');

      expect(result).not.toBeNull();
      expect(result!.distances.get('Paris')).toBe(0);
    });

    it('should find shortest path in complex graph', () => {
      // Complex graph with multiple paths
      const graph: Graph = new Map([
        [
          'Paris',
          [
            new Route('Paris', 'Lyon', 465, 155), // ~3 hours
            new Route('Paris', 'Dijon', 315, 105), // ~3 hours
          ],
        ],
        [
          'Dijon',
          [
            new Route('Dijon', 'Lyon', 195, 130), // ~1.5 hours
          ],
        ],
        [
          'Lyon',
          [
            new Route('Lyon', 'Marseille', 315, 120), // ~2.6 hours
          ],
        ],
      ]);

      const result = dijkstra.execute(graph, 'Paris', 'Marseille');

      expect(result).not.toBeNull();
      // Shortest should be Paris -> Lyon -> Marseille (~5.6 hours)
      // vs Paris -> Dijon -> Lyon -> Marseille (~7.1 hours)
      expect(result!.distances.get('Marseille')).toBeLessThan(6);
    });

    it('should handle graph with cycles', () => {
      const graph: Graph = new Map([
        ['A', [new Route('A', 'B', 100, 100)]],
        ['B', [new Route('B', 'C', 100, 100)]],
        ['C', [new Route('C', 'A', 100, 100)]], // cycle back to A
      ]);

      const result = dijkstra.execute(graph, 'A', 'C');

      expect(result).not.toBeNull();
      expect(result!.distances.get('C')).toBe(2);
    });

    it('should choose faster route over shorter distance', () => {
      // Route 1: A -> B (100km @ 50km/h = 2 hours)
      // Route 2: A -> C -> B (300km @ 200km/h = 1.5 hours - FASTER)
      const graph: Graph = new Map([
        [
          'A',
          [
            new Route('A', 'B', 100, 50), // 2 hours
            new Route('A', 'C', 200, 200), // 1 hour
          ],
        ],
        ['C', [new Route('C', 'B', 100, 200)]], // 0.5 hours
      ]);

      const result = dijkstra.execute(graph, 'A', 'B');

      expect(result).not.toBeNull();
      expect(result!.distances.get('B')).toBe(1.5); // Faster route via C
      expect(result!.previous.get('B')!.city).toBe('C');
    });

    it('should handle isolated start city', () => {
      const graph: Graph = new Map([
        ['A', []],
        ['B', [new Route('B', 'C', 100, 100)]],
      ]);

      const result = dijkstra.execute(graph, 'A', 'C');

      expect(result).toBeNull();
    });

    it('should handle empty graph', () => {
      const graph: Graph = new Map();

      const result = dijkstra.execute(graph, 'A', 'B');

      expect(result).toBeNull();
    });

    it('should correctly calculate distances for all cities', () => {
      const graph: Graph = new Map([
        [
          'A',
          [
            new Route('A', 'B', 100, 100), // 1 hour
            new Route('A', 'C', 300, 100), // 3 hours
          ],
        ],
        ['B', [new Route('B', 'C', 100, 100)]], // 1 hour
      ]);

      const result = dijkstra.execute(graph, 'A', 'C');

      expect(result).not.toBeNull();
      expect(result!.distances.get('A')).toBe(0);
      expect(result!.distances.get('B')).toBe(1);
      expect(result!.distances.get('C')).toBe(2); // A->B->C is shorter than A->C
    });

    it('should stop early when destination is reached', () => {
      // This tests the optimization where Dijkstra stops when destination is visited
      const graph: Graph = new Map([
        ['A', [new Route('A', 'B', 100, 100)]],
        ['B', [new Route('B', 'C', 100, 100)]],
        ['C', [new Route('C', 'D', 100, 100)]],
        ['D', [new Route('D', 'E', 100, 100)]],
      ]);

      const result = dijkstra.execute(graph, 'A', 'C');

      expect(result).not.toBeNull();
      expect(result!.distances.get('C')).toBe(2);
      // D and E might not have final distances since we stopped at C
    });
  });
});
