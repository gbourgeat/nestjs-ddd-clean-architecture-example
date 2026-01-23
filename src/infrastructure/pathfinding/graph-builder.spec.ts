import { Route } from '../../domain/entities';
import { GraphBuilder } from './graph-builder';

describe('GraphBuilder', () => {
  let graphBuilder: GraphBuilder;

  beforeEach(() => {
    graphBuilder = new GraphBuilder();
  });

  describe('build', () => {
    it('should build an empty graph from no routes', () => {
      const routes: Route[] = [];

      const graph = graphBuilder.build(routes);

      expect(graph.size).toBe(0);
    });

    it('should build a graph with one route', () => {
      const routes = [new Route('Paris', 'Lyon', 465, 120)];

      const graph = graphBuilder.build(routes);

      expect(graph.size).toBe(1);
      expect(graph.has('Paris')).toBe(true);
      expect(graph.get('Paris')).toHaveLength(1);
      expect(graph.get('Paris')![0]).toBe(routes[0]);
    });

    it('should build a graph with multiple routes from same city', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Paris', 'Marseille', 775, 120),
        new Route('Paris', 'Lille', 225, 130),
      ];

      const graph = graphBuilder.build(routes);

      expect(graph.size).toBe(1);
      expect(graph.has('Paris')).toBe(true);
      expect(graph.get('Paris')).toHaveLength(3);
      expect(graph.get('Paris')).toEqual(routes);
    });

    it('should build a graph with routes from different cities', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Lyon', 'Marseille', 315, 120),
        new Route('Lille', 'Paris', 225, 130),
      ];

      const graph = graphBuilder.build(routes);

      expect(graph.size).toBe(3);
      expect(graph.has('Paris')).toBe(true);
      expect(graph.has('Lyon')).toBe(true);
      expect(graph.has('Lille')).toBe(true);
      expect(graph.get('Paris')).toHaveLength(1);
      expect(graph.get('Lyon')).toHaveLength(1);
      expect(graph.get('Lille')).toHaveLength(1);
    });

    it('should build a complex graph', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Paris', 'Lille', 225, 130),
        new Route('Lyon', 'Marseille', 315, 120),
        new Route('Lyon', 'Nice', 470, 110),
        new Route('Lille', 'Paris', 225, 130),
      ];

      const graph = graphBuilder.build(routes);

      expect(graph.size).toBe(3);
      expect(graph.get('Paris')).toHaveLength(2);
      expect(graph.get('Lyon')).toHaveLength(2);
      expect(graph.get('Lille')).toHaveLength(1);
    });

    it('should preserve route order', () => {
      const routes = [
        new Route('Paris', 'A', 100, 100),
        new Route('Paris', 'B', 200, 100),
        new Route('Paris', 'C', 300, 100),
      ];

      const graph = graphBuilder.build(routes);
      const parisRoutes = graph.get('Paris')!;

      expect(parisRoutes[0].to).toBe('A');
      expect(parisRoutes[1].to).toBe('B');
      expect(parisRoutes[2].to).toBe('C');
    });
  });

  describe('extractAllCities', () => {
    it('should extract cities from empty graph', () => {
      const graph = new Map();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const cities = graphBuilder.extractAllCities(graph);

      expect(cities.size).toBe(0);
    });

    it('should extract all unique cities from graph', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Lyon', 'Marseille', 315, 120),
      ];
      const graph = graphBuilder.build(routes);

      const cities = graphBuilder.extractAllCities(graph);

      expect(cities.size).toBe(3);
      expect(cities.has('Paris')).toBe(true);
      expect(cities.has('Lyon')).toBe(true);
      expect(cities.has('Marseille')).toBe(true);
    });

    it('should not duplicate cities', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Paris', 'Marseille', 775, 120),
        new Route('Lyon', 'Marseille', 315, 120),
      ];
      const graph = graphBuilder.build(routes);

      const cities = graphBuilder.extractAllCities(graph);

      expect(cities.size).toBe(3);
      expect(cities.has('Paris')).toBe(true);
      expect(cities.has('Lyon')).toBe(true);
      expect(cities.has('Marseille')).toBe(true);
    });

    it('should include cities that only appear as destinations', () => {
      const routes = [
        new Route('Paris', 'Lyon', 465, 120),
        new Route('Paris', 'Marseille', 775, 120),
      ];
      const graph = graphBuilder.build(routes);

      const cities = graphBuilder.extractAllCities(graph);

      expect(cities.size).toBe(3);
      expect(cities.has('Paris')).toBe(true);
      expect(cities.has('Lyon')).toBe(true);
      expect(cities.has('Marseille')).toBe(true);
    });
  });
});
