import { City } from '@/domain/entities';
import { CityId, CityName } from '@/domain/value-objects';

// Fixed UUIDs for test reproducibility
const CITY_UUIDS = {
  paris: '11111111-1111-1111-1111-111111111111',
  lyon: '22222222-2222-2222-2222-222222222222',
  marseille: '33333333-3333-3333-3333-333333333333',
  nice: '44444444-4444-4444-4444-444444444444',
  toulouse: '55555555-5555-5555-5555-555555555555',
  bordeaux: '66666666-6666-6666-6666-666666666666',
  dijon: '77777777-7777-7777-7777-777777777777',
} as const;

export class CityBuilder {
  private id: CityId = CityId.generate();
  private name: CityName = CityName.fromString('DefaultCity');

  static aCity(): CityBuilder {
    return new CityBuilder();
  }

  withId(id: string | CityId): this {
    this.id = typeof id === 'string' ? CityId.fromString(id) : id;
    return this;
  }

  withName(name: string | CityName): this {
    this.name = typeof name === 'string' ? CityName.fromString(name) : name;
    return this;
  }

  build(): City {
    return City.create(this.id, this.name);
  }
}

// Convenience methods for common test cities with fixed UUIDs
export const CityFixtures = {
  paris: () =>
    CityBuilder.aCity().withId(CITY_UUIDS.paris).withName('Paris').build(),
  lyon: () =>
    CityBuilder.aCity().withId(CITY_UUIDS.lyon).withName('Lyon').build(),
  marseille: () =>
    CityBuilder.aCity()
      .withId(CITY_UUIDS.marseille)
      .withName('Marseille')
      .build(),
  nice: () =>
    CityBuilder.aCity().withId(CITY_UUIDS.nice).withName('Nice').build(),
  toulouse: () =>
    CityBuilder.aCity()
      .withId(CITY_UUIDS.toulouse)
      .withName('Toulouse')
      .build(),
  bordeaux: () =>
    CityBuilder.aCity()
      .withId(CITY_UUIDS.bordeaux)
      .withName('Bordeaux')
      .build(),
  dijon: () =>
    CityBuilder.aCity().withId(CITY_UUIDS.dijon).withName('Dijon').build(),
};

// Export UUIDs for test assertions
export const CITY_TEST_UUIDS = CITY_UUIDS;
