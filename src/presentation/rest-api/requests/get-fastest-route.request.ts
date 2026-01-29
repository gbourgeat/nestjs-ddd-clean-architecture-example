import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RouteConstraints } from '@/presentation/rest-api/schemas';

export class GetFastestRouteRequest {
  @ApiProperty({
    description: 'Starting city name',
    example: 'Paris',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  startCity: string;

  @ApiProperty({
    description: 'Destination city name',
    example: 'Lyon',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  endCity: string;

  @ApiPropertyOptional({
    description: 'Optional constraints for route calculation',
    type: () => RouteConstraints,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RouteConstraints)
  constraints?: RouteConstraints;
}
