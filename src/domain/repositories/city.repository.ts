import { City } from '../entities/city';
import { CityName } from '../value-objects/city-name';

export abstract class CityRepository {
  abstract findByName(name: CityName): Promise<City>;
  abstract save(city: City): Promise<void>;
}
