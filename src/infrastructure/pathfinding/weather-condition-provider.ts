import { City } from '@/domain/entities';
import { WeatherCondition } from '@/domain/value-objects';

export abstract class WeatherConditionProvider {
  abstract forCity(city: City): Promise<WeatherCondition>;
}
