import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database.config';
import { CityRepository, RoadSegmentRepository } from '@/domain/repositories';
import { DatabaseSeeder } from './seeders/database.seeder';
import {
  CityTypeormRepository,
  RoadSegmentTypeormRepository,
} from './repositories';
import { CityTypeormEntity, RoadSegmentTypeormEntity } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([CityTypeormEntity, RoadSegmentTypeormEntity]),
  ],
  providers: [
    {
      provide: CityRepository,
      useClass: CityTypeormRepository,
    },
    {
      provide: RoadSegmentRepository,
      useClass: RoadSegmentTypeormRepository,
    },
    DatabaseSeeder,
  ],
  exports: [CityRepository, RoadSegmentRepository],
})
export class DatabaseModule {}
