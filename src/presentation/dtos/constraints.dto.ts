import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for route constraints
 */
export class ConstraintsDto {
  @ApiPropertyOptional({
    description:
      "Conditions météorologiques à exclure dans le calcul de l'itinéraire",
    example: ['rain', 'snow'],
    type: [String],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeWeather?: string[];

  @ApiPropertyOptional({
    description: 'Distance maximale autorisée par tronçon individuel (en km)',
    example: 500,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDistance?: number;

  @ApiPropertyOptional({
    description: 'Vitesse minimale requise sur un tronçon (en km/h)',
    example: 100,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSpeed?: number;
}
