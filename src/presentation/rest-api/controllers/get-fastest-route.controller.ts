import { GetFastestRouteUseCase } from '@/application/use-cases/get-fastest-route';
import {
  CityNotFoundError,
  InvalidCityNameError,
  InvalidWeatherConditionError,
  SameStartAndEndCityError,
} from '@/domain/errors';
import { RouteResponseMapper } from '@/presentation/rest-api/mappers';
import { GetFastestRouteRequest } from '@/presentation/rest-api/requests';
import { GetFastestRouteResponse } from '@/presentation/rest-api/responses';
import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Routes')
@Controller()
export class GetFastestRouteController {
  constructor(
    private readonly getFastestRouteUseCase: GetFastestRouteUseCase,
  ) {}

  @Post('/get-fastest-route')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Calculate the fastest route',
    description:
      'Calculate the fastest route between two cities taking into account the weather and optional constraints',
  })
  @ApiBody({
    type: GetFastestRouteRequest,
    description: 'Request data for route calculation',
    examples: {
      simple: {
        summary: 'Simple request',
        value: {
          startCity: 'Paris',
          endCity: 'Marseille',
        },
      },
      withConstraints: {
        summary: 'Request with constraints',
        value: {
          startCity: 'Paris',
          endCity: 'Marseille',
          constraints: {
            excludeWeather: ['rain', 'snow'],
            maxDistance: 500,
            minSpeed: 100,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Route calculated successfully',
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
        message: 'End city "UnknownCity" not found in graph',
        error: 'City Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
    schema: {
      example: {
        statusCode: 400,
        message: ['startCity should not be empty', 'endCity must be a string'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'An error occurred while calculating the route',
        error: 'Internal Server Error',
      },
    },
  })
  async getFastestRoute(
    @Body() dto: GetFastestRouteRequest,
  ): Promise<GetFastestRouteResponse> {
    try {
      const result = await this.getFastestRouteUseCase.execute({
        startCity: dto.startCity,
        endCity: dto.endCity,
        constraints: dto.constraints
          ? {
              excludeWeatherConditions: dto.constraints.excludeWeather,
              maxDistance: dto.constraints.maxDistance,
              minSpeedLimit: dto.constraints.minSpeed,
            }
          : undefined,
      });

      return RouteResponseMapper.toDto(result);
    } catch (error) {
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

      if (error instanceof InvalidWeatherConditionError) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message,
            error: 'Invalid Weather Condition',
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

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An error occurred while calculating the route',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
