import { City } from '@/domain/entities';
import { WeatherCondition } from '@/domain/value-objects';
import { WeatherConditionProvider } from '@/infrastructure/pathfinding';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import type { OpenWeatherMapConfig } from './openweathermap.config';
import { WeatherCodeMapper } from './weather-code.mapper';
import { WeatherServiceError } from './weather-service.error';

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

export class OpenWeatherMapAdapter implements WeatherConditionProvider {
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
  }

  async forCity(city: City): Promise<WeatherCondition> {
    const cacheKey = this.getCacheKey(city.name.value);

    const cachedWeather =
      await this.cacheManager.get<WeatherCondition>(cacheKey);

    if (cachedWeather) {
      return cachedWeather;
    }

    const weather = await this.fetchWeatherFromApi(city.name.value);

    await this.cacheManager.set(cacheKey, weather, this.cacheTtl);

    return weather;
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
      throw WeatherServiceError.invalidResponse(cityName);
    }

    const weatherMain = response.data.weather[0].main;

    return WeatherCodeMapper.mapToWeatherCondition(weatherMain);
  }

  private getCacheKey(cityName: string): string {
    return `${this.cacheKeyPrefix}${cityName.toLowerCase().trim()}`;
  }
}
