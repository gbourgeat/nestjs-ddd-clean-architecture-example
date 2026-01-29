import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConstraintsDto } from './constraints.dto';

export class GetFastestRouteDto {
  @ApiProperty({
    description: 'Nom de la ville de départ',
    example: 'Paris',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  startCity: string;

  @ApiProperty({
    description: 'Nom de la ville de destination',
    example: 'Lyon',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  endCity: string;

  @ApiPropertyOptional({
    description: "Contraintes optionnelles pour le calcul de l'itinéraire",
    type: () => ConstraintsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConstraintsDto)
  constraints?: ConstraintsDto;
}
