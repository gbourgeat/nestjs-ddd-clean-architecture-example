import { UpdateRoadSegmentSpeedUseCase } from '@/application/use-cases/update-road-segment-speed';
import {
  InvalidRoadSegmentIdError,
  InvalidSpeedError,
  RoadSegmentNotFoundError,
} from '@/domain/errors';
import { UpdateRoadSegmentSpeedRequest } from '@/presentation/rest-api/requests';
import { UpdateRoadSegmentSpeedResponse } from '@/presentation/rest-api/responses';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Road Segments')
@Controller('road-segments')
export class UpdateRoadSegmentSpeedController {
  constructor(
    private readonly updateRoadSegmentSpeedUseCase: UpdateRoadSegmentSpeedUseCase,
  ) {}

  @Patch(':id')
  @ApiOperation({
    summary: 'Update the speed limit of a road segment',
    description: `
Updates the speed limit of an existing road segment.

## Identifier format
The segment identifier uses the format \`cityA__cityB\` where cities are sorted alphabetically.

**Valid identifier examples:**
- \`lyon__paris\` (Lyon-Paris)
- \`marseille__nice\` (Marseille-Nice)
- \`bordeaux__toulouse\` (Bordeaux-Toulouse)

## Use cases
- Update following road construction
- Regulatory changes
- Seasonal adjustments (winter conditions)

## Example
\`\`\`
PATCH /road-segments/lyon__paris
{
  "newSpeedLimit": 110
}
\`\`\`
    `,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: `
Unique identifier of the road segment in the format \`cityA__cityB\`.

**Important**: City names are lowercase and sorted alphabetically.

Examples:
- \`lyon__paris\` for the Lyon-Paris segment
- \`marseille__nice\` for the Marseille-Nice segment
    `,
    example: 'lyon__paris',
  })
  @ApiBody({
    type: UpdateRoadSegmentSpeedRequest,
    description: 'New speed limit to apply',
    examples: {
      highway: {
        summary: 'Standard highway speed',
        description: 'Typical speed limit on French highways',
        value: {
          newSpeedLimit: 130,
        },
      },
      construction: {
        summary: 'Construction zone reduction',
        description: 'Temporarily reduced speed for road construction',
        value: {
          newSpeedLimit: 90,
        },
      },
      weather: {
        summary: 'Degraded weather conditions',
        description: 'Speed adapted to winter conditions',
        value: {
          newSpeedLimit: 110,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Speed limit updated successfully. Returns the segment with its new configuration.',
    type: UpdateRoadSegmentSpeedResponse,
    example: {
      roadSegmentId: 'lyon__paris',
      cityA: 'Lyon',
      cityB: 'Paris',
      distance: 465,
      speedLimit: 110,
    },
  })
  @ApiResponse({
    status: 400,
    description: `
Invalid request. Possible causes:
- Incorrect identifier format (must be \`cityA__cityB\`)
- Negative or zero speed
- Non-numeric speed value
    `,
    schema: {
      oneOf: [
        {
          example: {
            statusCode: 400,
            message: 'Speed must be positive',
            error: 'Invalid Speed',
          },
        },
        {
          example: {
            statusCode: 400,
            message:
              'Invalid road segment ID format. Expected format: cityA__cityB',
            error: 'Invalid Road Segment ID',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description:
      'The specified road segment does not exist. Check the identifier and the alphabetical order of cities.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Road segment with id "paris__unknowncity" not found',
        error: 'Road Segment Not Found',
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
        message: 'Failed to update road segment',
        error: 'Internal Server Error',
      },
    },
  })
  async updateSpeed(
    @Param('id') id: string,
    @Body() dto: UpdateRoadSegmentSpeedRequest,
  ): Promise<UpdateRoadSegmentSpeedResponse> {
    const result = await this.updateRoadSegmentSpeedUseCase.execute({
      roadSegmentId: id,
      newSpeedLimit: dto.newSpeedLimit,
    });

    if (!result.success) {
      const error = result.error;

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
