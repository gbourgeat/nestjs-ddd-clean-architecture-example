import { City } from '@/domain/entities';
import { PathfindingResult, RouteStep } from '@/domain/services';
import {
  CityId,
  CityName,
  Distance,
  Duration,
  Speed,
  WeatherCondition,
} from '@/domain/value-objects';

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

export class PathfindingOutputMapper {
  static toDomainResult(
    internalResult: InternalPathfindingResult,
    cityMapping: Map<string, City>,
  ): PathfindingResult {
    return {
      totalDistance: Distance.fromKilometers(internalResult.totalDistance),
      estimatedTime: Duration.fromHours(internalResult.estimatedTime),
      steps: internalResult.steps.map((step) =>
        this.toDomainStep(step, cityMapping),
      ),
    };
  }

  private static toDomainStep(
    internalStep: InternalRouteStep,
    cityMapping: Map<string, City>,
  ): RouteStep {
    const fromCity =
      cityMapping.get(internalStep.from) ||
      this.createDefaultCity(internalStep.from);
    const toCity =
      cityMapping.get(internalStep.to) ||
      this.createDefaultCity(internalStep.to);

    return {
      from: fromCity,
      to: toCity,
      distance: Distance.fromKilometers(internalStep.distance),
      speedLimit: Speed.fromKmPerHour(internalStep.speedLimit),
      estimatedDuration: Duration.fromHours(internalStep.estimatedDuration),
      weatherCondition: internalStep.weatherCondition || 'sunny',
    };
  }

  private static createDefaultCity(cityName: string): City {
    const name = CityName.fromString(cityName);
    return City.reconstitute(CityId.generate(), name);
  }
}
