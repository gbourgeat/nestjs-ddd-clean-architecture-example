import { City } from '@/domain/entities';
import { CityId, CityName } from '@/domain/value-objects';
import { CityTypeormEntity } from '../entities';

export class CityMapper {
  static toDomain(entity: CityTypeormEntity): City {
    return City.reconstitute(
      CityId.fromString(entity.id),
      CityName.fromString(entity.name),
    );
  }

  static toTypeorm(
    domain: City,
    existingEntity?: CityTypeormEntity,
  ): CityTypeormEntity {
    const entity = existingEntity || new CityTypeormEntity();

    // Only map the name, let PostgreSQL handle the UUID
    entity.name = domain.name.value;

    // If updating an existing entity, preserve its database ID
    if (existingEntity) {
      entity.id = existingEntity.id;
    }

    return entity;
  }

  static toTypeormForCreation(domain: City): Partial<CityTypeormEntity> {
    return {
      name: domain.name.value,
    };
  }
}
