import {
  Graph,
  INFINITE_DISTANCE,
  INITIAL_DISTANCE,
  PreviousCity,
} from './types';
import { RoadSegment } from '../../domain/entities/road-segment';

export class DijkstraAlgorithm {
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

  private extractAllCities(graph: Graph): Set<string> {
    const cities = new Set<string>();

    for (const [from, segments] of graph) {
      cities.add(from);
      segments.forEach((segment) => cities.add(segment.to.name.value));
    }

    return cities;
  }

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

  private updateNeighborDistances(
    graph: Graph,
    currentCity: string,
    distances: Map<string, number>,
    previous: Map<string, PreviousCity>,
    unvisited: Set<string>,
  ): void {
    const neighbors = graph.get(currentCity) || [];

    for (const segment of neighbors) {
      if (!unvisited.has(segment.to.name.value)) {
        continue;
      }

      this.relaxEdge(currentCity, segment, distances, previous);
    }
  }

  private relaxEdge(
    currentCity: string,
    segment: RoadSegment,
    distances: Map<string, number>,
    previous: Map<string, PreviousCity>,
  ): void {
    const newDistance =
      distances.get(currentCity)! + segment.estimatedDuration.hours;
    const currentDistance = distances.get(segment.to.name.value)!;

    if (newDistance < currentDistance) {
      distances.set(segment.to.name.value, newDistance);
      previous.set(segment.to.name.value, { city: currentCity, segment });
    }
  }

  private pathExists(
    previous: Map<string, PreviousCity>,
    startCity: string,
    endCity: string,
  ): boolean {
    return previous.has(endCity) || startCity === endCity;
  }
}
