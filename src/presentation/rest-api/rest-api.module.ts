import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouteController } from './controllers/route.controller';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { OpenWeatherMapModule } from '../../infrastructure/openweathermap/openweathermap.module';
import { PathfindingModule } from '../../infrastructure/pathfinding/pathfinding.module';
import { PathFinder } from '../../domain/services/path-finder';
import { RoadSegmentRepository } from '../../domain/repositories/road-segment.repository';
import { WeatherConditionProvider } from '../../domain/services/weather-condition-provider';
import { GetFastestRouteUseCase } from '../../application/use-cases/get-fastest-route/get-fastest-route.use-case';
import { CityRepository } from '../../domain/repositories/city.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    OpenWeatherMapModule,
    PathfindingModule,
  ],
  providers: [
    {
      provide: GetFastestRouteUseCase,
      useFactory: (
        fastestRoadFinder: PathFinder,
        roadSegmentRepository: RoadSegmentRepository,
        cityRepository: CityRepository,
        weatherConditionProvider: WeatherConditionProvider,
      ) => {
        return new GetFastestRouteUseCase(
          fastestRoadFinder,
          roadSegmentRepository,
          cityRepository,
          weatherConditionProvider,
        );
      },
      inject: [
        PathFinder,
        RoadSegmentRepository,
        CityRepository,
        WeatherConditionProvider,
      ],
    },
  ],
  controllers: [RouteController],
})
export class RestApiModule {}
