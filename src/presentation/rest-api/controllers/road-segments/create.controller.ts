import { CreateRoadSegmentUseCase } from '@/application/use-cases/create-road-segment';
import {
  CityNotFoundError,
  InvalidCityNameError,
  RoadSegmentCreationError,
} from '@/domain/errors';
import { CreateRoadSegmentRequest } from '@/presentation/rest-api/requests';
import { CreateRoadSegmentResponse } from '@/presentation/rest-api/responses';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Road Segments')
@Controller('road-segments')
export class CreateRoadSegmentController {
  constructor(
    private readonly createRoadSegmentUseCase: CreateRoadSegmentUseCase,
  ) {}

  @Post()
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
  async create(
    @Body() dto: CreateRoadSegmentRequest,
  ): Promise<CreateRoadSegmentResponse> {
    const result = await this.createRoadSegmentUseCase.execute({
      cityA: dto.cityA,
      cityB: dto.cityB,
      distance: dto.distance,
      speedLimit: dto.speedLimit,
    });

    if (!result.success) {
      const error = result.error;

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

      if (error instanceof RoadSegmentCreationError) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message,
            error: 'Invalid Road Segment',
          },
          HttpStatus.BAD_REQUEST,
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

    return {
      roadSegmentId: result.value.roadSegmentId,
      cityA: result.value.cityA,
      cityB: result.value.cityB,
      distance: result.value.distance,
      speedLimit: result.value.speedLimit,
    };
  }
}
