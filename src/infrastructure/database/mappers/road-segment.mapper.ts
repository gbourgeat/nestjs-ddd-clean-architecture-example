import { City, RoadSegment } from '@/domain/entities';
import {
  CityId,
  CityName,
  Distance,
  RoadSegmentId,
  Speed,
} from '@/domain/value-objects';
import { CityTypeormEntity, RoadSegmentTypeormEntity } from '../entities';

/**
 * Mapper between RoadSegment domain entity and RoadSegmentTypeormEntity
 */
export class RoadSegmentMapper {
  /**
   * Maps from TypeORM entity to domain entity
   * Requires city entities to build the complete domain model
   */
  static toDomain(
    entity: RoadSegmentTypeormEntity,
    cityA: CityTypeormEntity,
    cityB: CityTypeormEntity,
  ): RoadSegment {
    return RoadSegment.reconstitute(
      RoadSegmentId.fromCityNamesOrThrow(cityA.name, cityB.name),
      [
        City.reconstitute(
          CityId.fromNormalizedValueOrThrow(cityA.id),
          CityName.createOrThrow(cityA.name),
        ),
        City.reconstitute(
          CityId.fromNormalizedValueOrThrow(cityB.id),
          CityName.createOrThrow(cityB.name),
        ),
      ],
      Distance.fromKilometersOrThrow(Number(entity.distance)),
      Speed.fromKmPerHourOrThrow(entity.speedLimit),
    );
  }

  /**
   * Maps from domain entity to TypeORM entity (for updates)
   * Requires database city IDs (UUIDs) since domain uses name-based IDs
   */
  static toTypeorm(
    domain: RoadSegment,
    cityADatabaseId: string,
    cityBDatabaseId: string,
    existingEntity?: RoadSegmentTypeormEntity,
  ): RoadSegmentTypeormEntity {
    const entity = existingEntity || new RoadSegmentTypeormEntity();

    entity.cityAId = cityADatabaseId;
    entity.cityBId = cityBDatabaseId;
    entity.distance = domain.distance.kilometers;
    entity.speedLimit = domain.speedLimit.kmPerHour;

    // If updating an existing entity, preserve its database ID
    if (existingEntity) {
      entity.id = existingEntity.id;
    }

    return entity;
  }

  /**
   * Creates a partial TypeORM entity for creation (without ID)
   */
  static toTypeormForCreation(
    domain: RoadSegment,
    cityADatabaseId: string,
    cityBDatabaseId: string,
  ): Partial<RoadSegmentTypeormEntity> {
    return {
      cityAId: cityADatabaseId,
      cityBId: cityBDatabaseId,
      distance: domain.distance.kilometers,
      speedLimit: domain.speedLimit.kmPerHour,
    };
  }
}
