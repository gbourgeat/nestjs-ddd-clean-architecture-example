import { UpdateRoadSegmentSpeedUseCase } from '@/application/use-cases/update-road-segment-speed';
import {
  InvalidRoadSegmentIdError,
  InvalidSpeedError,
  RoadSegmentNotFoundError,
} from '@/domain/errors';
import {
  updateRoadSegmentSpeedBody,
  updateRoadSegmentSpeedOperation,
  updateRoadSegmentSpeedParam,
  updateRoadSegmentSpeedResponses,
} from '@/presentation/rest-api/docs';
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
  @ApiOperation(updateRoadSegmentSpeedOperation)
  @ApiParam(updateRoadSegmentSpeedParam)
  @ApiBody(updateRoadSegmentSpeedBody)
  @ApiResponse(updateRoadSegmentSpeedResponses[200])
  @ApiResponse({ status: 400, ...updateRoadSegmentSpeedResponses[400] })
  @ApiResponse({ status: 404, ...updateRoadSegmentSpeedResponses[404] })
  @ApiResponse({ status: 500, ...updateRoadSegmentSpeedResponses[500] })
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
