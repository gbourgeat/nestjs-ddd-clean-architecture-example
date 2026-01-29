import { ApiProperty } from '@nestjs/swagger';

export class CityDto {
  @ApiProperty({
    description: 'Nom de la ville',
    example: 'Paris',
    type: String,
  })
  name!: string;
}

export class CitiesResponseDto {
  @ApiProperty({
    description: 'Liste de toutes les villes disponibles',
    type: [CityDto],
    isArray: true,
    example: [
      { name: 'Paris' },
      { name: 'Lyon' },
      { name: 'Marseille' },
      { name: 'Lille' },
    ],
  })
  cities!: CityDto[];
}
