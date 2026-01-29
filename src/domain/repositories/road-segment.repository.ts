import { RoadSegment } from '@/domain/entities';
import { RoadSegmentId } from '@/domain/value-objects';

export abstract class RoadSegmentRepository {
  abstract findAll(): Promise<RoadSegment[]>;
  abstract findById(id: RoadSegmentId): Promise<RoadSegment>;
  abstract save(roadSegment: RoadSegment): Promise<void>;
}
