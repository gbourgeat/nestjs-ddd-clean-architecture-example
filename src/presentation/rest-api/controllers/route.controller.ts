import {
  Body,
  Controller,
  Post,
  Patch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  GetFastestRouteRequest,
  UpdateRoadSegmentSpeedRequest,
} from '@/presentation/rest-api/requests';
import {
  GetFastestRouteResponse,
  UpdateRoadSegmentSpeedResponse,
} from '@/presentation/rest-api/responses';
import { GetFastestRouteUseCase } from '@/application/use-cases/get-fastest-route';
import { UpdateRoadSegmentSpeedUseCase } from '@/application/use-cases/update-road-segment-speed';
import {
  CityNotFoundError,
  InvalidWeatherConditionError,
  SameStartAndEndCityError,
  InvalidCityNameError,
  RoadSegmentNotFoundError,
  InvalidSpeedError,
  InvalidRoadSegmentIdError,
} from '@/domain/errors';
import { RouteResponseMapper } from '@/presentation/rest-api/mappers';

@ApiTags('Routes')
@Controller()
export class RouteController {
  constructor(
    private readonly getFastestRouteUseCase: GetFastestRouteUseCase,
    private readonly updateRoadSegmentSpeedUseCase: UpdateRoadSegmentSpeedUseCase,
  ) {}

  @Post('/get-fastest-route')
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

  @Patch('/road-segments/speed')
  @ApiOperation({
    summary: 'Update the speed limit of a road segment',
    description:
      'Update the speed limit between two cities. The order of cities does not matter.',
  })
  @ApiBody({
    type: UpdateRoadSegmentSpeedRequest,
    description: 'Request data for updating road segment speed',
    examples: {
      simple: {
        summary: 'Update speed limit',
        value: {
          cityA: 'Paris',
          cityB: 'Lyon',
          newSpeedLimit: 130,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Speed limit updated successfully',
    type: UpdateRoadSegmentSpeedResponse,
    example: {
      roadSegmentId: 'lyon__paris',
      cityA: 'Lyon',
      cityB: 'Paris',
      distance: 465,
      speedLimit: 130,
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Road segment not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Road segment with id "paris__unknowncity" not found',
        error: 'Road Segment Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
    schema: {
      example: {
        statusCode: 400,
        message: 'Speed must be positive',
        error: 'Invalid Speed',
      },
    },
  })
  async updateRoadSegmentSpeed(
    @Body() dto: UpdateRoadSegmentSpeedRequest,
  ): Promise<UpdateRoadSegmentSpeedResponse> {
    try {
      const result = await this.updateRoadSegmentSpeedUseCase.execute({
        cityA: dto.cityA,
        cityB: dto.cityB,
        newSpeedLimit: dto.newSpeedLimit,
      });

      return {
        roadSegmentId: result.roadSegmentId,
        cityA: result.cityA,
        cityB: result.cityB,
        distance: result.distance,
        speedLimit: result.speedLimit,
      };
    } catch (error) {
      if (error instanceof InvalidRoadSegmentIdError) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message,
            error: 'Invalid Road Segment ID',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error instanceof InvalidSpeedError) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message,
            error: 'Invalid Speed',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error instanceof RoadSegmentNotFoundError) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: error.message,
            error: 'Road Segment Not Found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An error occurred while updating the road segment speed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
