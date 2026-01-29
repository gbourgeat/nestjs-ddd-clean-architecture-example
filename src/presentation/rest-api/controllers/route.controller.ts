import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GetFastestRouteDto } from '../dtos/get-fastest-route.dto';
import { RouteResponseDto } from '../dtos/route-response.dto';
import { RoadConstraints } from '../../../domain/value-objects/road-constraints';
import { GetFastestRouteUseCase } from '../../../application/use-cases/get-fastest-route/get-fastest-route.use-case';
import { CityNotFoundError } from '../../../domain/errors/city-not-found.error';

@ApiTags('Routes')
@Controller()
export class RouteController {
  constructor(
    private readonly getFastestRouteUseCase: GetFastestRouteUseCase,
  ) {}

  @Post('/get-fastest-route')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: "Calculer l'itinéraire le plus rapide",
    description:
      "Calcule l'itinéraire le plus rapide entre deux villes en tenant compte de la météo et des contraintes optionnelles",
  })
  @ApiBody({
    type: GetFastestRouteDto,
    description: "Données de la requête pour le calcul de l'itinéraire",
    examples: {
      simple: {
        summary: 'Requête simple',
        value: {
          startCity: 'Paris',
          endCity: 'Marseille',
        },
      },
      withConstraints: {
        summary: 'Requête avec contraintes',
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
    description: 'Itinéraire calculé avec succès',
    type: RouteResponseDto,
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
    description: 'Ville non trouvée',
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
    description: 'Données de requête invalides',
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
    description: 'Erreur interne du serveur',
    schema: {
      example: {
        statusCode: 500,
        message: 'An error occurred while calculating the route',
        error: 'Internal Server Error',
      },
    },
  })
  async getFastestRoute(
    @Body() dto: GetFastestRouteDto,
  ): Promise<RouteResponseDto> {
    try {
      // Convert DTO constraints to domain value object
      const constraints = dto.constraints
        ? new RoadConstraints(
            dto.constraints.excludeWeather,
            dto.constraints.maxDistance,
            dto.constraints.minSpeed,
          )
        : undefined;

      // Execute use case
      const result = await this.getFastestRouteUseCase.execute({
        startCity: dto.startCity,
        endCity: dto.endCity,
        constraints,
      });

      if (!result.path.length) {
        return {
          path: [],
        };
      }

      // Map result to response DTO
      return {
        path: result.path,
        totalDistance: result.totalDistance,
        estimatedTime: result.estimatedTime,
        steps: result.steps,
      };
    } catch (error) {
      // Handle known errors
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

      if (error instanceof Error) {
        if (error.message.includes('not found in graph')) {
          throw new HttpException(
            {
              statusCode: HttpStatus.NOT_FOUND,
              message: error.message,
              error: 'City Not Found',
            },
            HttpStatus.NOT_FOUND,
          );
        }
      }

      // Re-throw unexpected errors
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
}
