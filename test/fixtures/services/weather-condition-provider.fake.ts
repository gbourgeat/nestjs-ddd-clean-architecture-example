import { WeatherConditionProvider } from '@/infrastructure/pathfinding/weather-condition-provider';
import { WeatherCondition } from '@/domain/value-objects';
import { City } from '@/domain/entities';

export class FakeWeatherConditionProvider implements WeatherConditionProvider {
  private weatherByCity: Map<string, WeatherCondition> = new Map();
  private defaultCondition: WeatherCondition = 'sunny';

  setCondition(condition: WeatherCondition): void {
    this.defaultCondition = condition;
  }

  setWeather(cityName: string, condition: WeatherCondition): void {
    this.weatherByCity.set(cityName, condition);
  }

  async forCity(city: City): Promise<WeatherCondition> {
    return this.weatherByCity.get(city.name.value) || this.defaultCondition;
  }
}
