import { CityId, CityName } from '@/domain/value-objects';

export class City {
  private constructor(
    public readonly id: CityId,
    public readonly name: CityName,
  ) {}

  static create(id: CityId, name: CityName): City {
    return new City(id, name);
  }

  static reconstitute(id: CityId, name: CityName): City {
    return new City(id, name);
  }

  equals(other: City): boolean {
    return this.id.equals(other.id);
  }
}
