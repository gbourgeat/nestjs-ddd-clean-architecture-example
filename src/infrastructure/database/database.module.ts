import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database.config';
import { CityRepository } from '../../domain/repositories/city.repository';
import { RoadSegmentRepository } from '../../domain/repositories/road-segment.repository';
import { DatabaseSeeder } from './seeders/database.seeder';
import { CityTypeormRepository } from './repositories/city.typeorm-repository';
import { RoadSegmentTypeormRepository } from './repositories/road-segment.typeorm-repository';
import { CityTypeormEntity } from './entities/city.typeorm-entity';
import { RoadSegmentTypeormEntity } from './entities/route.typeorm-entity';

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
