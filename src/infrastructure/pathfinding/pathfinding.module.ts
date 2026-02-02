import { PathFinder } from '@/domain/services';
import { Module } from '@nestjs/common';
import { OpenWeatherMapModule } from '../openweathermap/openweathermap.module';
import { DijkstraPathFinder } from './dijkstra-path-finder';
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
