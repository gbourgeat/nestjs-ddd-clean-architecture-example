import { GetFastestRoadOutput } from '@/application/use-cases/get-fastest-route';
import { GetFastestRouteResponse } from '@/presentation/rest-api/responses';
import { RouteStep } from '@/presentation/rest-api/schemas';

export class RouteResponseMapper {
  static toDto(output: GetFastestRoadOutput): GetFastestRouteResponse {
    if (!output.steps.length) {
      return {
        path: [],
      };
    }

    return {
      path: this.buildPath(output.steps),
      totalDistance: output.totalDistance,
      estimatedTime: output.estimatedDuration,
      steps: output.steps.map((step) => this.mapStep(step)),
    };
  }

  private static buildPath(steps: GetFastestRoadOutput['steps']): string[] {
    if (steps.length === 0) {
      return [];
    }

    const path: string[] = [steps[0].fromCity];

    for (const step of steps) {
      path.push(step.toCity);
    }

    return path;
  }

  private static mapStep(step: {
    fromCity: string;
    toCity: string;
    distance: number;
    speedLimit: number;
    weatherCondition: string;
  }): RouteStep {
    const dto = new RouteStep();
    dto.from = step.fromCity;
    dto.to = step.toCity;
    dto.distance = step.distance;
    dto.speed = step.speedLimit;
    dto.weather = step.weatherCondition;

    return dto;
  }
}
