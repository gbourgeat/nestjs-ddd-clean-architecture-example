import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class SearchItineraryQuery {
  @ApiProperty({
    description: 'Starting city name',
    example: 'Paris',
  })
  @IsNotEmpty()
  @IsString()
  from: string;

  @ApiProperty({
    description: 'Destination city name',
    example: 'Lyon',
  })
  @IsNotEmpty()
  @IsString()
  to: string;

  @ApiPropertyOptional({
    description: 'Maximum allowed distance per segment (in km)',
    example: 500,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  maxDistance?: number;

  @ApiPropertyOptional({
    description: 'Minimum required speed on a segment (in km/h)',
    example: 100,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  minSpeed?: number;

  @ApiPropertyOptional({
    description: 'Weather conditions to exclude (comma-separated)',
    example: 'rain,snow',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value,
  )
  @IsArray()
  @IsString({ each: true })
  excludeWeather?: string[];
}
