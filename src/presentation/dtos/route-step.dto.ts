import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { WeatherCondition } from '../../domain/value-objects';

/**
 * DTO representing a single step in the route
 */
export class RouteStepDto {
  /**
   * Starting city of this step
   */
  @ApiProperty({
    description: 'Ville de départ de cette étape',
    example: 'Paris',
    type: String,
  })
  from: string;

  /**
   * Destination city of this step
   */
  @ApiProperty({
    description: 'Ville de destination de cette étape',
    example: 'Lyon',
    type: String,
  })
  to: string;

  /**
   * Distance in kilometers
   */
  @ApiProperty({
    description: 'Distance en kilomètres',
    example: 465,
    type: Number,
  })
  distance: number;

  /**
   * Speed in km/h
   */
  @ApiProperty({
    description: 'Vitesse en km/h',
    example: 110,
    type: Number,
  })
  speed: number;

  /**
   * Weather condition at the destination city
   */
  @ApiPropertyOptional({
    description: 'Condition météorologique à la ville de destination',
    example: 'sunny',
    enum: ['sunny', 'cloudy', 'rain', 'snow', 'thunderstorm', 'fog', 'windy'],
  })
  weather?: WeatherCondition;
}
