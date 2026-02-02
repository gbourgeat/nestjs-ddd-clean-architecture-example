import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoadSegmentSpeedResponse {
  @ApiProperty({
    description: 'ID of the road segment (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  roadSegmentId: string;

  @ApiProperty({
    description: 'Name of the first city',
    example: 'Lyon',
  })
  cityA: string;

  @ApiProperty({
    description: 'Name of the second city',
    example: 'Paris',
  })
  cityB: string;

  @ApiProperty({
    description: 'Distance in kilometers',
    example: 465,
  })
  distance: number;

  @ApiProperty({
    description: 'Updated speed limit in km/h',
    example: 130,
  })
  speedLimit: number;
}
