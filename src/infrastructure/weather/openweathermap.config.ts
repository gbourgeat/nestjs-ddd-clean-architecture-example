import { registerAs } from '@nestjs/config';

export interface OpenWeatherMapConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  maxRedirects: number;
  cacheTtl: number;
  cacheMax: number;
}

export default registerAs(
  'openweathermap',
  (): OpenWeatherMapConfig => ({
    apiKey: process.env.OPENWEATHERMAP_API_KEY || '',
    baseUrl:
      process.env.OPENWEATHERMAP_BASE_URL ||
      'https://api.openweathermap.org/data/2.5/weather',
    timeout: parseInt(process.env.OPENWEATHERMAP_TIMEOUT || '5000', 10),
    maxRedirects: parseInt(process.env.OPENWEATHERMAP_MAX_REDIRECTS || '5', 10),
    cacheTtl: parseInt(process.env.OPENWEATHERMAP_CACHE_TTL || '600000', 10),
    cacheMax: parseInt(process.env.OPENWEATHERMAP_CACHE_MAX || '100', 10),
  }),
);
