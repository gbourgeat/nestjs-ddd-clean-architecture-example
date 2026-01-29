import { Distance } from './distance';
import { WeatherCondition } from './weather-condition';
import { Speed } from './speed';

export class RoadConstraints {
  constructor(
    public readonly excludeWeatherConditions?: WeatherCondition[],
    public readonly maxDistance?: Distance,
    public readonly minSpeedLimit?: Speed,
  ) {}
}
