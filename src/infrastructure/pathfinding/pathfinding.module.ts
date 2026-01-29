import { Module } from '@nestjs/common';
import { DijkstraPathfindingService } from './dijkstra-pathfinding.service';
import { DijkstraAlgorithm } from './dijkstra-algorithm';
import { GraphBuilder } from './graph-builder';
import { PathReconstructor } from './path-reconstructor';
import { SegmentFilter } from './segment-filter';

@Module({
  providers: [
    DijkstraPathfindingService,
    DijkstraAlgorithm,
    GraphBuilder,
    PathReconstructor,
    SegmentFilter,
    {
      provide: 'PathFinder',
      useClass: DijkstraPathfindingService,
    },
  ],
  exports: [DijkstraPathfindingService, 'PathFinder'],
})
export class PathfindingModule {}
