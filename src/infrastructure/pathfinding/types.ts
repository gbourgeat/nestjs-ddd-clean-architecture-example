import { RoadSegment } from '../../domain/entities/road-segment';

export interface PreviousCity {
  city: string;
  segment: RoadSegment;
}

export type Graph = Map<string, RoadSegment[]>;

export const INFINITE_DISTANCE = Infinity;
export const INITIAL_DISTANCE = 0;
