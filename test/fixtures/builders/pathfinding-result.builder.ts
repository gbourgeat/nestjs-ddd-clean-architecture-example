import { City } from '@/domain/entities';
import { PathfindingResult, RouteStep } from '@/domain/services';
import {
  Distance,
  Duration,
  Speed,
  WeatherCondition,
} from '@/domain/value-objects';

export class RouteStepBuilder {
  private from?: City;
  private to?: City;
  private distance: Distance = Distance.fromKilometersOrThrow(100);
  private speedLimit: Speed = Speed.fromKmPerHourOrThrow(110);
  private estimatedDuration?: Duration;
  private weatherCondition: WeatherCondition = 'clear' as WeatherCondition;

  static aRouteStep(): RouteStepBuilder {
    return new RouteStepBuilder();
  }

  withFrom(city: City): this {
    this.from = city;
    return this;
  }

  withTo(city: City): this {
    this.to = city;
    return this;
  }

  withDistance(kilometers: number): this {
    this.distance = Distance.fromKilometersOrThrow(kilometers);
    return this;
  }

  withSpeedLimit(kmPerHour: number): this {
    this.speedLimit = Speed.fromKmPerHourOrThrow(kmPerHour);
    return this;
  }

  withEstimatedDuration(hours: number): this {
    this.estimatedDuration = Duration.fromHoursOrThrow(hours);
    return this;
  }

  withWeatherCondition(condition: WeatherCondition): this {
    this.weatherCondition = condition;
    return this;
  }

  build(): RouteStep {
    if (!this.from || !this.to) {
      throw new Error('RouteStepBuilder: both from and to cities must be set');
    }

    const duration =
      this.estimatedDuration ||
      Duration.fromDistanceAndSpeedOrThrow(
        this.distance.kilometers,
        this.speedLimit.kmPerHour,
      );

    return {
      from: this.from,
      to: this.to,
      distance: this.distance,
      speedLimit: this.speedLimit,
      estimatedDuration: duration,
      weatherCondition: this.weatherCondition,
    };
  }
}

export class PathfindingResultBuilder {
  private totalDistance?: Distance;
  private estimatedTime?: Duration;
  private steps: RouteStep[] = [];

  static aPathfindingResult(): PathfindingResultBuilder {
    return new PathfindingResultBuilder();
  }

  withTotalDistance(kilometers: number): this {
    this.totalDistance = Distance.fromKilometersOrThrow(kilometers);
    return this;
  }

  withEstimatedTime(hours: number): this {
    this.estimatedTime = Duration.fromHoursOrThrow(hours);
    return this;
  }

  withSteps(...steps: RouteStep[]): this {
    this.steps = steps;
    return this;
  }

  withStep(step: RouteStep): this {
    this.steps.push(step);
    return this;
  }

  build(): PathfindingResult {
    // Auto-calculate if not provided
    const totalDistance =
      this.totalDistance ||
      Distance.fromKilometersOrThrow(
        this.steps.reduce((sum, step) => sum + step.distance.kilometers, 0),
      );

    const estimatedTime =
      this.estimatedTime ||
      Duration.fromHoursOrThrow(
        this.steps.reduce((sum, step) => sum + step.estimatedDuration.hours, 0),
      );

    return {
      totalDistance,
      estimatedTime,
      steps: this.steps,
    };
  }
}
