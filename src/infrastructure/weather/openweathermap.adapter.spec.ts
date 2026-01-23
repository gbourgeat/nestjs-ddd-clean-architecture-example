import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { of, throwError } from 'rxjs';
import { OpenWeatherMapAdapter } from './openweathermap.adapter';
import { WeatherCondition } from '../../domain/value-objects';

describe('OpenWeatherMapAdapter', () => {
  let adapter: OpenWeatherMapAdapter;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      if (key === 'openweathermap') {
        return {
          apiKey: 'test-api-key',
          baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
          cacheTtl: 600000,
          timeout: 5000,
          maxRedirects: 5,
          cacheMax: 100,
        };
      }
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenWeatherMapAdapter,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    adapter = module.get<OpenWeatherMapAdapter>(OpenWeatherMapAdapter);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getWeatherForCity', () => {
    it('should return cached weather if available', async () => {
      const cityName = 'Paris';
      const cachedWeather: WeatherCondition = 'sunny';

      mockCacheManager.get.mockResolvedValue(cachedWeather);

      const result = await adapter.getWeatherForCity(cityName);

      expect(result).toBe(cachedWeather);
      expect(mockCacheManager.get).toHaveBeenCalledWith('weather_paris');
      expect(mockHttpService.get).not.toHaveBeenCalled();
    });

    it('should fetch from API when cache is empty', async () => {
      const cityName = 'Lyon';
      const apiResponse = {
        data: {
          weather: [
            {
              id: 800,
              main: 'Clear',
              description: 'clear sky',
            },
          ],
          main: {
            temp: 20,
            feels_like: 19,
            temp_min: 18,
            temp_max: 22,
            pressure: 1013,
            humidity: 50,
          },
          name: 'Lyon',
        },
      };

      mockCacheManager.get.mockResolvedValue(null);
      mockHttpService.get.mockReturnValue(of(apiResponse));

      const result = await adapter.getWeatherForCity(cityName);

      expect(result).toBe('sunny');
      expect(mockCacheManager.get).toHaveBeenCalledWith('weather_lyon');
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/weather',
        {
          params: {
            q: 'Lyon,FR',
            appid: 'test-api-key',
            units: 'metric',
          },
        },
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'weather_lyon',
        'sunny',
        600000,
      );
    });

    it('should map different weather conditions correctly', async () => {
      const testCases: Array<{
        apiMain: string;
        expected: WeatherCondition;
      }> = [
        { apiMain: 'Clear', expected: 'sunny' },
        { apiMain: 'Clouds', expected: 'cloudy' },
        { apiMain: 'Rain', expected: 'rain' },
        { apiMain: 'Snow', expected: 'snow' },
        { apiMain: 'Thunderstorm', expected: 'thunderstorm' },
        { apiMain: 'Fog', expected: 'fog' },
        { apiMain: 'Mist', expected: 'fog' },
      ];

      for (const testCase of testCases) {
        mockCacheManager.get.mockResolvedValue(null);
        mockHttpService.get.mockReturnValue(
          of({
            data: {
              weather: [
                {
                  id: 1,
                  main: testCase.apiMain,
                  description: 'test',
                },
              ],
              main: {
                temp: 20,
                feels_like: 19,
                temp_min: 18,
                temp_max: 22,
                pressure: 1013,
                humidity: 50,
              },
              name: 'TestCity',
            },
          }),
        );

        const result = await adapter.getWeatherForCity('TestCity');

        expect(result).toBe(testCase.expected);
        jest.clearAllMocks();
      }
    });

    it('should return default "cloudy" weather on API error', async () => {
      const cityName = 'UnknownCity';

      mockCacheManager.get.mockResolvedValue(null);
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('API Error')),
      );

      const result = await adapter.getWeatherForCity(cityName);

      expect(result).toBe('cloudy');
      expect(mockCacheManager.set).not.toHaveBeenCalled();
    });

    it('should normalize city names for cache keys', async () => {
      const cityName = '  PARIS  ';
      const cachedWeather: WeatherCondition = 'rain';

      mockCacheManager.get.mockResolvedValue(cachedWeather);

      await adapter.getWeatherForCity(cityName);

      expect(mockCacheManager.get).toHaveBeenCalledWith('weather_paris');
    });
  });
});
