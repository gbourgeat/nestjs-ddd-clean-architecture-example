export interface GetFastestRouteInput {
  startCity: string;
  endCity: string;
  constraints?: {
    excludeWeatherConditions?: string[];
    maxDistance?: number;
    minSpeedLimit?: number;
  };
}
