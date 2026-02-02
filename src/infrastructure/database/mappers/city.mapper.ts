import { City } from '@/domain/entities';
import { CityId, CityName } from '@/domain/value-objects';
import { CityTypeormEntity } from '../entities';

/**
 * Mapper between City domain entity and CityTypeormEntity
 */
export class CityMapper {
  /**
   * Maps from TypeORM entity to domain entity
   */
  static toDomain(entity: CityTypeormEntity): City {
    return City.reconstitute(
      CityId.fromNormalizedValue(entity.id),
      CityName.create(entity.name),
    );
  }

  /**
   * Maps from domain entity to TypeORM entity (for updates)
   */
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

  /**
   * Creates a partial TypeORM entity for creation (without ID)
   */
  static toTypeormForCreation(domain: City): Partial<CityTypeormEntity> {
    return {
      name: domain.name.value,
    };
  }
}
