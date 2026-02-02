import { City } from '@/domain/entities';
import { CityName } from '@/domain/value-objects';

export abstract class CityRepository {
  abstract findByName(name: CityName): Promise<City>;
  abstract save(city: City): Promise<void>;
}
