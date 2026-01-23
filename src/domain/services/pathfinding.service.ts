import { Route } from '../entities';
import { RouteConstraints, WeatherCondition } from '../value-objects';

/**
 * Result of a pathfinding operation
 */
export interface PathfindingResult {
  path: string[];
  totalDistance: number;
  estimatedTime: number;
  steps: RouteStep[];
}

/**
 * Individual step in a route path
 */
export interface RouteStep {
  from: string;
  to: string;
  distance: number;
  speed: number;
  travelTime: number;
  weather?: WeatherCondition;
}

/**
 * Domain service interface for pathfinding
 * Implementation is in infrastructure layer
 */
export interface PathfindingService {
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
  ): PathfindingResult | null;
}
