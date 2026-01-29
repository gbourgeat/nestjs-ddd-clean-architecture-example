export type WeatherCondition =
  | 'sunny'
  | 'cloudy'
  | 'rain'
  | 'snow'
  | 'thunderstorm'
  | 'fog';

export const VALID_WEATHER_CONDITIONS: readonly WeatherCondition[] = [
  'sunny',
  'cloudy',
  'rain',
  'snow',
  'thunderstorm',
  'fog',
] as const;

export function isWeatherCondition(value: string): value is WeatherCondition {
  return VALID_WEATHER_CONDITIONS.includes(value as WeatherCondition);
}
