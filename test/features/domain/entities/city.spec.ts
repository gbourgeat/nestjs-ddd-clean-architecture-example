import { City } from '@/domain/entities';
import { CityId, CityName } from '@/domain/value-objects';

describe('City', () => {
  it('should compare cities by id', () => {
    const city1 = City.create(
      CityId.fromNormalizedValue('paris'),
      CityName.create('Paris'),
    );
    const city2 = City.create(
      CityId.fromNormalizedValue('paris'),
      CityName.create('Paris'),
    );
    const city3 = City.create(
      CityId.fromNormalizedValue('lyon'),
      CityName.create('Lyon'),
    );

    expect(city1.equals(city2)).toBe(true);
    expect(city1.equals(city3)).toBe(false);
  });
});
