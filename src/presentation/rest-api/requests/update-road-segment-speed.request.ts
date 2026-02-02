import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateRoadSegmentSpeedRequest {
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
