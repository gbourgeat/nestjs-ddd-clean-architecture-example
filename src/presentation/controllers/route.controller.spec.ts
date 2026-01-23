import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RouteController } from './route.controller';
import { GetFastestRouteUseCase } from '../../application';
import { GetFastestRouteDto } from '../dtos';

describe('RouteController', () => {
  let controller: RouteController;
  let useCase: GetFastestRouteUseCase;

  const mockUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteController],
      providers: [
        {
          provide: GetFastestRouteUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<RouteController>(RouteController);
    useCase = module.get<GetFastestRouteUseCase>(GetFastestRouteUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFastestRoute', () => {
    it('should return a route when use case succeeds', async () => {
      const dto: GetFastestRouteDto = {
        startCity: 'Paris',
        endCity: 'Lyon',
      };

      const mockResult = {
        path: ['Paris', 'Lyon'],
        totalDistance: 465,
        estimatedTime: 4.23,
        steps: [
          {
            from: 'Paris',
            to: 'Lyon',
            distance: 465,
            speed: 110,
            weather: 'sunny' as const,
          },
        ],
      };

      mockUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.getFastestRoute(dto);

      expect(result).toEqual(mockResult);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(useCase.execute).toHaveBeenCalledWith({
        startCity: 'Paris',
        endCity: 'Lyon',
        constraints: undefined,
      });
    });

    it('should handle constraints properly', async () => {
      const dto: GetFastestRouteDto = {
        startCity: 'Paris',
        endCity: 'Lyon',
        constraints: {
          excludeWeather: ['rain', 'snow'],
          maxDistance: 500,
          minSpeed: 100,
        },
      };

      const mockResult = {
        path: ['Paris', 'Lyon'],
        totalDistance: 465,
        estimatedTime: 4.23,
        steps: [],
      };

      mockUseCase.execute.mockResolvedValue(mockResult);

      await controller.getFastestRoute(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(useCase.execute).toHaveBeenCalledWith({
        startCity: 'Paris',
        endCity: 'Lyon',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        constraints: expect.objectContaining({
          excludeWeather: ['rain', 'snow'],
          maxDistance: 500,
          minSpeed: 100,
        }),
      });
    });

    it('should return empty path when no route is found', async () => {
      const dto: GetFastestRouteDto = {
        startCity: 'Paris',
        endCity: 'UnknownCity',
      };

      const mockResult = {
        path: [],
        totalDistance: 0,
        estimatedTime: 0,
        steps: [],
      };

      mockUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.getFastestRoute(dto);

      expect(result.path).toEqual([]);
    });

    it('should throw NOT_FOUND when city is not found', async () => {
      const dto: GetFastestRouteDto = {
        startCity: 'Paris',
        endCity: 'UnknownCity',
      };

      mockUseCase.execute.mockRejectedValue(
        new Error('End city "UnknownCity" not found in graph'),
      );

      await expect(controller.getFastestRoute(dto)).rejects.toThrow(
        HttpException,
      );

      try {
        await controller.getFastestRoute(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        const httpException = error as HttpException;
        expect(httpException.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw INTERNAL_SERVER_ERROR for unexpected errors', async () => {
      const dto: GetFastestRouteDto = {
        startCity: 'Paris',
        endCity: 'Lyon',
      };

      mockUseCase.execute.mockRejectedValue(new Error('Unexpected error'));

      await expect(controller.getFastestRoute(dto)).rejects.toThrow(
        HttpException,
      );

      try {
        await controller.getFastestRoute(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        const httpException = error as HttpException;
        expect(httpException.getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  });
});
