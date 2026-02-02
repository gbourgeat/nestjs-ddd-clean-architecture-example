import { CreateRoadSegmentUseCase } from '@/application/use-cases/create-road-segment';
import { GetFastestRouteUseCase } from '@/application/use-cases/get-fastest-route';
import { UpdateRoadSegmentSpeedUseCase } from '@/application/use-cases/update-road-segment-speed';
import { RoadSegmentRepository } from '@/domain/repositories';
import { PathFinder } from '@/domain/services';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { PathfindingModule } from '@/infrastructure/pathfinding/pathfinding.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  CreateRoadSegmentController,
  GetFastestRouteController,
  UpdateRoadSegmentSpeedController,
} from './controllers';

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
      provide: CreateRoadSegmentUseCase,
      useFactory: (roadSegmentRepository: RoadSegmentRepository) => {
        return new CreateRoadSegmentUseCase(roadSegmentRepository);
      },
      inject: [RoadSegmentRepository],
    },
    {
      provide: GetFastestRouteUseCase,
      useFactory: (
        fastestRoadFinder: PathFinder,
        roadSegmentRepository: RoadSegmentRepository,
      ) => {
        return new GetFastestRouteUseCase(
          fastestRoadFinder,
          roadSegmentRepository,
        );
      },
      inject: [PathFinder, RoadSegmentRepository],
    },
    {
      provide: UpdateRoadSegmentSpeedUseCase,
      useFactory: (roadSegmentRepository: RoadSegmentRepository) => {
        return new UpdateRoadSegmentSpeedUseCase(roadSegmentRepository);
      },
      inject: [RoadSegmentRepository],
    },
  ],
  controllers: [
    CreateRoadSegmentController,
    GetFastestRouteController,
    UpdateRoadSegmentSpeedController,
  ],
})
export class RestApiModule {}
