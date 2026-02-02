import { GetFastestRouteUseCase } from '@/application/use-cases/get-fastest-route';
import {
  CityNotFoundError,
  InvalidCityNameError,
  SameStartAndEndCityError,
} from '@/domain/errors';
import { RouteResponseMapper } from '@/presentation/rest-api/mappers';
import { SearchItineraryQuery } from '@/presentation/rest-api/queries';
import { GetFastestRouteResponse } from '@/presentation/rest-api/responses';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Itineraries')
@Controller('itineraries')
export class CalculateItineraryController {
  constructor(
    private readonly getFastestRouteUseCase: GetFastestRouteUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Calculate the fastest itinerary',
    description:
      'Calculate the fastest itinerary between two cities, optionally applying constraints on weather, distance, or speed.',
  })
  @ApiQuery({ name: 'from', required: true, example: 'Paris' })
  @ApiQuery({ name: 'to', required: true, example: 'Lyon' })
  @ApiQuery({ name: 'maxDistance', required: false, example: 500 })
  @ApiQuery({ name: 'minSpeed', required: false, example: 100 })
  @ApiQuery({ name: 'excludeWeather', required: false, example: 'rain,snow' })
  @ApiResponse({
    status: 200,
    description: 'Itinerary calculated successfully',
    type: GetFastestRouteResponse,
    example: {
      path: ['Paris', 'Lyon', 'Marseille'],
      totalDistance: 775,
      estimatedTime: 7.1,
      steps: [
        {
          from: 'Paris',
          to: 'Lyon',
          distance: 465,
          speed: 110,
          weather: 'sunny',
        },
        {
          from: 'Lyon',
          to: 'Marseille',
          distance: 310,
          speed: 110,
          weather: 'cloudy',
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'City not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'City "UnknownCity" not found',
        error: 'City Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request',
    schema: {
      example: {
        statusCode: 400,
        message: 'Start and end cities cannot be the same',
        error: 'Bad Request',
      },
    },
  })
  async search(
    @Query() query: SearchItineraryQuery,
  ): Promise<GetFastestRouteResponse> {
    const result = await this.getFastestRouteUseCase.execute({
      startCity: query.from,
      endCity: query.to,
      constraints:
        query.maxDistance || query.minSpeed || query.excludeWeather
          ? {
              maxDistance: query.maxDistance,
              minSpeedLimit: query.minSpeed,
              excludeWeatherConditions: query.excludeWeather,
            }
          : undefined,
    });

    if (!result.success) {
      const error = result.error;

      if (error instanceof InvalidCityNameError) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message,
            error: 'Invalid City Name',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error instanceof SameStartAndEndCityError) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message,
            error: 'Same Start And End City',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error instanceof CityNotFoundError) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: error.message,
            error: 'City Not Found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // PersistenceError or unknown error
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return RouteResponseMapper.toDto(result.value);
  }
}
