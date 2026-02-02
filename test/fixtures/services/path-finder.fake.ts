import { City, RoadSegment } from '@/domain/entities';
import { PathFinder, PathfindingResult } from '@/domain/services';
import { RoadConstraints } from '@/domain/value-objects';

export class PathFinderFake extends PathFinder {
  private result: PathfindingResult | null = null;

  async findFastestRoute(
    _segments: RoadSegment[],
    _startCity: City,
    _endCity: City,
    _constraints?: RoadConstraints,
  ): Promise<PathfindingResult | null> {
    return this.result;
  }

  // Test utilities
  givenResult(result: PathfindingResult | null): void {
    this.result = result;
  }

  reset(): void {
    this.result = null;
  }
}
