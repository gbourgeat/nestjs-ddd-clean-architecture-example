import { Module } from '@nestjs/common';
import { DijkstraPathfindingService } from './dijkstra-pathfinding.service';
import { DijkstraAlgorithm } from './dijkstra-algorithm';
import { GraphBuilder } from './graph-builder';
import { PathReconstructor } from './path-reconstructor';
import { RouteFilter } from './route-filter';

/**
 * Module for pathfinding services
 * Provides route calculation using Dijkstra's algorithm
 */
@Module({
  providers: [
    DijkstraPathfindingService,
    DijkstraAlgorithm,
    GraphBuilder,
    PathReconstructor,
    RouteFilter,
    {
      provide: 'PathfindingService',
      useClass: DijkstraPathfindingService,
    },
  ],
  exports: [DijkstraPathfindingService, 'PathfindingService'],
})
export class PathfindingModule {}
