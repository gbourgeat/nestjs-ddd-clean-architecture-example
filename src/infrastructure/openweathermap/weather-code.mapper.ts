import { WeatherCondition } from '../../domain/value-objects/weather-condition';

export class WeatherCodeMapper {
  private static readonly weatherMapping: Record<string, WeatherCondition> = {
    Clear: 'sunny',
    Clouds: 'cloudy',
    Rain: 'rain',
    Drizzle: 'rain',
    Thunderstorm: 'thunderstorm',
    Snow: 'snow',
    Mist: 'fog',
    Smoke: 'fog',
    Haze: 'fog',
    Dust: 'fog',
    Fog: 'fog',
    Sand: 'fog',
    Ash: 'fog',
    Squall: 'thunderstorm',
    Tornado: 'thunderstorm',
  };

  static mapToWeatherCondition(weatherMain: string): WeatherCondition {
    const condition = this.weatherMapping[weatherMain];

    if (!condition) {
      throw new Error(`Unrecognized weather condition: ${weatherMain}`);
    }

    return condition;
  }
}
