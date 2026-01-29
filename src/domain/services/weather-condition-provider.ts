import { WeatherCondition } from '../value-objects/weather-condition';
import { City } from '../entities/city';

export abstract class WeatherConditionProvider {
  abstract forCity(city: City): Promise<WeatherCondition>;
}
