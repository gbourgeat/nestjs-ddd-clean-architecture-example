import { CreateRoadSegmentUseCase } from '@/application/use-cases/create-road-segment';
import {
  CityNotFoundError,
  InvalidCityNameError,
  RoadSegmentCreationError,
} from '@/domain/errors';
import {
  createRoadSegmentBody,
  createRoadSegmentOperation,
  createRoadSegmentResponses,
} from '@/presentation/rest-api/docs';
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
  @ApiOperation(createRoadSegmentOperation)
  @ApiBody(createRoadSegmentBody)
  @ApiResponse(createRoadSegmentResponses[201])
  @ApiResponse({ status: 400, ...createRoadSegmentResponses[400] })
  @ApiResponse({ status: 404, ...createRoadSegmentResponses[404] })
  @ApiResponse({ status: 500, ...createRoadSegmentResponses[500] })
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
