import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('road_segments')
export class RoadSegmentTypeormEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'city_a_id' })
  cityAId: string;

  @Column({ name: 'city_b_id' })
  cityBId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  distance: number;

  @Column('int', { name: 'speed_limit' })
  speedLimit: number;
}
