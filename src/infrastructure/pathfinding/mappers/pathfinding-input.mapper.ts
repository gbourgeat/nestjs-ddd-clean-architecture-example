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
    // Roads are bidirectional, so we create two segments for each RoadSegment
    const simplifiedSegments: SimplifiedSegment[] = [];

    for (const segment of segments) {
      const cityAName = segment.cityA.name.value;
      const cityBName = segment.cityB.name.value;
      const distance = segment.distance.kilometers;
      const speedLimit = segment.speedLimit.kmPerHour;
      const estimatedDuration = segment.estimatedDuration.hours;

      // Direction A -> B
      simplifiedSegments.push({
        fromCity: cityAName,
        toCity: cityBName,
        distance,
        speedLimit,
        estimatedDuration,
      });

      // Direction B -> A
      simplifiedSegments.push({
        fromCity: cityBName,
        toCity: cityAName,
        distance,
        speedLimit,
        estimatedDuration,
      });
    }

    return simplifiedSegments;
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
