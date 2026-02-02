import { City } from '@/domain/entities';
import { CityNotFoundError } from '@/domain/errors';
import { CityRepository } from '@/domain/repositories';
import { CityName } from '@/domain/value-objects';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityTypeormEntity } from '../entities';
import { CityMapper } from '../mappers';

@Injectable()
export class CityTypeormRepository implements CityRepository {
  constructor(
    @InjectRepository(CityTypeormEntity)
    private readonly typeormRepository: Repository<CityTypeormEntity>,
  ) {}

  async findByName(name: CityName): Promise<City> {
    const cityEntity = await this.typeormRepository.findOne({
      where: { name: name.value },
    });

    if (!cityEntity) {
      throw CityNotFoundError.forCityName(name);
    }

    return CityMapper.toDomain(cityEntity);
  }

  async save(city: City): Promise<void> {
    // Try to find by name instead of id, since id in domain is name-based
    // but id in database is UUID-based
    const existingEntity = await this.typeormRepository.findOne({
      where: { name: city.name.value },
    });

    if (existingEntity) {
      // City already exists, update it
      const updatedEntity = CityMapper.toTypeorm(city, existingEntity);
      await this.typeormRepository.save(updatedEntity);
    } else {
      // New city, let PostgreSQL generate the UUID
      const newEntityData = CityMapper.toTypeormForCreation(city);
      const newEntity = this.typeormRepository.create(newEntityData);
      await this.typeormRepository.save(newEntity);
    }
  }
}
