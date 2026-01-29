import { PreviousCity } from './types';
import { WeatherCondition } from '../../domain/value-objects/weather-condition';
import {
  PathfindingResult,
  RouteStep,
} from '../../domain/services/path-finder';

export class PathReconstructor {
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

  private buildSteps(
    path: string[],
    previous: Map<string, PreviousCity>,
    weatherData: Map<string, WeatherCondition>,
  ): { steps: RouteStep[]; totalDistance: number } {
    const steps: RouteStep[] = [];
    let totalDistance = 0;

    for (let pathIndex = 0; pathIndex < path.length - 1; pathIndex++) {
      const from = path[pathIndex];
      const to = path[pathIndex + 1];
      const prev = previous.get(to);

      if (prev && prev.city === from) {
        const step = this.createStep(prev, weatherData);
        steps.push(step);
        totalDistance += prev.segment.distance.kilometers;
      }
    }

    return { steps, totalDistance };
  }

  private createStep(
    prev: PreviousCity,
    weatherData: Map<string, WeatherCondition>,
  ): RouteStep {
    return {
      from: prev.segment.cities.name.value,
      to: prev.segment.to.name.value,
      distance: prev.segment.distance.kilometers,
      speed: prev.segment.speedLimit.kmPerHour,
      travelTime: prev.segment.estimatedDuration,
      weather: weatherData.get(prev.segment.to.name.value),
    };
  }
}
