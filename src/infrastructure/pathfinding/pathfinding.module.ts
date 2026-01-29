import { Module } from '@nestjs/common';
import { DijkstraPathFinder } from './dijkstra-path-finder';
import { PathFinder } from '@/domain/services';
import { OpenWeatherMapModule } from '../openweathermap/openweathermap.module';
import { WeatherConditionProvider } from './weather-condition-provider';

@Module({
  imports: [OpenWeatherMapModule],
  providers: [
    {
      provide: PathFinder,
      useFactory: (weatherConditionProvider: WeatherConditionProvider) => {
        return new DijkstraPathFinder(weatherConditionProvider);
      },
      inject: [WeatherConditionProvider],
    },
  ],
  exports: [PathFinder],
})
export class PathfindingModule {}
