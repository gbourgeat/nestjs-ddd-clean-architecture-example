import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateRoadSegmentRequest } from '@/presentation/rest-api/requests';
import { CreateRoadSegmentResponse } from '@/presentation/rest-api/responses';
import { CreateRoadSegmentUseCase } from '@/application/use-cases/create-road-segment';
import {
  CityNotFoundError,
  InvalidCityNameError,
  InvalidDistanceError,
  InvalidSpeedError,
  InvalidRoadSegmentError,
} from '@/domain/errors';

@ApiTags('Road Segments')
@Controller()
export class CreateRoadSegmentController {
  constructor(
    private readonly createRoadSegmentUseCase: CreateRoadSegmentUseCase,
  ) {}

  @Post('/road-segments')
  @ApiOperation({
    summary: 'Create a new road segment',
    description:
      'Create a new road segment between two cities. Both cities must already exist in the database.',
  })
  @ApiBody({
    type: CreateRoadSegmentRequest,
    description: 'Request data for creating a road segment',
    examples: {
      simple: {
        summary: 'Create road segment',
        value: {
          cityA: 'Paris',
          cityB: 'Lyon',
          distance: 465,
          speedLimit: 130,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Road segment created successfully',
    type: CreateRoadSegmentResponse,
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
    description: 'One of the cities was not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'City with name "UnknownCity" not found',
        error: 'City Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
    schema: {
      examples: {
        invalidDistance: {
          summary: 'Invalid distance',
          value: {
            statusCode: 400,
            message: 'Distance must be positive',
            error: 'Invalid Distance',
          },
        },
        invalidSpeed: {
          summary: 'Invalid speed',
          value: {
            statusCode: 400,
            message: 'Speed must be positive',
            error: 'Invalid Speed',
          },
        },
        sameCity: {
          summary: 'Same city for both endpoints',
          value: {
            statusCode: 400,
            message: 'Cannot create a road segment connecting a city to itself',
            error: 'Invalid Road Segment',
          },
        },
        emptyCityName: {
          summary: 'Empty city name',
          value: {
            statusCode: 400,
            message: 'City name cannot be empty',
            error: 'Invalid City Name',
          },
        },
      },
    },
  })
  async createRoadSegment(
    @Body() dto: CreateRoadSegmentRequest,
  ): Promise<CreateRoadSegmentResponse> {
    try {
      const result = await this.createRoadSegmentUseCase.execute({
        cityA: dto.cityA,
        cityB: dto.cityB,
        distance: dto.distance,
        speedLimit: dto.speedLimit,
      });

      return {
        roadSegmentId: result.roadSegmentId,
        cityA: result.cityA,
        cityB: result.cityB,
        distance: result.distance,
        speedLimit: result.speedLimit,
      };
    } catch (error) {
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

      if (error instanceof InvalidDistanceError) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message,
            error: 'Invalid Distance',
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

      if (error instanceof InvalidRoadSegmentError) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message,
            error: 'Invalid Road Segment',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }
  }
}
