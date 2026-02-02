import { City } from '@/domain/entities';
import { CityId, CityName } from '@/domain/value-objects';

describe('City', () => {
  it('should compare cities by id', () => {
    const city1 = City.create(
      CityId.fromNormalizedValueOrThrow('paris'),
      CityName.createOrThrow('Paris'),
    );
    const city2 = City.create(
      CityId.fromNormalizedValueOrThrow('paris'),
      CityName.createOrThrow('Paris'),
    );
    const city3 = City.create(
      CityId.fromNormalizedValueOrThrow('lyon'),
      CityName.createOrThrow('Lyon'),
    );

    expect(city1.equals(city2)).toBe(true);
    expect(city1.equals(city3)).toBe(false);
  });

  it('should expose uniqueKey getter', () => {
    const city = City.create(
      CityId.fromNormalizedValueOrThrow('paris'),
      CityName.createOrThrow('Paris'),
    );

    expect(city.uniqueKey).toBe('paris');
  });
});
