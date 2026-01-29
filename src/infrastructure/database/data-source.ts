import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { CityTypeormEntity, RoadSegmentTypeormEntity } from './entities';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'route_solver',
  entities: [CityTypeormEntity, RoadSegmentTypeormEntity],
  migrations: ['./migrations/*.{ts,js}'],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
