export interface GetFastestRoadOutput {
  totalDistance: number;
  estimatedDuration: number;
  steps: {
    fromCity: string;
    toCity: string;
    distance: number;
    speedLimit: number;
    weatherCondition: string;
  }[];
}
