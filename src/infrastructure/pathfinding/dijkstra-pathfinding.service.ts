import { Injectable } from '@nestjs/common';
import { Route } from '../../domain/entities';
import { PathfindingResult, PathfindingService } from '../../domain/services';
import { RouteConstraints, WeatherCondition } from '../../domain/value-objects';
import { DijkstraAlgorithm } from './dijkstra-algorithm';
import { GraphBuilder } from './graph-builder';
import { PathReconstructor } from './path-reconstructor';
import { RouteFilter } from './route-filter';

/**
 * Concrete implementation of PathfindingService using Dijkstra's algorithm
 * This is the infrastructure layer implementation
 */
@Injectable()
export class DijkstraPathfindingService implements PathfindingService {
  private readonly routeFilter = new RouteFilter();
  private readonly graphBuilder = new GraphBuilder();
  private readonly dijkstraAlgorithm = new DijkstraAlgorithm();
  private readonly pathReconstructor = new PathReconstructor();

  /**
   * Finds the fastest route between two cities
   * @param routes - Available routes in the graph
   * @param startCity - Starting city name
   * @param endCity - Destination city name
   * @param weatherData - Map of city names to their weather conditions
   * @param constraints - Optional route constraints (weather, distance, speed)
   * @returns PathfindingResult or null if no path exists
   */
  findFastestRoute(
    routes: Route[],
    startCity: string,
    endCity: string,
    weatherData: Map<string, WeatherCondition>,
    constraints?: RouteConstraints,
  ): PathfindingResult | null {
    const validRoutes = this.routeFilter.filter(
      routes,
      weatherData,
      constraints,
    );

    const graph = this.graphBuilder.build(validRoutes);

    const result = this.dijkstraAlgorithm.execute(graph, startCity, endCity);

    if (!result) {
      return null;
    }

    const totalTime = result.distances.get(endCity) || 0;

    return this.pathReconstructor.reconstruct(
      result.previous,
      startCity,
      endCity,
      totalTime,
      weatherData,
    );
  }
}
