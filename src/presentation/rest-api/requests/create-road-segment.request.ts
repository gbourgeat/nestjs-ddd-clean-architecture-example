import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreateRoadSegmentRequest {
  @ApiProperty({
    description: 'Name of the first city',
    example: 'Paris',
  })
  @IsNotEmpty()
  @IsString()
  cityA: string;

  @ApiProperty({
    description: 'Name of the second city',
    example: 'Lyon',
  })
  @IsNotEmpty()
  @IsString()
  cityB: string;

  @ApiProperty({
    description: 'Distance in kilometers',
    example: 465,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  distance: number;

  @ApiProperty({
    description: 'Speed limit in km/h',
    example: 130,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  speedLimit: number;
}
