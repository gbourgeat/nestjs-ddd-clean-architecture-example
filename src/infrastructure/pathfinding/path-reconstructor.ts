import { PreviousCity } from './types';
import { WeatherCondition } from '@/domain/value-objects';

export interface InternalPathfindingResult {
  totalDistance: number;
  estimatedTime: number;
  steps: InternalRouteStep[];
}

export interface InternalRouteStep {
  from: string;
  to: string;
  distance: number;
  speedLimit: number;
  estimatedDuration: number;
  weatherCondition?: WeatherCondition;
}

export class PathReconstructor {
  reconstruct(
    previous: Map<string, PreviousCity>,
    startCity: string,
    endCity: string,
    totalTime: number,
    weatherData: Map<string, WeatherCondition>,
  ): InternalPathfindingResult {
    const path = this.buildPath(previous, startCity, endCity);
    const { steps, totalDistance } = this.buildSteps(
      path,
      previous,
      weatherData,
    );

    return {
      totalDistance,
      estimatedTime: totalTime,
      steps,
    };
  }

  private buildPath(
    previous: Map<string, PreviousCity>,
    fromCity: string,
    toCity: string,
  ): string[] {
    const reversePath: string[] = [];
    let currentCity = toCity;

    while (currentCity !== fromCity) {
      reversePath.push(currentCity);
      const prev = previous.get(currentCity);
      if (!prev) {
        break;
      }
      currentCity = prev.city;
    }

    reversePath.push(fromCity);

    return reversePath.reverse();
  }

  private buildSteps(
    path: string[],
    previous: Map<string, PreviousCity>,
    weatherData: Map<string, WeatherCondition>,
  ): { steps: InternalRouteStep[]; totalDistance: number } {
    const steps: InternalRouteStep[] = [];
    let totalDistance = 0;

    for (let pathIndex = 0; pathIndex < path.length - 1; pathIndex++) {
      const from = path[pathIndex];
      const to = path[pathIndex + 1];
      const prev = previous.get(to);

      if (prev && prev.city === from) {
        const step = this.createStep(prev, weatherData);
        steps.push(step);
        totalDistance += prev.segment.distance;
      }
    }

    return { steps, totalDistance };
  }

  private createStep(
    prev: PreviousCity,
    weatherData: Map<string, WeatherCondition>,
  ): InternalRouteStep {
    return {
      from: prev.segment.fromCity,
      to: prev.segment.toCity,
      distance: prev.segment.distance,
      speedLimit: prev.segment.speedLimit,
      estimatedDuration: prev.segment.estimatedDuration,
      weatherCondition: weatherData.get(prev.segment.toCity),
    };
  }
}
