import { DijkstraAlgorithm } from '@/infrastructure/pathfinding/dijkstra-algorithm';
import { GraphBuilder } from '@/infrastructure/pathfinding/graph-builder';
import { SegmentFilter } from '@/infrastructure/pathfinding/segment-filter';
import {
  SimplifiedSegmentData,
  Graph,
} from '@/infrastructure/pathfinding/types';
import { WeatherCondition } from '@/domain/value-objects';

describe('DijkstraAlgorithm (Integration)', () => {
  let dijkstraAlgorithm: DijkstraAlgorithm;
  let graphBuilder: GraphBuilder;

  beforeEach(() => {
    dijkstraAlgorithm = new DijkstraAlgorithm();
    graphBuilder = new GraphBuilder();
  });

  describe('execute', () => {
    it('should find the shortest path between two directly connected cities', () => {
      const segments: SimplifiedSegmentData[] = [
        {
          fromCity: 'Paris',
          toCity: 'Lyon',
          distance: 465,
          speedLimit: 130,
          estimatedDuration: 3.58,
        },
        {
          fromCity: 'Lyon',
          toCity: 'Paris',
          distance: 465,
          speedLimit: 130,
          estimatedDuration: 3.58,
        },
      ];

      const graph = graphBuilder.build(segments);
      const result = dijkstraAlgorithm.execute(graph, 'Paris', 'Lyon');

      expect(result).not.toBeNull();
      expect(result!.distances.get('Lyon')).toBe(3.58);
      expect(result!.previous.get('Lyon')).toEqual({
        city: 'Paris',
        segment: segments[0],
      });
    });

    it('should find the optimal path through multiple cities', () => {
      const segments: SimplifiedSegmentData[] = [
        // Paris -> Lyon direct (slow route)
        {
          fromCity: 'Paris',
          toCity: 'Lyon',
          distance: 500,
          speedLimit: 90,
          estimatedDuration: 5.5,
        },
        // Paris -> Dijon (fast route part 1)
        {
          fromCity: 'Paris',
          toCity: 'Dijon',
          distance: 310,
          speedLimit: 130,
          estimatedDuration: 2.4,
        },
        // Dijon -> Lyon (fast route part 2)
        {
          fromCity: 'Dijon',
          toCity: 'Lyon',
          distance: 190,
          speedLimit: 130,
          estimatedDuration: 1.5,
        },
      ];

      const graph = graphBuilder.build(segments);
      const result = dijkstraAlgorithm.execute(graph, 'Paris', 'Lyon');

      expect(result).not.toBeNull();
      // The optimal path via Dijon: 2.4 + 1.5 = 3.9 < 5.5
      expect(result!.distances.get('Lyon')).toBeCloseTo(3.9, 1);
      expect(result!.previous.get('Lyon')?.city).toBe('Dijon');
      expect(result!.previous.get('Dijon')?.city).toBe('Paris');
    });

    it('should return null when no path exists', () => {
      const segments: SimplifiedSegmentData[] = [
        {
          fromCity: 'Paris',
          toCity: 'Lyon',
          distance: 465,
          speedLimit: 130,
          estimatedDuration: 3.58,
        },
        // Marseille is isolated
        {
          fromCity: 'Bordeaux',
          toCity: 'Marseille',
          distance: 645,
          speedLimit: 130,
          estimatedDuration: 5.0,
        },
      ];

      const graph = graphBuilder.build(segments);
      const result = dijkstraAlgorithm.execute(graph, 'Paris', 'Marseille');

      expect(result).toBeNull();
    });

    it('should handle same start and end city', () => {
      const segments: SimplifiedSegmentData[] = [
        {
          fromCity: 'Paris',
          toCity: 'Lyon',
          distance: 465,
          speedLimit: 130,
          estimatedDuration: 3.58,
        },
      ];

      const graph = graphBuilder.build(segments);
      const result = dijkstraAlgorithm.execute(graph, 'Paris', 'Paris');

      expect(result).not.toBeNull();
      expect(result!.distances.get('Paris')).toBe(0);
    });

    it('should find optimal route in a complex graph', () => {
      // Create a more complex graph with multiple possible routes
      const segments: SimplifiedSegmentData[] = [
        // Direct path Paris -> Marseille (long)
        {
          fromCity: 'Paris',
          toCity: 'Marseille',
          distance: 775,
          speedLimit: 110,
          estimatedDuration: 7.0,
        },
        // Alternative: Paris -> Lyon
        {
          fromCity: 'Paris',
          toCity: 'Lyon',
          distance: 465,
          speedLimit: 130,
          estimatedDuration: 3.6,
        },
        // Alternative: Lyon -> Marseille
        {
          fromCity: 'Lyon',
          toCity: 'Marseille',
          distance: 315,
          speedLimit: 130,
          estimatedDuration: 2.4,
        },
        // Alternative: Paris -> Toulouse
        {
          fromCity: 'Paris',
          toCity: 'Toulouse',
          distance: 680,
          speedLimit: 130,
          estimatedDuration: 5.2,
        },
        // Alternative: Toulouse -> Marseille
        {
          fromCity: 'Toulouse',
          toCity: 'Marseille',
          distance: 400,
          speedLimit: 130,
          estimatedDuration: 3.1,
        },
      ];

      const graph = graphBuilder.build(segments);
      const result = dijkstraAlgorithm.execute(graph, 'Paris', 'Marseille');

      expect(result).not.toBeNull();
      // Path via Lyon: 3.6 + 2.4 = 6.0 (fastest)
      // Path via Toulouse: 5.2 + 3.1 = 8.3
      // Direct: 7.0
      expect(result!.distances.get('Marseille')).toBeCloseTo(6.0, 1);
      expect(result!.previous.get('Marseille')?.city).toBe('Lyon');
    });
  });
});

