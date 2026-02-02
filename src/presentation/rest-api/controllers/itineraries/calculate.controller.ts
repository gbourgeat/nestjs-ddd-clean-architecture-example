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
    summary: 'Rechercher le meilleur itinéraire entre deux villes',
    description: `
Calcule l'itinéraire le plus rapide entre deux villes françaises en utilisant l'algorithme de Dijkstra.

## Fonctionnement
- L'algorithme parcourt le réseau routier pour trouver le chemin optimal
- Le temps de trajet est calculé en fonction de la distance et des limites de vitesse
- Les conditions météorologiques actuelles sont prises en compte pour chaque segment

## Contraintes optionnelles
Vous pouvez filtrer les résultats avec des contraintes :
- **maxDistance** : Exclure les segments dépassant une certaine distance
- **minSpeed** : Exclure les segments avec une limite de vitesse trop basse
- **excludeWeather** : Éviter certaines conditions météo (rain, snow, fog, thunderstorm)

## Exemple d'utilisation
\`\`\`
GET /itineraries?from=Paris&to=Marseille
GET /itineraries?from=Paris&to=Lyon&maxDistance=500&excludeWeather=rain,snow
\`\`\`
    `,
  })
  @ApiQuery({
    name: 'from',
    required: true,
    description: 'Nom de la ville de départ (ex: Paris, Lyon, Marseille)',
    example: 'Paris',
  })
  @ApiQuery({
    name: 'to',
    required: true,
    description: "Nom de la ville d'arrivée (ex: Paris, Lyon, Marseille)",
    example: 'Lyon',
  })
  @ApiQuery({
    name: 'maxDistance',
    required: false,
    description:
      'Distance maximale autorisée par segment en kilomètres. Les segments plus longs seront exclus du calcul.',
    example: 500,
  })
  @ApiQuery({
    name: 'minSpeed',
    required: false,
    description:
      'Vitesse minimale requise en km/h. Les segments avec une limite inférieure seront exclus.',
    example: 100,
  })
  @ApiQuery({
    name: 'excludeWeather',
    required: false,
    description:
      'Conditions météo à éviter, séparées par des virgules. Valeurs possibles : sunny, cloudy, rain, snow, thunderstorm, fog',
    example: 'rain,snow',
  })
  @ApiResponse({
    status: 200,
    description:
      'Itinéraire calculé avec succès. Retourne le chemin optimal, la distance totale, le temps estimé et le détail de chaque étape.',
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
      "Requête invalide. Peut survenir si les paramètres sont manquants, mal formatés, ou si les villes de départ et d'arrivée sont identiques.",
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
      "Ville non trouvée. La ville de départ ou d'arrivée n'existe pas dans le réseau routier.",
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
      'Erreur serveur interne. Contactez le support si le problème persiste.',
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
