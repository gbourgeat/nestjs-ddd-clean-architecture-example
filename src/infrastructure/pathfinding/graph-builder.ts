import { Route } from '../../domain/entities';
import { Graph } from './types';

/**
 * Builds graph data structures from routes
 */
export class GraphBuilder {
  /**
   * Builds an adjacency list representation of the graph
   */
  build(routes: Route[]): Graph {
    const graph: Graph = new Map();

    for (const route of routes) {
      this.addRouteToGraph(graph, route);
    }

    return graph;
  }

  /**
   * Adds a route to the graph adjacency list
   */
  private addRouteToGraph(graph: Graph, route: Route): void {
    if (!graph.has(route.from)) {
      graph.set(route.from, []);
    }
    graph.get(route.from)!.push(route);
  }

  /**
   * Extracts all unique cities from the graph
   */
  extractAllCities(graph: Graph): Set<string> {
    const cities = new Set<string>();

    for (const [from, routes] of graph) {
      cities.add(from);
      routes.forEach((route) => cities.add(route.to));
    }

    return cities;
  }
}
