import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { OpenWeatherMapAdapter } from './openweathermap.adapter';
import openweathermapConfig from './openweathermap.config';
import { WeatherConditionProvider } from '../pathfinding/weather-condition-provider';

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
    {
      provide: WeatherConditionProvider,
      useClass: OpenWeatherMapAdapter,
    },
  ],
  exports: [WeatherConditionProvider],
})
export class OpenWeatherMapModule {}
