import { RoadConstraints, WeatherCondition } from '@/domain/value-objects';
import { City, RoadSegment } from '@/domain/entities';

export interface SimplifiedSegment {
  fromCity: string;
  toCity: string;
  distance: number;
  speedLimit: number;
  estimatedDuration: number;
}

export interface SimplifiedConstraints {
  maxDistance?: number;
  minSpeedLimit?: number;
  excludeWeatherConditions?: WeatherCondition[];
}

export class PathfindingInputMapper {
  static toSimplifiedSegments(segments: RoadSegment[]): SimplifiedSegment[] {
    return segments.map((segment) => ({
      fromCity: segment.cityA.name.value,
      toCity: segment.cityB.name.value,
      distance: segment.distance.kilometers,
      speedLimit: segment.speedLimit.kmPerHour,
      estimatedDuration: segment.estimatedDuration.hours,
    }));
  }

  static toSimplifiedCityName(city: City): string {
    return city.name.value;
  }

  static toSimplifiedConstraints(
    constraints?: RoadConstraints,
  ): SimplifiedConstraints | undefined {
    if (!constraints) {
      return undefined;
    }

    return {
      maxDistance: constraints.maxDistance?.kilometers,
      minSpeedLimit: constraints.minSpeedLimit?.kmPerHour,
      excludeWeatherConditions: constraints.excludeWeatherConditions,
    };
  }
}
