export interface GetFastestRoadOutput {
  path: string[];
  totalDistance: number;
  estimatedTime: number;
  steps: Array<{
    from: string;
    to: string;
    distance: number;
    speed: number;
    weather: string;
  }>;
}
