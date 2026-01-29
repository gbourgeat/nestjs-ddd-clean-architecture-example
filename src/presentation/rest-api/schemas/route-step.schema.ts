import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RouteStep {
  @ApiProperty({
    description: 'Starting city of this step',
    example: 'Paris',
    type: String,
  })
  from: string;

  @ApiProperty({
    description: 'Destination city of this step',
    example: 'Lyon',
    type: String,
  })
  to: string;

  @ApiProperty({
    description: 'Distance in kilometers',
    example: 465,
    type: Number,
  })
  distance: number;

  @ApiProperty({
    description: 'Speed in km/h',
    example: 110,
    type: Number,
  })
  speed: number;

  @ApiPropertyOptional({
    description: 'Weather condition at the destination city',
    example: 'sunny',
    enum: ['sunny', 'cloudy', 'rain', 'snow', 'thunderstorm', 'fog', 'windy'],
  })
  weather?: string;
}
