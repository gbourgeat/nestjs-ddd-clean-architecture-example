import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RouteStepDto } from './route-step.dto';

/**
 * DTO for the response containing the calculated route
 */
export class RouteResponseDto {
  /**
   * List of cities in the optimal path
   * Empty array if no route is found
   */
  @ApiProperty({
    description:
      'Liste des villes dans le chemin optimal (vide si aucun itinéraire trouvé)',
    example: ['Paris', 'Lyon', 'Marseille'],
    type: [String],
    isArray: true,
  })
  path!: string[];

  /**
   * Total distance in kilometers
   */
  @ApiPropertyOptional({
    description: 'Distance totale en kilomètres',
    example: 775,
    type: Number,
    required: false,
  })
  totalDistance?: number;

  /**
   * Estimated total travel time in hours
   */
  @ApiPropertyOptional({
    description: 'Temps de trajet total estimé en heures',
    example: 7.1,
    type: Number,
    required: false,
  })
  estimatedTime?: number;

  /**
   * Detailed steps of the journey
   */
  @ApiPropertyOptional({
    description: 'Étapes détaillées du voyage',
    type: () => [RouteStepDto],
    isArray: true,
    required: false,
  })
  steps?: RouteStepDto[];
}
