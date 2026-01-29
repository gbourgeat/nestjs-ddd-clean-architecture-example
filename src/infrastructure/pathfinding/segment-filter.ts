import { RoadSegment } from '../../domain/entities/road-segment';
import { WeatherCondition } from '../../domain/value-objects/weather-condition';
import { RoadConstraints } from '../../domain/value-objects/road-constraints';

export class SegmentFilter {
  filter(
    segments: RoadSegment[],
    weatherData: Map<string, WeatherCondition>,
    constraints?: RoadConstraints,
  ): RoadSegment[] {
    if (!constraints) {
      return segments;
    }

    return segments.filter((segment) =>
      this.isSegmentValid(segment, weatherData, constraints),
    );
  }

  private isSegmentValid(
    segment: RoadSegment,
    weatherData: Map<string, WeatherCondition>,
    constraints: RoadConstraints,
  ): boolean {
    return (
      this.isDistanceValid(segment, constraints) &&
      this.isSpeedValid(segment, constraints) &&
      this.isWeatherValid(segment, weatherData, constraints)
    );
  }

  private isDistanceValid(
    segment: RoadSegment,
    constraints: RoadConstraints,
  ): boolean {
    if (!constraints.maxDistance) {
      return true;
    }

    return segment.distance.kilometers <= constraints.maxDistance;
  }

  private isSpeedValid(
    segment: RoadSegment,
    constraints: RoadConstraints,
  ): boolean {
    if (!constraints.minSpeedLimit) {
      return true;
    }

    return segment.speedLimit.kmPerHour >= constraints.minSpeedLimit;
  }

  private isWeatherValid(
    segment: RoadSegment,
    weatherData: Map<string, WeatherCondition>,
    constraints: RoadConstraints,
  ): boolean {
    if (
      !constraints.excludeWeatherConditions ||
      constraints.excludeWeatherConditions.length === 0
    ) {
      return true;
    }

    const destinationWeather = weatherData.get(segment.to.name.value);
    if (!destinationWeather) {
      return true;
    }

    return !constraints.excludeWeatherConditions.includes(destinationWeather);
  }
}
