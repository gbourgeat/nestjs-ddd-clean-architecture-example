import { WeatherCondition } from '../../domain/value-objects';

/**
 * Maps OpenWeatherMap weather main codes to our domain weather conditions
 *
 * OpenWeatherMap weather codes reference:
 * - Clear: Clear sky
 * - Clouds: Cloudy conditions
 * - Rain: Rainy conditions
 * - Drizzle: Light rain
 * - Thunderstorm: Storm with lightning
 * - Snow: Snowy conditions
 * - Mist/Smoke/Haze/Dust/Fog/Sand/Ash/Squall/Tornado: Foggy/poor visibility
 */
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

  /**
   * Maps an OpenWeatherMap weather main code to our domain WeatherCondition
   * @param weatherMain - The 'main' field from OpenWeatherMap API response
   * @returns The corresponding WeatherCondition
   * @throws Error if the weather code is unknown
   */
  static mapToWeatherCondition(weatherMain: string): WeatherCondition {
    const condition = this.weatherMapping[weatherMain];

    if (!condition) {
      // Default to cloudy if unknown weather condition
      console.warn(
        `Unknown weather condition: ${weatherMain}, defaulting to 'cloudy'`,
      );
      return 'cloudy';
    }

    return condition;
  }
}
