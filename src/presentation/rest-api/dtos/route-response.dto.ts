import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RouteStepDto } from './route-step.dto';

export class RouteResponseDto {
  @ApiProperty({
    description:
      'Liste des villes dans le chemin optimal (vide si aucun itinéraire trouvé)',
    example: ['Paris', 'Lyon', 'Marseille'],
    type: [String],
    isArray: true,
  })
  path!: string[];

  @ApiPropertyOptional({
    description: 'Distance totale en kilomètres',
    example: 775,
    type: Number,
    required: false,
  })
  totalDistance?: number;

  @ApiPropertyOptional({
    description: 'Temps de trajet total estimé en heures',
    example: 7.1,
    type: Number,
    required: false,
  })
  estimatedTime?: number;

  @ApiPropertyOptional({
    description: 'Étapes détaillées du voyage',
    type: () => [RouteStepDto],
    isArray: true,
    required: false,
  })
  steps?: RouteStepDto[];
}
