import { PathFinder } from '../../../domain/services/path-finder';
import { RoadSegmentRepository } from '../../../domain/repositories/road-segment.repository';
import { CityRepository } from '../../../domain/repositories/city.repository';
import { CityName } from '../../../domain/value-objects/city-name';
import { WeatherConditionProvider } from '../../../domain/services/weather-condition-provider';
import { WeatherCondition } from '../../../domain/value-objects/weather-condition';
import { RoadSegment } from '../../../domain/entities/road-segment';
import { City } from '../../../domain/entities/city';
import { GetFastestRouteInput } from './get-fastest-route.input';
import { GetFastestRoadOutput } from './get-fastest-route.output';

export class GetFastestRouteUseCase {
  constructor(
    private readonly pathFinder: PathFinder,
    private readonly roadSegmentRepository: RoadSegmentRepository,
    private readonly cityRepository: CityRepository,
    private readonly weatherConditionProvider: WeatherConditionProvider,
  ) {}

  /**
   * @throws CityNotFoundError if start or end city cannot be found in the graph
   */
  async execute({
    startCity,
    endCity,
    constraints,
  }: GetFastestRouteInput): Promise<GetFastestRoadOutput> {
    const startCityName = CityName.create(startCity);
    const endCityName = CityName.create(endCity);

    this.ensureThatStartAndEndCitiesAreDistinct(startCityName, endCityName);

    const [startCityEntity, endCityEntity] = await Promise.all([
      this.cityRepository.findByName(startCityName),
      this.cityRepository.findByName(endCityName),
    ]);

    const segments = await this.roadSegmentRepository.findAll();

    const cityNames = this.extractCityNamesFromSegments(segments);
    const weatherData = await this.fetchWeatherData(cityNames);

    const pathFinderResult = this.pathFinder.findFastestRoute(
      segments,
      startCityEntity.id,
      endCityEntity.id,
      weatherData,
      constraints,
    );

    return this.formatResult(pathFinderResult);
  }

  private ensureThatStartAndEndCitiesAreDistinct(
    cityNameA: CityName,
    cityNameB: CityName,
  ) {
    if (cityNameA.equals(cityNameB)) {
      throw new Error(
        `Start city and end city cannot be the same: "${cityNameA.value}"`,
      );
    }
  }

  private formatResult(
    result: ReturnType<PathFinder['findFastestRoute']>,
  ): GetFastestRoadOutput {
    if (!result) {
      return this.createEmptyRoad();
    }

    return {
      path: result.path,
      totalDistance: result.totalDistance,
      estimatedTime: Math.round(result.estimatedTime * 10) / 10,
      steps: result.steps.map((step) => ({
        from: step.from,
        to: step.to,
        distance: step.distance,
        speed: step.speed,
        weather: step.weather,
      })),
    };
  }

  private createEmptyRoad(): GetFastestRoadOutput {
    return {
      path: [],
      totalDistance: 0,
      estimatedTime: 0,
      steps: [],
    };
  }

  private extractCityNamesFromSegments(segments: RoadSegment[]): Set<City> {
    const cities = new Set<City>();

    for (const segment of segments) {
      cities.add(segment.cities[0]);
      cities.add(segment.cities[1]);
    }

    return cities;
  }

  private async fetchWeatherData(
    cities: Set<City>,
  ): Promise<Map<string, WeatherCondition>> {
    const weatherData = new Map<string, WeatherCondition>();

    // Fetch all static-graph-data in parallel for better performance
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
}
