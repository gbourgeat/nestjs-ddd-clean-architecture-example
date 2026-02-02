import { City } from '@/domain/entities';
import { CityNotFoundError } from '@/domain/errors';
import { CityRepository } from '@/domain/repositories';
import { CityId, CityName } from '@/domain/value-objects';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityTypeormEntity } from '../entities';

@Injectable()
export class CityTypeormRepository implements CityRepository {
  constructor(
    @InjectRepository(CityTypeormEntity)
    private readonly typeormRepository: Repository<CityTypeormEntity>,
  ) {}

  async findByName(name: CityName): Promise<City> {
    const city = await this.typeormRepository.findOne({
      where: { name: name.value },
    });

    if (!city) {
      throw CityNotFoundError.forCityName(name);
    }

    return City.create(
      CityId.fromNormalizedValue(city.id),
      CityName.create(city.name),
    );
  }

  async save(city: City): Promise<void> {
    // Try to find by name instead of id, since id in domain is name-based
    // but id in database is UUID-based
    const cityTypeormEntity = await this.typeormRepository.findOne({
      where: { name: city.name.value },
    });

    if (cityTypeormEntity) {
      // City already exists, update it
      cityTypeormEntity.name = city.name.value;
      await this.typeormRepository.save(cityTypeormEntity);
    } else {
      // New city, let PostgreSQL generate the UUID
      const newCityTypeormEntity = this.typeormRepository.create({
        name: city.name.value,
      });

      await this.typeormRepository.save(newCityTypeormEntity);
    }
  }
}
