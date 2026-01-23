import { Route } from '../../domain/entities';
import {
  Graph,
  INFINITE_DISTANCE,
  INITIAL_DISTANCE,
  PreviousCity,
} from './types';

/**
 * Implements Dijkstra's algorithm for shortest path finding
 * Simple and clear implementation focused on correctness
 */
export class DijkstraAlgorithm {
  /**
   * Finds the shortest path (by travel time) between two cities
   */
  execute(
    graph: Graph,
    startCity: string,
    endCity: string,
  ): {
    distances: Map<string, number>;
    previous: Map<string, PreviousCity>;
  } | null {
    const distances = new Map<string, number>();
    const previous = new Map<string, PreviousCity>();
    const unvisited = new Set<string>();

    this.initialize(graph, startCity, distances, unvisited);
    this.executeLoop(graph, endCity, distances, previous, unvisited);

    if (!this.pathExists(previous, startCity, endCity)) {
      return null;
    }

    return { distances, previous };
  }

  /**
   * Initializes data structures for Dijkstra algorithm
   */
  private initialize(
    graph: Graph,
    startCity: string,
    distances: Map<string, number>,
    unvisited: Set<string>,
  ): void {
    const allCities = this.extractAllCities(graph);

    for (const city of allCities) {
      const distance =
        city === startCity ? INITIAL_DISTANCE : INFINITE_DISTANCE;
      distances.set(city, distance);
      unvisited.add(city);
    }
  }

  /**
   * Extracts all unique cities from the graph
   */
  private extractAllCities(graph: Graph): Set<string> {
    const cities = new Set<string>();

    for (const [from, routes] of graph) {
      cities.add(from);
      routes.forEach((route) => cities.add(route.to));
    }

    return cities;
  }

  /**
   * Main Dijkstra loop to find shortest paths
   */
  private executeLoop(
    graph: Graph,
    endCity: string,
    distances: Map<string, number>,
    previous: Map<string, PreviousCity>,
    unvisited: Set<string>,
  ): void {
    while (unvisited.size > 0) {
      const currentCity = this.findCityWithMinDistance(unvisited, distances);

      if (this.shouldStop(currentCity, distances, endCity)) {
        break;
      }

      unvisited.delete(currentCity!);

      this.updateNeighborDistances(
        graph,
        currentCity!,
        distances,
        previous,
        unvisited,
      );
    }
  }

  /**
   * Finds the unvisited city with minimum distance
   */
  private findCityWithMinDistance(
    unvisited: Set<string>,
    distances: Map<string, number>,
  ): string | null {
    let cityWithMinDistance: string | null = null;
    let minDistance = INFINITE_DISTANCE;

    for (const city of unvisited) {
      const distance = distances.get(city)!;
      if (distance < minDistance) {
        minDistance = distance;
        cityWithMinDistance = city;
      }
    }

    return cityWithMinDistance;
  }

  /**
   * Determines if Dijkstra should stop early
   */
  private shouldStop(
    currentCity: string | null,
    distances: Map<string, number>,
    endCity: string,
  ): boolean {
    if (currentCity === null) {
      return true;
    }

    const currentDistance = distances.get(currentCity)!;
    if (currentDistance === INFINITE_DISTANCE) {
      return true;
    }

    return currentCity === endCity;
  }

  /**
   * Updates distances for all neighbors of current city
   */
  private updateNeighborDistances(
    graph: Graph,
    currentCity: string,
    distances: Map<string, number>,
    previous: Map<string, PreviousCity>,
    unvisited: Set<string>,
  ): void {
    const neighbors = graph.get(currentCity) || [];

    for (const route of neighbors) {
      if (!unvisited.has(route.to)) {
        continue;
      }

      this.relaxEdge(currentCity, route, distances, previous);
    }
  }

  /**
   * Relaxes an edge (updates distance if a shorter path is found)
   */
  private relaxEdge(
    currentCity: string,
    route: Route,
    distances: Map<string, number>,
    previous: Map<string, PreviousCity>,
  ): void {
    const newDistance = distances.get(currentCity)! + route.travelTime;
    const currentDistance = distances.get(route.to)!;

    if (newDistance < currentDistance) {
      distances.set(route.to, newDistance);
      previous.set(route.to, { city: currentCity, route });
    }
  }

  /**
   * Checks if a path exists between start and end
   */
  private pathExists(
    previous: Map<string, PreviousCity>,
    startCity: string,
    endCity: string,
  ): boolean {
    return previous.has(endCity) || startCity === endCity;
  }
}
