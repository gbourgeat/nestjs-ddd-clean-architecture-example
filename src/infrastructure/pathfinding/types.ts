export interface SimplifiedSegmentData {
  fromCity: string;
  toCity: string;
  distance: number;
  speedLimit: number;
  estimatedDuration: number;
}

export interface PreviousCity {
  city: string;
  segment: SimplifiedSegmentData;
}

export type Graph = Map<string, SimplifiedSegmentData[]>;

export const INFINITE_DISTANCE = Infinity;
export const INITIAL_DISTANCE = 0;
