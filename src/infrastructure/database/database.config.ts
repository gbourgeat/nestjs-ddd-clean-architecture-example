import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CityTypeormEntity, RoadSegmentTypeormEntity } from './entities';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number.parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'route_solver',
  entities: [CityTypeormEntity, RoadSegmentTypeormEntity],
  migrations: ['./migrations/*.{ts,js}'],
  migrationsRun: true, // Automatically run migrations on app start
  synchronize: true, // Enable synchronize toCity auto-create tables (for development)
  logging: process.env.NODE_ENV === 'development',
};
