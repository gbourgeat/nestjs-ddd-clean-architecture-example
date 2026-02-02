import { City } from '@/domain/entities';
import { CityId, CityName } from '@/domain/value-objects';
import { CityTypeormEntity } from '../entities';

/**
 * Mapper between City domain entity and CityTypeormEntity
 */
export class CityTypeormMapper {
  /**
   * Maps from TypeORM entity to domain entity
   */
  static toDomain(entity: CityTypeormEntity): City {
    return City.reconstitute(
      CityId.fromString(entity.id),
      CityName.fromString(entity.name),
    );
  }

  /**
   * Maps from domain entity to TypeORM partial entity
   * Uses existing database ID on update, domain ID on creation
   */
  static fromDomain(
    domain: City,
    existingEntity?: CityTypeormEntity,
  ): Partial<CityTypeormEntity> {
    return {
      id: existingEntity?.id ?? domain.id.value,
      name: domain.name.value,
    };
  }
}
