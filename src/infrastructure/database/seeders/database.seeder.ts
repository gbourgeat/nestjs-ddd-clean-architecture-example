import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CITIES, ROAD_SEGMENTS } from './road-segments.fixtures';
import { Repository } from 'typeorm';
import { RoadSegmentTypeormEntity, CityTypeormEntity } from '../entities';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectRepository(CityTypeormEntity)
    private readonly cityTypeormEntityRepository: Repository<CityTypeormEntity>,
    @InjectRepository(RoadSegmentTypeormEntity)
    private readonly roadSegmentTypeormEntityRepository: Repository<RoadSegmentTypeormEntity>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    this.logger.log('Starting database seeding...');

    try {
      // Check if static-graph-data already exists
      const existingCities = await this.cityTypeormEntityRepository.find();
      if (existingCities.length > 0) {
        this.logger.log('Database already seeded. Skipping...');

        return;
      }

      // Seed cities
      this.logger.log('Seeding cities...');
      const cityEntities: CityTypeormEntity[] = [];
      for (const cityData of CITIES) {
        const city = new CityTypeormEntity();
        city.name = cityData.name;

        const savedCity = await this.cityTypeormEntityRepository.save(city);
        cityEntities.push(savedCity);
      }

      this.logger.log(`Created ${cityEntities.length} cities`);

      const cityNameToId = new Map<string, string>();
      cityEntities.forEach((city) => {
        cityNameToId.set(city.name, city.id);
      });

      this.logger.log('Seeding road segments...');
      for (const segmentData of ROAD_SEGMENTS) {
        const segment = new RoadSegmentTypeormEntity();
        segment.cityAId = cityNameToId.get(segmentData.fromCityName)!;
        segment.cityBId = cityNameToId.get(segmentData.toCityName)!;
        segment.distance = segmentData.distance;
        segment.speedLimit = segmentData.speed;

        await this.roadSegmentTypeormEntityRepository.save(segment);
      }

      this.logger.log(`Created ${ROAD_SEGMENTS.length} road segments`);

      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Database seeding failed', error);

      throw error;
    }
  }
}
