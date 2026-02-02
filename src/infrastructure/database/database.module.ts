import { RoadSegmentRepository } from '@/domain/repositories';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database.config';
import { CityTypeormEntity, RoadSegmentTypeormEntity } from './entities';
import { RoadSegmentTypeormRepository } from './repositories';
import { DatabaseSeeder } from './seeders/database.seeder';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([CityTypeormEntity, RoadSegmentTypeormEntity]),
  ],
  providers: [
    {
      provide: RoadSegmentRepository,
      useClass: RoadSegmentTypeormRepository,
    },
    DatabaseSeeder,
  ],
  exports: [RoadSegmentRepository],
})
export class DatabaseModule {}
