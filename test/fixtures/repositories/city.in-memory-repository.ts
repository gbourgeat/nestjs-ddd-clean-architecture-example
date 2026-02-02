import { City } from '@/domain/entities';
import { CityNotFoundError } from '@/domain/errors';
import { CityRepository } from '@/domain/repositories';
import { CityName } from '@/domain/value-objects';

export class CityInMemoryRepository extends CityRepository {
  private cities: Map<string, City> = new Map();

  async findByName(name: CityName): Promise<City> {
    const city = this.cities.get(name.value);
    if (!city) {
      throw CityNotFoundError.forCityName(name);
    }
    return city;
  }

  async save(city: City): Promise<void> {
    this.cities.set(city.name.value, city);
  }

  // Utility methods for testing
  clear(): void {
    this.cities.clear();
  }

  givenCities(cities: City[]): void {
    cities.forEach((city) => {
      this.cities.set(city.name.value, city);
    });
  }

  getAll(): City[] {
    return Array.from(this.cities.values());
  }
}
