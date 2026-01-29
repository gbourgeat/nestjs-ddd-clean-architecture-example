import { CityName } from '@/domain/value-objects';
import { City } from '@/domain/entities';

export abstract class CityRepository {
  abstract findByName(name: CityName): Promise<City>;
  abstract save(city: City): Promise<void>;
}
