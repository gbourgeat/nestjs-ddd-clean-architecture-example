import { RoadSegment } from '../entities/road-segment';

export abstract class RoadSegmentRepository {
  abstract findAll(): Promise<RoadSegment[]>;
  abstract save(roadSegment: RoadSegment): Promise<void>;
}
