import { City } from '@/domain/entities';
import { CityId, CityName } from '@/domain/value-objects';

describe('City', () => {
  const UUID_1 = '11111111-1111-1111-1111-111111111111';
  const UUID_2 = '22222222-2222-2222-2222-222222222222';

  it('should compare cities by id', () => {
    const city1 = City.create(
      CityId.fromString(UUID_1),
      CityName.fromString('Paris'),
    );
    const city2 = City.create(
      CityId.fromString(UUID_1),
      CityName.fromString('Paris'),
    );
    const city3 = City.create(
      CityId.fromString(UUID_2),
      CityName.fromString('Lyon'),
    );

    expect(city1.equals(city2)).toBe(true);
    expect(city1.equals(city3)).toBe(false);
  });

  it('should expose uniqueKey getter', () => {
    const city = City.create(
      CityId.fromString(UUID_1),
      CityName.fromString('Paris'),
    );

    expect(city.uniqueKey).toBe('paris');
  });
});
