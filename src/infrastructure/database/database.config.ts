import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CityTypeormEntity } from './entities/city.typeorm-entity';
import { RoadSegmentTypeormEntity } from './entities/route.typeorm-entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'wavo_route_solver',
  entities: [CityTypeormEntity, RoadSegmentTypeormEntity],
  migrations: ['./migrations/*.{ts,js}'],
  migrationsRun: true, // Automatically run migrations on app start
  synchronize: false, // Disable synchronize when using migrations
  logging: process.env.NODE_ENV !== 'production',
};
