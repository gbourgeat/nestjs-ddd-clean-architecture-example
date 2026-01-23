import { Injectable } from '@nestjs/common';
import { ROUTES } from '../../data';
import type { PathfindingService, WeatherService } from '../../domain/services';
import { RouteConstraints, WeatherCondition } from '../../domain/value-objects';

/**
 * Input DTO for GetFastestRouteUseCase
 */
export interface GetFastestRouteInput {
  startCity: string;
  endCity: string;
  constraints?: RouteConstraints;
}

/**
 * Output DTO for GetFastestRouteUseCase
 */
export interface GetFastestRouteOutput {
  path: string[];
  totalDistance: number;
  estimatedTime: number;
  steps: Array<{
    from: string;
    to: string;
    distance: number;
    speed: number;
    travelTime: number;
    weather?: WeatherCondition;
  }>;
}

/**
 * Use Case: Find the fastest route between two cities
 *
 * This use case orchestrates the following steps:
 * 1. Validate input (start and end cities exist)
 * 2. Fetch weather data for all cities in the graph
 * 3. Apply pathfinding algorithm with constraints
 * 4. Return formatted result
 */
@Injectable()
export class GetFastestRouteUseCase {
  constructor(
    private readonly pathfindingService: PathfindingService,
    private readonly weatherService: WeatherService,
  ) {}

  /**
   * Execute the use case
   * @param input - Start city, end city, and optional constraints
   * @returns Route information or empty path if no route exists
   */
  async execute(input: GetFastestRouteInput): Promise<GetFastestRouteOutput> {
    const { startCity, endCity, constraints } = input;

    const cityNames = this.extractCityNames();
    this.ensureThatCitiesExist(startCity, endCity, cityNames);

    const weatherData = await this.fetchWeatherData(cityNames);

    const result = this.pathfindingService.findFastestRoute(
      ROUTES,
      startCity,
      endCity,
      weatherData,
      constraints,
    );

    return this.formatResult(result);
  }

  /**
   * Ensure that start and end cities exist in the graph
   * @throws Error if either city is not found
   */
  private ensureThatCitiesExist(
    startCity: string,
    endCity: string,
    availableCities: Set<string>,
  ): void {
    if (!availableCities.has(startCity)) {
      throw new Error(`Start city "${startCity}" not found in graph`);
    }
    if (!availableCities.has(endCity)) {
      throw new Error(`End city "${endCity}" not found in graph`);
    }
  }

  /**
   * Format the pathfinding result into the output DTO
   * @returns Formatted result or empty route if no path found
   */
  private formatResult(
    result: ReturnType<PathfindingService['findFastestRoute']>,
  ): GetFastestRouteOutput {
    if (!result) {
      return this.createEmptyRoute();
    }

    return {
      path: result.path,
      totalDistance: result.totalDistance,
      estimatedTime: result.estimatedTime,
      steps: result.steps.map((step) => ({
        from: step.from,
        to: step.to,
        distance: step.distance,
        speed: step.speed,
        travelTime: step.travelTime,
        weather: step.weather,
      })),
    };
  }

  /**
   * Create an empty route result
   */
  private createEmptyRoute(): GetFastestRouteOutput {
    return {
      path: [],
      totalDistance: 0,
      estimatedTime: 0,
      steps: [],
    };
  }

  /**
   * Extract all unique city names from the routes
   */
  private extractCityNames(): Set<string> {
    const cityNames = new Set<string>();
    for (const route of ROUTES) {
      cityNames.add(route.from);
      cityNames.add(route.to);
    }
    return cityNames;
  }

  /**
   * Fetch weather data for all cities in parallel
   */
  private async fetchWeatherData(
    cityNames: Set<string>,
  ): Promise<Map<string, WeatherCondition>> {
    const weatherData = new Map<string, WeatherCondition>();

    // Fetch all weather data in parallel for better performance
    const weatherPromises = Array.from(cityNames).map(async (cityName) => {
      const weather = await this.weatherService.getWeatherForCity(cityName);
      return { cityName, weather };
    });

    const results = await Promise.all(weatherPromises);

    for (const { cityName, weather } of results) {
      weatherData.set(cityName, weather);
    }

    return weatherData;
  }
}
