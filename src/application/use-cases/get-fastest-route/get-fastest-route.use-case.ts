import {
  PathfindingResultMapper,
  RoadConstraintsMapper,
} from '@/application/mappers';
import {
  GetFastestRoadOutput,
  GetFastestRouteInput,
} from '@/application/use-cases/get-fastest-route';
import { SameStartAndEndCityError } from '@/domain/errors';
import { CityRepository, RoadSegmentRepository } from '@/domain/repositories';
import { PathFinder } from '@/domain/services';
import { CityName } from '@/domain/value-objects';

export class GetFastestRouteUseCase {
  constructor(
    private readonly pathFinder: PathFinder,
    private readonly roadSegmentRepository: RoadSegmentRepository,
    private readonly cityRepository: CityRepository,
  ) {}

  /**
   * @throws CityNotFoundError if start or end city cannot be found in the graph
   * @throws InvalidWeatherConditionError if invalid weatherCondition conditions are provided in constraints
   * @throws SameStartAndEndCityError if start and end cities are the same
   */
  async execute({
    startCity,
    endCity,
    constraints,
  }: GetFastestRouteInput): Promise<GetFastestRoadOutput> {
    const startCityName = CityName.create(startCity);
    const endCityName = CityName.create(endCity);

    this.ensureThatStartAndEndCitiesAreDistinct(startCityName, endCityName);

    const [startCityEntity, endCityEntity] = await Promise.all([
      this.cityRepository.findByName(startCityName),
      this.cityRepository.findByName(endCityName),
    ]);

    const roadSegments = await this.roadSegmentRepository.findAll();

    const routeConstraints = RoadConstraintsMapper.toDomain(constraints);

    const pathFinderResult = await this.pathFinder.findFastestRoute(
      roadSegments,
      startCityEntity,
      endCityEntity,
      routeConstraints,
    );

    return PathfindingResultMapper.toOutput(pathFinderResult);
  }

  private ensureThatStartAndEndCitiesAreDistinct(
    cityNameA: CityName,
    cityNameB: CityName,
  ) {
    if (cityNameA.equals(cityNameB)) {
      throw SameStartAndEndCityError.forCityName(cityNameA);
    }
  }
}
