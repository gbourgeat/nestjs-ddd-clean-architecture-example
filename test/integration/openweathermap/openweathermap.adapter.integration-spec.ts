import { OpenWeatherMapAdapter } from '@/infrastructure/openweathermap/openweathermap.adapter';
import { WeatherServiceError } from '@/infrastructure/openweathermap/weather-service.error';
import { HttpModule, HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CityBuilder, CityFixtures } from '@test/fixtures';
import { AxiosHeaders, AxiosResponse } from 'axios';
import { Cache } from 'cache-manager';
import { of, throwError } from 'rxjs';

describe('OpenWeatherMapAdapter (Integration)', () => {
  let adapter: OpenWeatherMapAdapter;
  let httpService: HttpService;
  let _cacheManager: Cache;
  let module: TestingModule;

  const mockConfigService = {
    get: jest.fn().mockReturnValue({
      apiKey: 'test-api-key',
      baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
      cacheTtl: 600000,
    }),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        OpenWeatherMapAdapter,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    adapter = module.get<OpenWeatherMapAdapter>(OpenWeatherMapAdapter);
    httpService = module.get<HttpService>(HttpService);
    _cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('forCity', () => {
    it('should return cached weather condition if available', async () => {
      // Arrange
      const city = CityFixtures.paris();
      mockCacheManager.get.mockResolvedValue('sunny');

      // Act
      const result = await adapter.forCity(city);

      // Assert
      expect(result).toBe('sunny');
      expect(mockCacheManager.get).toHaveBeenCalledWith('weather_paris');
    });

    it('should fetch from API when cache is empty', async () => {
      // Arrange
      const city = CityFixtures.paris();
      mockCacheManager.get.mockResolvedValue(null);

      const mockResponse: AxiosResponse = {
        data: {
          weather: [{ id: 800, main: 'Clear', description: 'clear sky' }],
          main: {
            temp: 20,
            feels_like: 19,
            temp_min: 18,
            temp_max: 22,
            pressure: 1013,
            humidity: 50,
          },
          name: 'Paris',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      // Act
      const result = await adapter.forCity(city);

      // Assert
      expect(result).toBe('sunny');
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'weather_paris',
        'sunny',
        600000,
      );
    });

    it('should map different weather conditions correctly', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(null);

      const weatherConditions = [
        { main: 'Rain', cityName: 'Lille', expected: 'rain' },
        { main: 'Snow', cityName: 'Grenoble', expected: 'snow' },
        { main: 'Clouds', cityName: 'Nantes', expected: 'cloudy' },
        {
          main: 'Thunderstorm',
          cityName: 'Toulouse',
          expected: 'thunderstorm',
        },
        { main: 'Mist', cityName: 'Strasbourg', expected: 'fog' },
        { main: 'Fog', cityName: 'Bordeaux', expected: 'fog' },
        { main: 'Haze', cityName: 'Nice', expected: 'fog' },
      ];

      for (const { main, cityName, expected } of weatherConditions) {
        const city = CityBuilder.aCity().withName(cityName).build();

        const mockResponse: AxiosResponse = {
          data: {
            weather: [{ id: 500, main, description: 'weather description' }],
            main: {
              temp: 15,
              feels_like: 14,
              temp_min: 12,
              temp_max: 17,
              pressure: 1010,
              humidity: 60,
            },
            name: city.name.value,
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { headers: new AxiosHeaders() },
        };

        jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

        // Act
        const result = await adapter.forCity(city);

        // Assert
        expect(result).toBe(expected);
      }
    });

    it('should throw WeatherServiceError when API returns invalid response', async () => {
      // Arrange
      const city = CityBuilder.aCity().withName('InvalidCity').build();
      mockCacheManager.get.mockResolvedValue(null);

      const mockResponse: AxiosResponse = {
        data: {
          weather: [],
          main: {},
          name: 'InvalidCity',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      // Act & Assert
      await expect(adapter.forCity(city)).rejects.toThrow(WeatherServiceError);
    });

    it('should throw error when API call fails', async () => {
      // Arrange
      const city = CityFixtures.paris();
      mockCacheManager.get.mockResolvedValue(null);

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('Network error')));

      // Act & Assert
      await expect(adapter.forCity(city)).rejects.toThrow();
    });

    it('should use correct cache key with trimmed lowercase city name', async () => {
      // Arrange
      const city = CityBuilder.aCity().withName('  PARIS  ').build();
      mockCacheManager.get.mockResolvedValue('rain');

      // Act
      await adapter.forCity(city);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalledWith('weather_paris');
    });

    it('should correctly construct API request parameters', async () => {
      // Arrange
      const city = CityFixtures.lyon();
      mockCacheManager.get.mockResolvedValue(null);

      const mockResponse: AxiosResponse = {
        data: {
          weather: [{ id: 800, main: 'Clear', description: 'clear sky' }],
          main: {
            temp: 22,
            feels_like: 21,
            temp_min: 20,
            temp_max: 24,
            pressure: 1015,
            humidity: 45,
          },
          name: 'Lyon',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      const httpGetSpy = jest
        .spyOn(httpService, 'get')
        .mockReturnValue(of(mockResponse));

      // Act
      await adapter.forCity(city);

      // Assert
      expect(httpGetSpy).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/weather',
        {
          params: {
            q: 'Lyon,FR',
            appid: 'test-api-key',
            units: 'metric',
          },
        },
      );
    });
  });
});
