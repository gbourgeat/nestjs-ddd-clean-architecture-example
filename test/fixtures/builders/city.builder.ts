import { City } from '@/domain/entities';
import { CityId, CityName } from '@/domain/value-objects';

export class CityBuilder {
  private id: CityId = CityId.fromNormalizedValueOrThrow('default-city-id');
  private name: CityName = CityName.createOrThrow('DefaultCity');

  static aCity(): CityBuilder {
    return new CityBuilder();
  }

  withId(id: string | CityId): this {
    this.id =
      typeof id === 'string' ? CityId.fromNormalizedValueOrThrow(id) : id;
    return this;
  }

  withName(name: string | CityName): this {
    this.name = typeof name === 'string' ? CityName.createOrThrow(name) : name;
    return this;
  }

  withIdFromName(name: string): this {
    this.name = CityName.createOrThrow(name);
    this.id = CityId.fromName(this.name);
    return this;
  }

  build(): City {
    return City.create(this.id, this.name);
  }
}

// Convenience methods for common test cities
export const CityFixtures = {
  paris: () => CityBuilder.aCity().withIdFromName('Paris').build(),
  lyon: () => CityBuilder.aCity().withIdFromName('Lyon').build(),
  marseille: () => CityBuilder.aCity().withIdFromName('Marseille').build(),
  nice: () => CityBuilder.aCity().withIdFromName('Nice').build(),
  toulouse: () => CityBuilder.aCity().withIdFromName('Toulouse').build(),
  bordeaux: () => CityBuilder.aCity().withIdFromName('Bordeaux').build(),
};
