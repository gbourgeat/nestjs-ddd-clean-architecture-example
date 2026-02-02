import { Distance } from './distance';
import { Speed } from './speed';
import { WeatherCondition } from './weather-condition';

export class RoadConstraints {
  constructor(
    public readonly excludeWeatherConditions?: WeatherCondition[],
    public readonly maxDistance?: Distance,
    public readonly minSpeedLimit?: Speed,
  ) {}
}
