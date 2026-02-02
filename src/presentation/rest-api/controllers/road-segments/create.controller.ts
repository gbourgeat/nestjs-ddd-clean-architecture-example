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
    summary: 'Créer un nouveau segment routier entre deux villes',
    description: `
Crée une connexion routière bidirectionnelle entre deux villes du réseau.

## Prérequis
- Les deux villes doivent déjà exister dans la base de données
- Les deux villes doivent être différentes (pas de boucle)

## Règles métier
- **Distance** : Doit être un nombre positif représentant les kilomètres
- **Vitesse** : Limite de vitesse en km/h (doit être positive)
- **Identifiant** : Généré automatiquement au format \`cityA__cityB\` (ordre alphabétique)

## Bidirectionnalité
Le segment créé est bidirectionnel : un segment Paris-Lyon permet de voyager de Paris vers Lyon ET de Lyon vers Paris.

## Exemple
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
    description: 'Données du segment routier à créer',
    examples: {
      autoroute: {
        summary: 'Autoroute Paris-Lyon',
        description: 'Segment autoroutier typique avec limite à 130 km/h',
        value: {
          cityA: 'Paris',
          cityB: 'Lyon',
          distance: 465,
          speedLimit: 130,
        },
      },
      nationale: {
        summary: 'Route nationale',
        description: 'Route nationale avec limite à 80 km/h',
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
      'Segment routier créé avec succès. Retourne les informations du segment incluant son identifiant unique.',
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
Requête invalide. Causes possibles :
- Distance négative ou nulle
- Vitesse négative ou nulle
- Nom de ville vide
- Tentative de créer un segment reliant une ville à elle-même
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
      "L'une des villes spécifiées n'existe pas dans la base de données. Vérifiez l'orthographe ou créez d'abord la ville.",
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
      'Erreur serveur interne. Contactez le support si le problème persiste.',
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
