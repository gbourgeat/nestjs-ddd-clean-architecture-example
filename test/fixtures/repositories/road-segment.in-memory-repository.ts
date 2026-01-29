import { RoadSegmentRepository } from '@/domain/repositories';
import { RoadSegment } from '@/domain/entities';
import { RoadSegmentId } from '@/domain/value-objects';
import { RoadSegmentNotFoundError } from '@/domain/errors';

export class RoadSegmentInMemoryRepository extends RoadSegmentRepository {
  private roadSegments: Map<string, RoadSegment> = new Map();

  async findAll(): Promise<RoadSegment[]> {
    return Array.from(this.roadSegments.values());
  }

  async findById(id: RoadSegmentId): Promise<RoadSegment> {
    const roadSegment = this.roadSegments.get(id.value);
    if (!roadSegment) {
      throw RoadSegmentNotFoundError.forRoadSegmentId(id);
    }
    return roadSegment;
  }

  async save(roadSegment: RoadSegment): Promise<void> {
    this.roadSegments.set(roadSegment.id.value, roadSegment);
  }

  // Utility methods for testing
  clear(): void {
    this.roadSegments.clear();
  }

  givenRoadSegments(roadSegments: RoadSegment[]): void {
    roadSegments.forEach((segment) => {
      this.roadSegments.set(segment.id.value, segment);
    });
  }

  getAll(): RoadSegment[] {
    return Array.from(this.roadSegments.values());
  }
}
