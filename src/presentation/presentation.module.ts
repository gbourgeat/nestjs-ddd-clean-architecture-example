import { Module } from '@nestjs/common';
import { RouteController } from './controllers';
import { GetFastestRouteUseCase } from '../application';
import { PathfindingModule } from '../infrastructure';
import { OpenWeatherMapModule } from '../infrastructure';

/**
 * Presentation module
 * Contains controllers and provides use cases
 */
@Module({
  imports: [PathfindingModule, OpenWeatherMapModule],
  controllers: [RouteController],
  providers: [GetFastestRouteUseCase],
})
export class PresentationModule {}
