import { Module } from '@nestjs/common';
import { OpenWeatherMapModule } from './weather';
import { PathfindingModule } from './pathfinding';

/**
 * Infrastructure Module
 * Groups all infrastructure-related modules (external services, adapters, etc.)
 */
@Module({
  imports: [OpenWeatherMapModule, PathfindingModule],
  exports: [OpenWeatherMapModule, PathfindingModule],
})
export class InfrastructureModule {}
