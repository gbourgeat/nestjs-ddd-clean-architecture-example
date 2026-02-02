import { City } from '@/domain/entities';
import { CityId, CityName } from '@/domain/value-objects';
import { CityTypeormEntity } from '../entities';

export class CityTypeormMapper {
  static toDomain(typeormEntity: CityTypeormEntity): City {
    return City.reconstitute(
      CityId.fromString(typeormEntity.id),
      CityName.fromString(typeormEntity.name),
    );
  }

  static fromDomain(domainEntity: City): CityTypeormEntity {
    const entity = new CityTypeormEntity();
    entity.id = domainEntity.id.value;
    entity.name = domainEntity.name.value;
    return entity;
  }
}
