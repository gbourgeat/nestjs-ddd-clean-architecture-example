import { City, RoadSegment } from '@/domain/entities';
import {
  Distance,
  Duration,
  RoadConstraints,
  Speed,
  WeatherCondition,
} from '@/domain/value-objects';

export interface PathfindingResult {
  totalDistance: Distance;
  estimatedTime: Duration;
  steps: RouteStep[];
}

export interface RouteStep {
  from: City;
  to: City;
  distance: Distance;
  speedLimit: Speed;
  estimatedDuration: Duration;
  weatherCondition: WeatherCondition;
}

export abstract class PathFinder {
  abstract findFastestRoute(
    segments: RoadSegment[],
    startCity: City,
    endCity: City,
    constraints?: RoadConstraints,
  ): Promise<PathfindingResult | null>;
}
