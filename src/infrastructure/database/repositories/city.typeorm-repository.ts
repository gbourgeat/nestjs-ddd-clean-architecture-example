import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityRepository } from '@/domain/repositories';
import { CityTypeormEntity } from '../entities';
import { CityId, CityName } from '@/domain/value-objects';
import { City } from '@/domain/entities';
import { CityNotFoundError } from '@/domain/errors';

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
    const cityTypeormEntity = await this.typeormRepository.findOne({
      where: { id: city.id.value },
    });

    if (cityTypeormEntity) {
      cityTypeormEntity.name = city.name.value;

      await this.typeormRepository.save(cityTypeormEntity);
    } else {
      const newCityTypeormEntity = this.typeormRepository.create({
        id: city.id.value,
        name: city.name.value,
      });

      await this.typeormRepository.save(newCityTypeormEntity);
    }
  }
}
