import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('road_segments')
export class RoadSegmentTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cityAId: string;

  @Column()
  cityBId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  distance: number;

  @Column('int')
  speedLimit: number;
}
