import { Injectable } from '@nestjs/common';
import { DijkstraAlgorithm } from './dijkstra-algorithm';
import { GraphBuilder } from './graph-builder';
import { PathReconstructor } from './path-reconstructor';
import { SegmentFilter } from './segment-filter';
import {
  PathFinder,
  PathfindingResult,
} from '../../domain/services/path-finder';
import { RoadSegment } from '../../domain/entities/road-segment';
import { CityId } from '../../domain/value-objects/city-id';
import { WeatherCondition } from '../../domain/value-objects/weather-condition';
import { RoadConstraints } from '../../domain/value-objects/road-constraints';

@Injectable()
export class DijkstraPathfindingService implements PathFinder {
  private readonly segmentFilter = new SegmentFilter();
  private readonly graphBuilder = new GraphBuilder();
  private readonly dijkstraAlgorithm = new DijkstraAlgorithm();
  private readonly pathReconstructor = new PathReconstructor();

  findFastestRoute(
    segments: RoadSegment[],
    startCityId: CityId,
    endCityId: CityId,
    weatherData: Map<string, WeatherCondition>,
    constraints?: RoadConstraints,
  ): PathfindingResult | null {
    const validSegments = this.segmentFilter.filter(
      segments,
      weatherData,
      constraints,
    );

    const graph = this.graphBuilder.build(validSegments);

    const result = this.dijkstraAlgorithm.execute(
      graph,
      startCity.name.value,
      endCity.name.value,
    );
    if (!result) {
      return null;
    }

    const totalTime = result.distances.get(endCity.name.value) || 0;

    return this.pathReconstructor.reconstruct(
      result.previous,
      startCity.name.value,
      endCity.name.value,
      totalTime,
      weatherData,
    );
  }
}
