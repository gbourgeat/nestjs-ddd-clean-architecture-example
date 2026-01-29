export class WeatherServiceError extends Error {
  private constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  static fetchFailed(cityName: string): WeatherServiceError {
    return new WeatherServiceError(`Failed to fetch weather for ${cityName}`);
  }

  static invalidResponse(cityName: string): WeatherServiceError {
    return new WeatherServiceError(
      `Invalid API response for city: ${cityName}`,
    );
  }

  static unrecognizedCondition(weatherMain: string): WeatherServiceError {
    return new WeatherServiceError(
      `Unrecognized weather condition: ${weatherMain}`,
    );
  }
}
