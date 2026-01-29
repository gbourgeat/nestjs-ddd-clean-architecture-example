import { ApiProperty } from '@nestjs/swagger';
import { City } from '../schemas/city.schema';

export class GetCitiesResponse {
  @ApiProperty({
    description: 'List of all available cities',
    type: [City],
    isArray: true,
    example: [
      { name: 'Paris' },
      { name: 'Lyon' },
      { name: 'Marseille' },
      { name: 'Lille' },
    ],
  })
  cities!: City[];
}
