import {
  Duration,
  WeatherCondition,
  RoadConstraints,
  Distance,
  Speed,
} from '@/domain/value-objects';
import { RoadSegment, City } from '@/domain/entities';

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
