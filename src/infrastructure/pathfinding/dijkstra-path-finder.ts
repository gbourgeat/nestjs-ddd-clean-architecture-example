import { City, RoadSegment } from '@/domain/entities';
import { PathFinder, PathfindingResult } from '@/domain/services';
import { RoadConstraints, WeatherCondition } from '@/domain/value-objects';
import { DijkstraAlgorithm } from './dijkstra-algorithm';
import { GraphBuilder } from './graph-builder';
import { PathfindingInputMapper } from './mappers/pathfinding-input.mapper';
import { PathfindingOutputMapper } from './mappers/pathfinding-output.mapper';
import {
  InternalPathfindingResult,
  PathReconstructor,
} from './path-reconstructor';
import { SegmentFilter } from './segment-filter';
import { WeatherConditionProvider } from './weather-condition-provider';

export class DijkstraPathFinder implements PathFinder {
  private readonly segmentFilter = new SegmentFilter();
  private readonly graphBuilder = new GraphBuilder();
  private readonly dijkstraAlgorithm = new DijkstraAlgorithm();
  private readonly pathReconstructor = new PathReconstructor();

  constructor(
    private readonly weatherConditionProvider: WeatherConditionProvider,
  ) {
    if (!weatherConditionProvider) {
      throw new Error('WeatherConditionProvider must be provided');
    }
  }

  async findFastestRoute(
    segments: RoadSegment[],
    startCity: City,
    endCity: City,
    constraints?: RoadConstraints,
  ): Promise<PathfindingResult | null> {
    const cities = this.extractCitiesFromSegments(segments);
    const weatherData = await this.fetchWeatherData(cities);

    const simplifiedSegments =
      PathfindingInputMapper.toSimplifiedSegments(segments);
    const simplifiedConstraints =
      PathfindingInputMapper.toSimplifiedConstraints(constraints);
    const startCityName =
      PathfindingInputMapper.toSimplifiedCityName(startCity);
    const endCityName = PathfindingInputMapper.toSimplifiedCityName(endCity);

    const validSegments = this.segmentFilter.filter(
      simplifiedSegments,
      weatherData,
      simplifiedConstraints,
    );

    const graph = this.graphBuilder.build(validSegments);

    const result = this.dijkstraAlgorithm.execute(
      graph,
      startCityName,
      endCityName,
    );
    if (!result) {
      return null;
    }

    const totalTime = result.distances.get(endCityName) || 0;

    const internalResult = this.pathReconstructor.reconstruct(
      result.previous,
      startCityName,
      endCityName,
      totalTime,
      weatherData,
    );

    return this.toDomainResult(internalResult, segments, startCity, endCity);
  }

  private extractCitiesFromSegments(segments: RoadSegment[]): Set<City> {
    const cityMap = new Map<string, City>();

    for (const segment of segments) {
      cityMap.set(segment.cityA.name.value, segment.cityA);
      cityMap.set(segment.cityB.name.value, segment.cityB);
    }

    return new Set(cityMap.values());
  }

  private async fetchWeatherData(
    cities: Set<City>,
  ): Promise<Map<string, WeatherCondition>> {
    const weatherData = new Map<string, WeatherCondition>();

    const weatherPromises = Array.from(cities).map(async (city) => {
      const weather = await this.weatherConditionProvider.forCity(city);
      return { cityName: city.name.value, weather };
    });

    const results = await Promise.all(weatherPromises);
    for (const { cityName, weather } of results) {
      weatherData.set(cityName, weather);
    }

    return weatherData;
  }

  private toDomainResult(
    internalResult: InternalPathfindingResult,
    segments: RoadSegment[],
    startCity: City,
    endCity: City,
  ): PathfindingResult {
    const cityMapping = new Map<string, City>();
    cityMapping.set(startCity.name.value, startCity);
    cityMapping.set(endCity.name.value, endCity);

    for (const segment of segments) {
      cityMapping.set(segment.cityA.name.value, segment.cityA);
      cityMapping.set(segment.cityB.name.value, segment.cityB);
    }

    return PathfindingOutputMapper.toDomainResult(internalResult, cityMapping);
  }
}
