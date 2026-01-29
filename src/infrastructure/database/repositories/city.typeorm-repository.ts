import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityRepository } from '../../../domain/repositories/city.repository';
import { City } from '../../../domain/entities/city';
import { CityId } from '../../../domain/value-objects/city-id';
import { CityName } from '../../../domain/value-objects/city-name';
import { CityNotFoundError } from '../../../domain/errors/city-not-found.error';
import { CityTypeormEntity } from '../entities/city.typeorm-entity';

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
