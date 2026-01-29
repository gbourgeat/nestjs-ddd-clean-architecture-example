import { RouteStep } from '@/domain/services';

export class RouteStepMapper {
  static toOutput(step: RouteStep): {
    fromCity: string;
    toCity: string;
    distance: number;
    speedLimit: number;
    weatherCondition: string;
  } {
    return {
      fromCity: step.from.name.value,
      toCity: step.to.name.value,
      distance: step.distance.kilometers,
      speedLimit: step.speedLimit.kmPerHour,
      weatherCondition: step.weatherCondition,
    };
  }

  static toOutputArray(steps: RouteStep[]): Array<{
    fromCity: string;
    toCity: string;
    distance: number;
    speedLimit: number;
    weatherCondition: string;
  }> {
    return steps.map((step: RouteStep) => this.toOutput(step));
  }
}
