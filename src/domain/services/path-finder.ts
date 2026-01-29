import { Duration } from '../value-objects/duration';
import { WeatherCondition } from '../value-objects/weather-condition';
import { RoadSegment } from '../entities/road-segment';
import { CityId } from '../value-objects/city-id';
import { RoadConstraints } from '../value-objects/road-constraints';

export interface PathfindingResult {
  path: string[];
  totalDistance: number;
  estimatedTime: number;
  steps: RouteStep[];
}

export interface RouteStep {
  from: string;
  to: string;
  distance: number;
  speed: number;
  travelTime: Duration;
  weather?: WeatherCondition;
}

export abstract class PathFinder {
  abstract findFastestRoute(
    segments: RoadSegment[],
    startCityId: CityId,
    endCityId: CityId,
    weatherData: Map<string, WeatherCondition>,
    constraints?: RoadConstraints,
  ): PathfindingResult | null;
}
