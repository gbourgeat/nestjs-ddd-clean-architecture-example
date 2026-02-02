import { InvalidWeatherConditionError } from '@/domain/errors';
import {
  Distance,
  RoadConstraints,
  Speed,
  VALID_WEATHER_CONDITIONS,
  WeatherCondition,
  isWeatherCondition,
} from '@/domain/value-objects';

export class RoadConstraintsMapper {
  static toDomain(constraints?: {
    excludeWeatherConditions?: string[];
    maxDistance?: number;
    minSpeedLimit?: number;
  }): RoadConstraints | undefined {
    if (!constraints) {
      return undefined;
    }

    const excludeWeatherConditions = constraints.excludeWeatherConditions
      ? this.parseWeatherConditions(constraints.excludeWeatherConditions)
      : undefined;

    const maxDistance = constraints.maxDistance
      ? Distance.fromKilometersOrThrow(constraints.maxDistance)
      : undefined;

    const minSpeedLimit = constraints.minSpeedLimit
      ? Speed.fromKmPerHourOrThrow(constraints.minSpeedLimit)
      : undefined;

    return new RoadConstraints(
      excludeWeatherConditions,
      maxDistance,
      minSpeedLimit,
    );
  }

  private static parseWeatherConditions(
    conditions: string[],
  ): WeatherCondition[] {
    const validatedConditions: WeatherCondition[] = [];

    for (const condition of conditions) {
      if (!isWeatherCondition(condition)) {
        throw InvalidWeatherConditionError.forInvalidCondition(
          condition,
          VALID_WEATHER_CONDITIONS,
        );
      }

      validatedConditions.push(condition);
    }

    return validatedConditions;
  }
}
