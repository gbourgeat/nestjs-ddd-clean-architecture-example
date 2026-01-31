import { WeatherConditionProvider } from '@/infrastructure/pathfinding/weather-condition-provider';
import { WeatherCondition } from '@/domain/value-objects';
import { City } from '@/domain/entities';

export class FakeWeatherConditionProvider implements WeatherConditionProvider {
  private fakeCondition: WeatherCondition = 'sunny';

  setCondition(condition: WeatherCondition): void {
    this.fakeCondition = condition;
  }

  async forCity(_city: City): Promise<WeatherCondition> {
    return this.fakeCondition;
  }
}
