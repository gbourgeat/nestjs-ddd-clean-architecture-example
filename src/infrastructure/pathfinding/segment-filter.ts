import { SimplifiedSegmentData } from './types';
import { WeatherCondition } from '@/domain/value-objects';

export interface SimplifiedConstraints {
  maxDistance?: number;
  minSpeedLimit?: number;
  excludeWeatherConditions?: WeatherCondition[];
}

export class SegmentFilter {
  filter(
    segments: SimplifiedSegmentData[],
    weatherData: Map<string, WeatherCondition>,
    constraints?: SimplifiedConstraints,
  ): SimplifiedSegmentData[] {
    if (!constraints) {
      return segments;
    }

    return segments.filter((segment) =>
      this.isSegmentValid(segment, weatherData, constraints),
    );
  }

  private isSegmentValid(
    segment: SimplifiedSegmentData,
    weatherData: Map<string, WeatherCondition>,
    constraints: SimplifiedConstraints,
  ): boolean {
    return (
      this.isDistanceValid(segment, constraints) &&
      this.isSpeedValid(segment, constraints) &&
      this.isWeatherValid(segment, weatherData, constraints)
    );
  }

  private isDistanceValid(
    segment: SimplifiedSegmentData,
    constraints: SimplifiedConstraints,
  ): boolean {
    if (!constraints.maxDistance) {
      return true;
    }

    return segment.distance <= constraints.maxDistance;
  }

  private isSpeedValid(
    segment: SimplifiedSegmentData,
    constraints: SimplifiedConstraints,
  ): boolean {
    if (!constraints.minSpeedLimit) {
      return true;
    }

    return segment.speedLimit >= constraints.minSpeedLimit;
  }

  private isWeatherValid(
    segment: SimplifiedSegmentData,
    weatherData: Map<string, WeatherCondition>,
    constraints: SimplifiedConstraints,
  ): boolean {
    if (
      !constraints.excludeWeatherConditions ||
      constraints.excludeWeatherConditions.length === 0
    ) {
      return true;
    }

    const destinationWeather = weatherData.get(segment.toCity);
    if (!destinationWeather) {
      return true;
    }

    return !constraints.excludeWeatherConditions.includes(destinationWeather);
  }
}
