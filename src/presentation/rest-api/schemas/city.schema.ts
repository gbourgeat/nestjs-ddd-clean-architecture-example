import { ApiProperty } from '@nestjs/swagger';

export class City {
  @ApiProperty({
    description: 'City name',
    example: 'Paris',
    type: String,
  })
  name!: string;
}
