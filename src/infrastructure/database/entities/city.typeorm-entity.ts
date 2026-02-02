import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cities')
export class CityTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;
}
