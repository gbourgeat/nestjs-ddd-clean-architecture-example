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
    summary: 'Create a new road segment between two cities',
    description: `
Creates a bidirectional road connection between two cities in the network.

## Prerequisites
- Both cities must already exist in the database
- Both cities must be different (no self-loops allowed)

## Business rules
- **Distance**: Must be a positive number representing kilometers
- **Speed limit**: Speed limit in km/h (must be positive)
- **Identifier**: Automatically generated in the format \`cityA__cityB\` (alphabetical order)

## Bidirectionality
The created segment is bidirectional: a Paris-Lyon segment allows travel from Paris to Lyon AND from Lyon to Paris.

## Example
\`\`\`json
POST /road-segments
{
  "cityA": "Paris",
  "cityB": "Lyon",
  "distance": 465,
  "speedLimit": 130
}
\`\`\`
    `,
  })
  @ApiBody({
    type: CreateRoadSegmentRequest,
    description: 'Road segment data to create',
    examples: {
      highway: {
        summary: 'Paris-Lyon Highway',
        description: 'Typical highway segment with 130 km/h speed limit',
        value: {
          cityA: 'Paris',
          cityB: 'Lyon',
          distance: 465,
          speedLimit: 130,
        },
      },
      nationalRoad: {
        summary: 'National road',
        description: 'National road with 80 km/h speed limit',
        value: {
          cityA: 'Dijon',
          cityB: 'Beaune',
          distance: 45,
          speedLimit: 80,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Road segment created successfully. Returns segment information including its unique identifier.',
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
    status: 400,
    description: `
Invalid request. Possible causes:
- Negative or zero distance
- Negative or zero speed
- Empty city name
- Attempt to create a segment connecting a city to itself
    `,
    schema: {
      oneOf: [
        {
          example: {
            statusCode: 400,
            message: 'Distance must be positive',
            error: 'Invalid Distance',
          },
        },
        {
          example: {
            statusCode: 400,
            message: 'Cannot create a road segment connecting a city to itself',
            error: 'Invalid Road Segment',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description:
      'One of the specified cities does not exist in the database. Check the spelling or create the city first.',
    schema: {
      example: {
        statusCode: 404,
        message: 'City with name "Pariss" not found',
        error: 'City Not Found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal server error. Contact support if the problem persists.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Failed to save road segment',
        error: 'Internal Server Error',
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
