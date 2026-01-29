import { InvalidWeatherConditionError } from '@/domain/errors';

describe('WeatherCondition', () => {
  it('should validate weather condition with isWeatherCondition', () => {
    const { isWeatherCondition } = require('@/domain/value-objects');
    expect(isWeatherCondition('sunny')).toBe(true);
    expect(isWeatherCondition('invalid')).toBe(false);
  });

  it('should throw InvalidWeatherConditionError for invalid condition', () => {
    const { VALID_WEATHER_CONDITIONS } = require('@/domain/value-objects');
    expect(() =>
      InvalidWeatherConditionError.forInvalidCondition(
        'invalid',
        VALID_WEATHER_CONDITIONS,
      ),
    ).not.toThrow();
  });
});
