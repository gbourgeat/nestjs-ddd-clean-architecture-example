import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { firstValueFrom } from 'rxjs';
import { WeatherCodeMapper } from './weather-code.mapper';
import type { OpenWeatherMapConfig } from './openweathermap.config';
import { WeatherConditionProvider } from '../../domain/services/weather-condition-provider';
import { WeatherCondition } from '../../domain/value-objects/weather-condition';
import { City } from '../../domain/entities/city';

interface OpenWeatherMapResponse {
  weather: Array<{
    id: number;
    main: string;
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

@Injectable()
export class OpenWeatherMapAdapter implements WeatherConditionProvider {
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

  async forCity(city: City): Promise<WeatherCondition> {
    const cacheKey = this.getCacheKey(city.name.value);

    const cachedWeather =
      await this.cacheManager.get<WeatherCondition>(cacheKey);

    if (cachedWeather) {
      this.logger.debug(`Cache hit for city: ${city.name.value}`);

      return cachedWeather;
    }

    this.logger.debug(
      `Cache miss for city: ${city.name.value}, fetching from API`,
    );

    try {
      const weather = await this.fetchWeatherFromApi(city.name.value);

      await this.cacheManager.set(cacheKey, weather, this.cacheTtl);

      return weather;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to fetch weather for ${city.name.value}: ${errorMessage}`,
      );

      throw new Error(`Failed to fetch weather for ${city.name.value}`);
    }
  }

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

    const weatherMain = response.data.weather[0].main;

    this.logger.debug(
      `Weather for ${cityName}: ${weatherMain} (${response.data.weather[0].description})`,
    );

    return WeatherCodeMapper.mapToWeatherCondition(weatherMain);
  }

  private getCacheKey(cityName: string): string {
    return `${this.cacheKeyPrefix}${cityName.toLowerCase().trim()}`;
  }
}
