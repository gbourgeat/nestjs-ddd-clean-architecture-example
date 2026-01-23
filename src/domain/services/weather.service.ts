import { WeatherCondition } from '../value-objects';

export interface WeatherService {
  getWeatherForCity(cityName: string): Promise<WeatherCondition>;
}
