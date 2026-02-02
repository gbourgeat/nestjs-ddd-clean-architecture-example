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
  Patch,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Road Segments')
@Controller()
export class UpdateRoadSegmentSpeedController {
  constructor(
    private readonly updateRoadSegmentSpeedUseCase: UpdateRoadSegmentSpeedUseCase,
  ) {}

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
    const result = await this.updateRoadSegmentSpeedUseCase.execute({
      cityA: dto.cityA,
      cityB: dto.cityB,
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
