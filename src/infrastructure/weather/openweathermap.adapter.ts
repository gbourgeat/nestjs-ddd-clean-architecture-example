import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { firstValueFrom } from 'rxjs';
import { WeatherService } from '../../domain/services';
import { WeatherCondition } from '../../domain/value-objects';
import { WeatherCodeMapper } from './weather-code.mapper';
import type { OpenWeatherMapConfig } from './openweathermap.config';

/**
 * OpenWeatherMap API response interface
 */
interface OpenWeatherMapResponse {
  weather: Array<{
    id: number;
    main: string; // 'Clear', 'Clouds', 'Rain', etc.
    description: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  name: string;
}

/**
 * Adapter for OpenWeatherMap API
 * Implements the WeatherService interface from the domain layer
 * Uses cache to limit API calls (60 calls/min limit on free tier)
 */
@Injectable()
export class OpenWeatherMapAdapter implements WeatherService {
  private readonly logger = new Logger(OpenWeatherMapAdapter.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly cacheKeyPrefix = 'weather_';
  private readonly cacheTtl: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    // Get configuration from ConfigService
    const config =
      this.configService.get<OpenWeatherMapConfig>('openweathermap');

    this.apiKey = config?.apiKey || '';
    this.baseUrl =
      config?.baseUrl || 'https://api.openweathermap.org/data/2.5/weather';
    this.cacheTtl = config?.cacheTtl || 600000;

    if (!this.apiKey) {
      this.logger.warn(
        'OPENWEATHERMAP_API_KEY not set. Weather service will not work properly.',
      );
    }
  }

  /**
   * Get weather condition for a given city
   * Results are cached for 10 minutes to limit API calls
   *
   * @param cityName - Name of the city (e.g., "Paris", "Lyon")
   * @returns Promise with the WeatherCondition
   * @throws Error if API call fails or city not found
   */
  async getWeatherForCity(cityName: string): Promise<WeatherCondition> {
    const cacheKey = this.getCacheKey(cityName);

    // Try to get from cache first
    const cachedWeather =
      await this.cacheManager.get<WeatherCondition>(cacheKey);

    if (cachedWeather) {
      this.logger.debug(`Cache hit for city: ${cityName}`);
      return cachedWeather;
    }

    // Cache miss - fetch from API
    this.logger.debug(`Cache miss for city: ${cityName}, fetching from API`);

    try {
      const weather = await this.fetchWeatherFromApi(cityName);

      // Store in cache
      await this.cacheManager.set(cacheKey, weather, this.cacheTtl);

      return weather;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to fetch weather for ${cityName}: ${errorMessage}`,
      );

      // In case of error, return a default weather condition to not block routing
      // This is a design decision: we prefer to allow routing even if weather is unknown
      this.logger.warn(
        `Returning default 'cloudy' weather for ${cityName} due to API error`,
      );
      return 'cloudy';
    }
  }

  /**
   * Fetch weather data from OpenWeatherMap API
   * @param cityName - Name of the city
   * @returns Promise with the WeatherCondition
   * @private
   */
  private async fetchWeatherFromApi(
    cityName: string,
  ): Promise<WeatherCondition> {
    const url = `${this.baseUrl}`;
    const params = {
      q: `${cityName},FR`, // Assuming French cities, add country code
      appid: this.apiKey,
      units: 'metric', // Use Celsius
    };

    const response = await firstValueFrom(
      this.httpService.get<OpenWeatherMapResponse>(url, { params }),
    );

    if (
      !response.data ||
      !response.data.weather ||
      response.data.weather.length === 0
    ) {
      throw new Error(`Invalid API response for city: ${cityName}`);
    }

    // Get the main weather condition (first element is the primary condition)
    const weatherMain = response.data.weather[0].main;

    this.logger.debug(
      `Weather for ${cityName}: ${weatherMain} (${response.data.weather[0].description})`,
    );

    // Map to our domain WeatherCondition
    return WeatherCodeMapper.mapToWeatherCondition(weatherMain);
  }

  /**
   * Generate cache key for a city
   * @param cityName - Name of the city
   * @returns Cache key string
   * @private
   */
  private getCacheKey(cityName: string): string {
    // Normalize city name (lowercase, trim) for consistent caching
    return `${this.cacheKeyPrefix}${cityName.toLowerCase().trim()}`;
  }
}
