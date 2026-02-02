import { GetFastestRouteUseCase } from '@/application/use-cases/get-fastest-route';
import {
  CityNotFoundError,
  InvalidCityNameError,
  SameStartAndEndCityError,
} from '@/domain/errors';
import { RouteResponseMapper } from '@/presentation/rest-api/mappers';
import { SearchItineraryQuery } from '@/presentation/rest-api/queries';
import { GetFastestRouteResponse } from '@/presentation/rest-api/responses';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Itineraries')
@Controller('itineraries')
export class CalculateItineraryController {
  constructor(
    private readonly getFastestRouteUseCase: GetFastestRouteUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Search for the fastest itinerary between two cities',
    description: `
Calculates the fastest itinerary between two French cities using Dijkstra's algorithm.

## How it works
- The algorithm traverses the road network to find the optimal path
- Travel time is calculated based on distance and speed limits
- Current weather conditions are taken into account for each segment

## Optional constraints
You can filter results with constraints:
- **maxDistance**: Exclude segments exceeding a certain distance
- **minSpeed**: Exclude segments with a speed limit below a threshold
- **excludeWeather**: Avoid certain weather conditions (rain, snow, fog, thunderstorm)

## Usage examples
\`\`\`
GET /itineraries?from=Paris&to=Marseille
GET /itineraries?from=Paris&to=Lyon&maxDistance=500&excludeWeather=rain,snow
\`\`\`
    `,
  })
  @ApiQuery({
    name: 'from',
    required: true,
    description: 'Name of the departure city (e.g., Paris, Lyon, Marseille)',
    example: 'Paris',
  })
  @ApiQuery({
    name: 'to',
    required: true,
    description: 'Name of the destination city (e.g., Paris, Lyon, Marseille)',
    example: 'Lyon',
  })
  @ApiQuery({
    name: 'maxDistance',
    required: false,
    description:
      'Maximum allowed distance per segment in kilometers. Longer segments will be excluded from the calculation.',
    example: 500,
  })
  @ApiQuery({
    name: 'minSpeed',
    required: false,
    description:
      'Minimum required speed in km/h. Segments with a lower speed limit will be excluded.',
    example: 100,
  })
  @ApiQuery({
    name: 'excludeWeather',
    required: false,
    description:
      'Weather conditions to avoid, separated by commas. Possible values: sunny, cloudy, rain, snow, thunderstorm, fog',
    example: 'rain,snow',
  })
  @ApiResponse({
    status: 200,
    description:
      'Itinerary calculated successfully. Returns the optimal path, total distance, estimated time, and details for each step.',
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
          speed: 130,
          weather: 'sunny',
        },
        {
          from: 'Lyon',
          to: 'Marseille',
          distance: 310,
          speed: 130,
          weather: 'cloudy',
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request. May occur if parameters are missing, malformed, or if departure and destination cities are the same.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Start and end cities cannot be the same',
        error: 'Same Start And End City',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description:
      'City not found. The departure or destination city does not exist in the road network.',
    schema: {
      example: {
        statusCode: 404,
        message: 'City "UnknownCity" not found',
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
        message: 'An unexpected error occurred',
        error: 'Internal Server Error',
      },
    },
  })
  async search(
    @Query() query: SearchItineraryQuery,
  ): Promise<GetFastestRouteResponse> {
    const result = await this.getFastestRouteUseCase.execute({
      startCity: query.from,
      endCity: query.to,
      constraints:
        query.maxDistance || query.minSpeed || query.excludeWeather
          ? {
              maxDistance: query.maxDistance,
              minSpeedLimit: query.minSpeed,
              excludeWeatherConditions: query.excludeWeather,
            }
          : undefined,
    });

    if (!result.success) {
      const error = result.error;

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

    return RouteResponseMapper.toDto(result.value);
  }
}
