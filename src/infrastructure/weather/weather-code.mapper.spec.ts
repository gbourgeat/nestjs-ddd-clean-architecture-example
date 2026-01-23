import { WeatherCodeMapper } from './weather-code.mapper';

describe('WeatherCodeMapper', () => {
  describe('mapToWeatherCondition', () => {
    it('should map Clear to sunny', () => {
      const result = WeatherCodeMapper.mapToWeatherCondition('Clear');
      expect(result).toBe('sunny');
    });

    it('should map Clouds to cloudy', () => {
      const result = WeatherCodeMapper.mapToWeatherCondition('Clouds');
      expect(result).toBe('cloudy');
    });

    it('should map Rain to rain', () => {
      const result = WeatherCodeMapper.mapToWeatherCondition('Rain');
      expect(result).toBe('rain');
    });

    it('should map Drizzle to rain', () => {
      const result = WeatherCodeMapper.mapToWeatherCondition('Drizzle');
      expect(result).toBe('rain');
    });

    it('should map Snow to snow', () => {
      const result = WeatherCodeMapper.mapToWeatherCondition('Snow');
      expect(result).toBe('snow');
    });

    it('should map Thunderstorm to thunderstorm', () => {
      const result = WeatherCodeMapper.mapToWeatherCondition('Thunderstorm');
      expect(result).toBe('thunderstorm');
    });

    it('should map fog-related conditions to fog', () => {
      const fogConditions = [
        'Mist',
        'Smoke',
        'Haze',
        'Dust',
        'Fog',
        'Sand',
        'Ash',
      ];

      fogConditions.forEach((condition) => {
        const result = WeatherCodeMapper.mapToWeatherCondition(condition);
        expect(result).toBe('fog');
      });
    });

    it('should map Squall to thunderstorm', () => {
      const result = WeatherCodeMapper.mapToWeatherCondition('Squall');
      expect(result).toBe('thunderstorm');
    });

    it('should map Tornado to thunderstorm', () => {
      const result = WeatherCodeMapper.mapToWeatherCondition('Tornado');
      expect(result).toBe('thunderstorm');
    });

    it('should default to cloudy for unknown weather codes', () => {
      const result = WeatherCodeMapper.mapToWeatherCondition('UnknownWeather');
      expect(result).toBe('cloudy');
    });

    it('should log warning for unknown weather codes', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      WeatherCodeMapper.mapToWeatherCondition('UnknownWeather');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Unknown weather condition: UnknownWeather, defaulting to 'cloudy'",
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
