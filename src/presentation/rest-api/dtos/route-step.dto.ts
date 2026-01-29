import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { WeatherCondition } from '../../../domain/value-objects/weather-condition';

export class RouteStepDto {
  @ApiProperty({
    description: 'Ville de départ de cette étape',
    example: 'Paris',
    type: String,
  })
  from: string;

  @ApiProperty({
    description: 'Ville de destination de cette étape',
    example: 'Lyon',
    type: String,
  })
  to: string;

  @ApiProperty({
    description: 'Distance en kilomètres',
    example: 465,
    type: Number,
  })
  distance: number;

  @ApiProperty({
    description: 'Vitesse en km/h',
    example: 110,
    type: Number,
  })
  speed: number;

  @ApiPropertyOptional({
    description: 'Condition météorologique à la ville de destination',
    example: 'sunny',
    enum: ['sunny', 'cloudy', 'rain', 'snow', 'thunderstorm', 'fog', 'windy'],
  })
  weather?: WeatherCondition;
}
