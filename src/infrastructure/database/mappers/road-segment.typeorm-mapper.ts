import { City, RoadSegment } from '@/domain/entities';
import {
  CityId,
  CityName,
  Distance,
  RoadSegmentId,
  Speed,
} from '@/domain/value-objects';
import { CityTypeormEntity, RoadSegmentTypeormEntity } from '../entities';

export interface RoadSegmentToDomainData {
  entity: RoadSegmentTypeormEntity;
  cityA: CityTypeormEntity;
  cityB: CityTypeormEntity;
}

export interface RoadSegmentFromDomainData {
  domain: RoadSegment;
  cityADbId: string;
  cityBDbId: string;
}

export class RoadSegmentTypeormMapper {
  static toDomain(data: RoadSegmentToDomainData): RoadSegment {
    return RoadSegment.reconstitute(
      RoadSegmentId.fromString(data.entity.id),
      [
        City.reconstitute(
          CityId.fromString(data.cityA.id),
          CityName.fromString(data.cityA.name),
        ),
        City.reconstitute(
          CityId.fromString(data.cityB.id),
          CityName.fromString(data.cityB.name),
        ),
      ],
      Distance.fromKilometers(Number(data.entity.distance)),
      Speed.fromKmPerHour(data.entity.speedLimit),
    );
  }

  static fromDomain(data: RoadSegmentFromDomainData): RoadSegmentTypeormEntity {
    const entity = new RoadSegmentTypeormEntity();
    entity.id = data.domain.id.value;
    entity.cityAId = data.cityADbId;
    entity.cityBId = data.cityBDbId;
    entity.distance = data.domain.distance.kilometers;
    entity.speedLimit = data.domain.speedLimit.kmPerHour;
    return entity;
  }
}
