import { WeatherCondition } from '../../domain/value-objects';
import { PathfindingResult, RouteStep } from '../../domain/services';
import { PreviousCity } from './types';

/**
 * Reconstructs the path from Dijkstra's algorithm results
 */
export class PathReconstructor {
  /**
   * Reconstructs the complete path with all details
   */
  reconstruct(
    previous: Map<string, PreviousCity>,
    startCity: string,
    endCity: string,
    totalTime: number,
    weatherData: Map<string, WeatherCondition>,
  ): PathfindingResult {
    const path = this.buildPath(previous, startCity, endCity);
    const { steps, totalDistance } = this.buildSteps(
      path,
      previous,
      weatherData,
    );

    return {
      path,
      totalDistance,
      estimatedTime: totalTime,
      steps,
    };
  }

  /**
   * Builds the path array by backtracking from end to start
   */
  private buildPath(
    previous: Map<string, PreviousCity>,
    startCity: string,
    endCity: string,
  ): string[] {
    const reversePath: string[] = [];
    let currentCity = endCity;

    while (currentCity !== startCity) {
      reversePath.push(currentCity);
      const prev = previous.get(currentCity);
      if (!prev) {
        break;
      }
      currentCity = prev.city;
    }

    reversePath.push(startCity);

    return reversePath.reverse();
  }

  /**
   * Builds route steps with distance and weather information
   */
  private buildSteps(
    path: string[],
    previous: Map<string, PreviousCity>,
    weatherData: Map<string, WeatherCondition>,
  ): { steps: RouteStep[]; totalDistance: number } {
    const steps: RouteStep[] = [];
    let totalDistance = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const prev = previous.get(to);

      if (prev && prev.city === from) {
        const step = this.createStep(prev, weatherData);
        steps.push(step);
        totalDistance += prev.route.distance;
      }
    }

    return { steps, totalDistance };
  }

  /**
   * Creates a route step with all necessary information
   */
  private createStep(
    prev: PreviousCity,
    weatherData: Map<string, WeatherCondition>,
  ): RouteStep {
    return {
      from: prev.route.from,
      to: prev.route.to,
      distance: prev.route.distance,
      speed: prev.route.speed,
      travelTime: prev.route.travelTime,
      weather: weatherData.get(prev.route.to),
    };
  }
}
