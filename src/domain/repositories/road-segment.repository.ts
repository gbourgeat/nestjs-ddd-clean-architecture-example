import { Result } from '@/domain/common';
import { City, RoadSegment } from '@/domain/entities';
import {
  CityNotFoundError,
  PersistenceError,
  RoadSegmentNotFoundError,
} from '@/domain/errors';
import { CityName, RoadSegmentId } from '@/domain/value-objects';

export abstract class RoadSegmentRepository {
  abstract findAll(): Promise<Result<RoadSegment[], PersistenceError>>;
  abstract findById(
    id: RoadSegmentId,
  ): Promise<Result<RoadSegment, RoadSegmentNotFoundError>>;
  abstract save(
    roadSegment: RoadSegment,
  ): Promise<Result<void, PersistenceError>>;
  abstract findCityByName(
    name: CityName,
  ): Promise<Result<City, CityNotFoundError>>;
  abstract findAllCities(): Promise<City[]>;
}
