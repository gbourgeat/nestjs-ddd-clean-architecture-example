import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouteController } from './controllers';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { PathfindingModule } from '@/infrastructure/pathfinding/pathfinding.module';
import { PathFinder } from '@/domain/services';
import { RoadSegmentRepository, CityRepository } from '@/domain/repositories';
import { GetFastestRouteUseCase } from '@/application/use-cases/get-fastest-route';
import { UpdateRoadSegmentSpeedUseCase } from '@/application/use-cases/update-road-segment-speed';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    PathfindingModule,
  ],
  providers: [
    {
      provide: GetFastestRouteUseCase,
      useFactory: (
        fastestRoadFinder: PathFinder,
        roadSegmentRepository: RoadSegmentRepository,
        cityRepository: CityRepository,
      ) => {
        return new GetFastestRouteUseCase(
          fastestRoadFinder,
          roadSegmentRepository,
          cityRepository,
        );
      },
      inject: [PathFinder, RoadSegmentRepository, CityRepository],
    },
    {
      provide: UpdateRoadSegmentSpeedUseCase,
      useFactory: (roadSegmentRepository: RoadSegmentRepository) => {
        return new UpdateRoadSegmentSpeedUseCase(roadSegmentRepository);
      },
      inject: [RoadSegmentRepository],
    },
  ],
  controllers: [RouteController],
})
export class RestApiModule {}
