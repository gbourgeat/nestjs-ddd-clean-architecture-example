import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RouteConstraints {
  @ApiPropertyOptional({
    description: 'Weather conditions to exclude in route calculation',
    example: ['rain', 'snow'],
    type: [String],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeWeather?: string[];

  @ApiPropertyOptional({
    description: 'Maximum allowed distance per individual segment (in km)',
    example: 500,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDistance?: number;

  @ApiPropertyOptional({
    description: 'Minimum required speed on a segment (in km/h)',
    example: 100,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSpeed?: number;
}