describe('GraphBuilder (Integration)', () => {
  let graphBuilder: GraphBuilder;

  beforeEach(() => {
    graphBuilder = new GraphBuilder();
  });

  describe('build', () => {
    it('should build a graph from segments', () => {
      const segments: SimplifiedSegmentData[] = [
        {
          fromCity: 'Paris',
          toCity: 'Lyon',
          distance: 465,
          speedLimit: 130,
          estimatedDuration: 3.58,
        },
        {
          fromCity: 'Paris',
          toCity: 'Marseille',
          distance: 775,
          speedLimit: 110,
          estimatedDuration: 7.0,
        },
        {
          fromCity: 'Lyon',
          toCity: 'Marseille',
          distance: 315,
          speedLimit: 130,
          estimatedDuration: 2.4,
        },
      ];

      const graph = graphBuilder.build(segments);

      expect(graph.size).toBe(2); // Paris and Lyon as source cities
      expect(graph.get('Paris')).toHaveLength(2);
      expect(graph.get('Lyon')).toHaveLength(1);
      expect(graph.has('Marseille')).toBe(false); // No outgoing edges from Marseille
    });

    it('should return an empty graph for empty segments', () => {
      const graph = graphBuilder.build([]);

      expect(graph.size).toBe(0);
    });

    it('should handle segments with same origin city', () => {
      const segments: SimplifiedSegmentData[] = [
        {
          fromCity: 'Paris',
          toCity: 'Lyon',
          distance: 465,
          speedLimit: 130,
          estimatedDuration: 3.58,
        },
        {
          fromCity: 'Paris',
          toCity: 'Bordeaux',
          distance: 585,
          speedLimit: 130,
          estimatedDuration: 4.5,
        },
        {
          fromCity: 'Paris',
          toCity: 'Lille',
          distance: 225,
          speedLimit: 130,
          estimatedDuration: 1.73,
        },
      ];

      const graph = graphBuilder.build(segments);

      expect(graph.get('Paris')).toHaveLength(3);
    });
  });
});

