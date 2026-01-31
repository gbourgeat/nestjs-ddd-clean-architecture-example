import { WeatherConditionProvider } from '@/infrastructure/pathfinding/weather-condition-provider';
import { WeatherCondition } from '@/domain/value-objects';
import { City } from '@/domain/entities';

export class FakeWeatherConditionProvider implements WeatherConditionProvider {
  private fakeCondition: WeatherCondition = WeatherCondition.create('Clear');

  setCondition(condition: 'Clear' | 'Rain' | 'Snow' | 'Clouds'): void {
    this.fakeCondition = WeatherCondition.create(condition);
  }

  async forCity(_city: City): Promise<WeatherCondition> {
    return this.fakeCondition;
  }
}
