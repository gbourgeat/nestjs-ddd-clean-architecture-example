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
    description:
      'Update the speed limit of a road segment identified by its ID (format: cityA__cityB in alphabetical order).',
  })
  @ApiParam({
    name: 'id',
    description: 'Road segment ID (format: cityA__cityB, e.g., "lyon__paris")',
    example: 'lyon__paris',
  })
  @ApiBody({
    type: UpdateRoadSegmentSpeedRequest,
    description: 'New speed limit data',
    examples: {
      simple: {
        summary: 'Update speed limit',
        value: {
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
