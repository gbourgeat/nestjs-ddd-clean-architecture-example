import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { OpenWeatherMapAdapter } from './openweathermap.adapter';
import { WeatherCodeMapper } from './weather-code.mapper';
import openweathermapConfig from './openweathermap.config';

/**
 * Module for OpenWeatherMap integration
 * Provides weather data services using the OpenWeatherMap API
 */
@Module({
  imports: [
    ConfigModule.forFeature(openweathermapConfig),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get<number>('openweathermap.timeout', 5000),
        maxRedirects: configService.get<number>(
          'openweathermap.maxRedirects',
          5,
        ),
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('openweathermap.cacheTtl', 600000),
        max: configService.get<number>('openweathermap.cacheMax', 100),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    OpenWeatherMapAdapter,
    WeatherCodeMapper,
    {
      provide: 'WeatherService',
      useClass: OpenWeatherMapAdapter,
    },
  ],
  exports: [OpenWeatherMapAdapter, 'WeatherService'],
})
export class OpenWeatherMapModule {}
