import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class UpdateRoadSegmentSpeedRequest {
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
    description: 'New speed limit in km/h',
    example: 130,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  newSpeedLimit: number;
}