describe('SegmentFilter (Integration)', () => {
  let segmentFilter: SegmentFilter;

  beforeEach(() => {
    segmentFilter = new SegmentFilter();
  });

  describe('filter', () => {
    it('should filter segments by max distance constraint', () => {
      const segments: SimplifiedSegmentData[] = [
        {
          fromCity: 'Paris',
          toCity: 'Lyon',
          distance: 465,
          speedLimit: 130,
          estimatedDuration: 3.58,
        },
        {
          fromCity: 'Paris',
          toCity: 'Marseille',
          distance: 775,
          speedLimit: 110,
          estimatedDuration: 7.0,
        },
        {
          fromCity: 'Paris',
          toCity: 'Lille',
          distance: 225,
          speedLimit: 130,
          estimatedDuration: 1.73,
        },
      ];

      const weatherData = new Map<string, WeatherCondition>();
      const constraints = { maxDistance: 500 };

      const filtered = segmentFilter.filter(segments, weatherData, constraints);

      expect(filtered).toHaveLength(2);
      expect(filtered.map((s) => s.toCity)).toContain('Lyon');
      expect(filtered.map((s) => s.toCity)).toContain('Lille');
      expect(filtered.map((s) => s.toCity)).not.toContain('Marseille');
    });

    it('should filter segments by min speed limit constraint', () => {
      const segments: SimplifiedSegmentData[] = [
        {
          fromCity: 'Paris',
          toCity: 'Lyon',
          distance: 465,
          speedLimit: 130,
          estimatedDuration: 3.58,
        },
        {
          fromCity: 'Paris',
          toCity: 'Suburb',
          distance: 50,
          speedLimit: 90,
          estimatedDuration: 0.55,
        },
        {
          fromCity: 'Paris',
          toCity: 'LocalTown',
          distance: 30,
          speedLimit: 50,
          estimatedDuration: 0.6,
        },
      ];

      const weatherData = new Map<string, WeatherCondition>();
      const constraints = { minSpeedLimit: 100 };

      const filtered = segmentFilter.filter(segments, weatherData, constraints);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].toCity).toBe('Lyon');
    });

    it('should filter segments by excluded weather conditions', () => {
      const segments: SimplifiedSegmentData[] = [
        {
          fromCity: 'Paris',
          toCity: 'Lyon',
          distance: 465,
          speedLimit: 130,
          estimatedDuration: 3.58,
        },
        {
          fromCity: 'Paris',
          toCity: 'Marseille',
          distance: 775,
          speedLimit: 110,
          estimatedDuration: 7.0,
        },
        {
          fromCity: 'Paris',
          toCity: 'Nice',
          distance: 930,
          speedLimit: 130,
          estimatedDuration: 7.2,
        },
      ];

      const weatherData = new Map<string, WeatherCondition>([
        ['Lyon', 'rain'],
        ['Marseille', 'sunny'],
        ['Nice', 'snow'],
      ]);

      const constraints = {
        excludeWeatherConditions: ['rain', 'snow'] as WeatherCondition[],
      };

      const filtered = segmentFilter.filter(segments, weatherData, constraints);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].toCity).toBe('Marseille');
    });

    it('should combine multiple constraints', () => {
      const segments: SimplifiedSegmentData[] = [
        {
          fromCity: 'Paris',
          toCity: 'Lyon',
          distance: 465,
          speedLimit: 130,
          estimatedDuration: 3.58,
        },
        {
          fromCity: 'Paris',
          toCity: 'Marseille',
          distance: 775,
          speedLimit: 130,
          estimatedDuration: 6.0,
        },
        {
          fromCity: 'Paris',
          toCity: 'Suburb',
          distance: 50,
          speedLimit: 90,
          estimatedDuration: 0.55,
        },
        {
          fromCity: 'Paris',
          toCity: 'Nice',
          distance: 400,
          speedLimit: 130,
          estimatedDuration: 3.1,
        },
      ];

      const weatherData = new Map<string, WeatherCondition>([
        ['Lyon', 'sunny'],
        ['Marseille', 'sunny'],
        ['Suburb', 'sunny'],
        ['Nice', 'rain'],
      ]);

      const constraints = {
        maxDistance: 500,
        minSpeedLimit: 100,
        excludeWeatherConditions: ['rain'] as WeatherCondition[],
      };

      const filtered = segmentFilter.filter(segments, weatherData, constraints);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].toCity).toBe('Lyon');
    });

    it('should return all segments when no constraints are provided', () => {
      const segments: SimplifiedSegmentData[] = [
        {
          fromCity: 'Paris',
          toCity: 'Lyon',
          distance: 465,
          speedLimit: 130,
          estimatedDuration: 3.58,
        },
        {
          fromCity: 'Paris',
          toCity: 'Marseille',
          distance: 775,
          speedLimit: 110,
          estimatedDuration: 7.0,
        },
      ];

      const weatherData = new Map<string, WeatherCondition>();

      const filtered = segmentFilter.filter(segments, weatherData);

      expect(filtered).toHaveLength(2);
    });

    it('should return all segments when constraints are empty', () => {
      const segments: SimplifiedSegmentData[] = [
        {
          fromCity: 'Paris',
          toCity: 'Lyon',
          distance: 465,
          speedLimit: 130,
          estimatedDuration: 3.58,
        },
      ];

      const weatherData = new Map<string, WeatherCondition>();
      const constraints = {};

      const filtered = segmentFilter.filter(segments, weatherData, constraints);

      expect(filtered).toHaveLength(1);
    });
  });
});
