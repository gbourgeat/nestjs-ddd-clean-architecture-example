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
export class RoadSegmentTypeormMapper {
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
      RoadSegmentId.fromString(entity.id),
      [
        City.reconstitute(
          CityId.fromString(cityA.id),
          CityName.fromString(cityA.name),
        ),
        City.reconstitute(
          CityId.fromString(cityB.id),
          CityName.fromString(cityB.name),
        ),
      ],
      Distance.fromKilometersOrThrow(Number(entity.distance)),
      Speed.fromKmPerHourOrThrow(entity.speedLimit),
    );
  }

  /**
   * Maps from domain entity to TypeORM partial entity
   * Uses existing database ID on update, domain ID on creation
   */
  static fromDomain(
    domain: RoadSegment,
    cityADatabaseId: string,
    cityBDatabaseId: string,
    existingEntity?: RoadSegmentTypeormEntity,
  ): Partial<RoadSegmentTypeormEntity> {
    return {
      id: existingEntity?.id ?? domain.id.value,
      cityAId: cityADatabaseId,
      cityBId: cityBDatabaseId,
      distance: domain.distance.kilometers,
      speedLimit: domain.speedLimit.kmPerHour,
    };
  }
}
