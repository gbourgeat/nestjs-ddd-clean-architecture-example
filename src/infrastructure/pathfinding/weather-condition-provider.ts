import { WeatherCondition } from '@/domain/value-objects';
import { City } from '@/domain/entities';

export abstract class WeatherConditionProvider {
  abstract forCity(city: City): Promise<WeatherCondition>;
}
