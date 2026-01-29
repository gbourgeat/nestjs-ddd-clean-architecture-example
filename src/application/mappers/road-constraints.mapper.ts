import {
  RoadConstraints,
  Distance,
  Speed,
  WeatherCondition,
  isWeatherCondition,
  VALID_WEATHER_CONDITIONS,
} from '@/domain/value-objects';
import { InvalidWeatherConditionError } from '@/domain/errors';

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
      ? Distance.fromKilometers(constraints.maxDistance)
      : undefined;

    const minSpeedLimit = constraints.minSpeedLimit
      ? Speed.fromKmPerHour(constraints.minSpeedLimit)
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
