import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RouteStep } from '../schemas/route-step.schema';

export class GetFastestRouteResponse {
  @ApiProperty({
    description: 'List of cities in the optimal path (empty if no route found)',
    example: ['Paris', 'Lyon', 'Marseille'],
    type: [String],
    isArray: true,
  })
  path!: string[];

  @ApiPropertyOptional({
    description: 'Total distance in kilometers',
    example: 775,
    type: Number,
    required: false,
  })
  totalDistance?: number;

  @ApiPropertyOptional({
    description: 'Estimated total travel time in hours',
    example: 7.1,
    type: Number,
    required: false,
  })
  estimatedTime?: number;

  @ApiPropertyOptional({
    description: 'Detailed journey steps',
    type: () => [RouteStep],
    isArray: true,
    required: false,
  })
  steps?: RouteStep[];
}
