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
    summary: "Modifier la limite de vitesse d'un segment routier",
    description: `
Met à jour la limite de vitesse d'un segment routier existant.

## Format de l'identifiant
L'identifiant du segment est au format \`cityA__cityB\` où les villes sont triées par ordre alphabétique.

**Exemples d'identifiants valides :**
- \`lyon__paris\` (Lyon-Paris)
- \`marseille__nice\` (Marseille-Nice)
- \`bordeaux__toulouse\` (Bordeaux-Toulouse)

## Cas d'utilisation
- Mise à jour suite à des travaux routiers
- Changement de réglementation
- Ajustement saisonnier (conditions hivernales)

## Exemple
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
Identifiant unique du segment routier au format \`cityA__cityB\`.

**Important** : Les noms de villes sont en minuscules et triés alphabétiquement.

Exemples :
- \`lyon__paris\` pour le segment Lyon-Paris
- \`marseille__nice\` pour le segment Marseille-Nice
    `,
    example: 'lyon__paris',
  })
  @ApiBody({
    type: UpdateRoadSegmentSpeedRequest,
    description: 'Nouvelle limite de vitesse à appliquer',
    examples: {
      autoroute: {
        summary: 'Vitesse autoroute standard',
        description: 'Limite de vitesse typique sur autoroute française',
        value: {
          newSpeedLimit: 130,
        },
      },
      travaux: {
        summary: 'Réduction pour travaux',
        description: 'Vitesse réduite temporairement pour travaux',
        value: {
          newSpeedLimit: 90,
        },
      },
      intemperies: {
        summary: 'Conditions météo dégradées',
        description: 'Vitesse adaptée aux conditions hivernales',
        value: {
          newSpeedLimit: 110,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Limite de vitesse mise à jour avec succès. Retourne le segment avec sa nouvelle configuration.',
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
Requête invalide. Causes possibles :
- Format d'identifiant incorrect (doit être \`cityA__cityB\`)
- Vitesse négative ou nulle
- Vitesse non numérique
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
      "Le segment routier spécifié n'existe pas. Vérifiez l'identifiant et l'ordre alphabétique des villes.",
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
      'Erreur serveur interne. Contactez le support si le problème persiste.',
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
