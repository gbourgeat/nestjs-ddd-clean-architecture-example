import { Result, fail, ok } from '@/domain/common';
import { City, RoadSegment } from '@/domain/entities';
import {
  CityNotFoundError,
  PersistenceError,
  RoadSegmentNotFoundError,
} from '@/domain/errors';
import { RoadSegmentRepository } from '@/domain/repositories';
import { CityName, RoadSegmentId } from '@/domain/value-objects';

export class RoadSegmentInMemoryRepository extends RoadSegmentRepository {
  private roadSegments: Map<string, RoadSegment> = new Map();
  private cities: Map<string, City> = new Map();

  async findAll(): Promise<RoadSegment[]> {
    return Array.from(this.roadSegments.values());
  }

  async findById(
    id: RoadSegmentId,
  ): Promise<Result<RoadSegment, RoadSegmentNotFoundError>> {
    const roadSegment = this.roadSegments.get(id.value);
    if (!roadSegment) {
      return fail(RoadSegmentNotFoundError.forRoadSegmentId(id));
    }
    return ok(roadSegment);
  }

  async save(
    roadSegment: RoadSegment,
  ): Promise<Result<void, PersistenceError>> {
    // Auto-register cities from the road segment
    this.registerCity(roadSegment.cityA);
    this.registerCity(roadSegment.cityB);
    this.roadSegments.set(roadSegment.id.value, roadSegment);
    return ok(undefined);
  }

  async findCityByName(
    name: CityName,
  ): Promise<Result<City, CityNotFoundError>> {
    const city = this.cities.get(name.toNormalized());
    if (!city) {
      return fail(CityNotFoundError.forCityName(name));
    }
    return ok(city);
  }

  async findAllCities(): Promise<City[]> {
    return Array.from(this.cities.values());
  }

  // Utility methods for testing
  clear(): void {
    this.roadSegments.clear();
    this.cities.clear();
  }

  givenRoadSegments(roadSegments: RoadSegment[]): void {
    roadSegments.forEach((segment) => {
      // Also register cities from the segments
      this.registerCity(segment.cityA);
      this.registerCity(segment.cityB);
      this.roadSegments.set(segment.id.value, segment);
    });
  }

  givenCities(cities: City[]): void {
    cities.forEach((city) => this.registerCity(city));
  }

  getAll(): RoadSegment[] {
    return Array.from(this.roadSegments.values());
  }

  private registerCity(city: City): void {
    this.cities.set(city.uniqueKey, city);
  }
}
