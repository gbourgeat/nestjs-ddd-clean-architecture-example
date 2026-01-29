import { PathFinder, PathfindingResult } from '@/domain/services';
import { City, RoadSegment } from '@/domain/entities';
import { RoadConstraints } from '@/domain/value-objects';

export class PathFinderFake extends PathFinder {
  private result: PathfindingResult | null = null;

  async findFastestRoute(
    segments: RoadSegment[],
    startCity: City,
    endCity: City,
    constraints?: RoadConstraints,
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
