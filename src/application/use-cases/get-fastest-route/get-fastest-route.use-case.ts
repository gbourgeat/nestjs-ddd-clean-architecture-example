import {
  PathfindingResultMapper,
  RoadConstraintsMapper,
} from '@/application/mappers';
import {
  GetFastestRoadOutput,
  GetFastestRouteInput,
} from '@/application/use-cases/get-fastest-route';
import { type Result, fail, ok } from '@/domain/common';
import {
  CityNotFoundError,
  InvalidCityNameError,
  PersistenceError,
  SameStartAndEndCityError,
} from '@/domain/errors';
import { RoadSegmentRepository } from '@/domain/repositories';
import { PathFinder } from '@/domain/services';
import { CityName } from '@/domain/value-objects';

export type GetFastestRouteError =
  | CityNotFoundError
  | InvalidCityNameError
  | SameStartAndEndCityError
  | PersistenceError;

export class GetFastestRouteUseCase {
  constructor(
    private readonly pathFinder: PathFinder,
    private readonly roadSegmentRepository: RoadSegmentRepository,
  ) {}

  async execute({
    startCity,
    endCity,
    constraints,
  }: GetFastestRouteInput): Promise<
    Result<GetFastestRoadOutput, GetFastestRouteError>
  > {
    const startCityNameResult = CityName.create(startCity);
    if (!startCityNameResult.success) {
      return fail(startCityNameResult.error);
    }

    const endCityNameResult = CityName.create(endCity);
    if (!endCityNameResult.success) {
      return fail(endCityNameResult.error);
    }

    const startCityName = startCityNameResult.value;
    const endCityName = endCityNameResult.value;

    if (startCityName.equals(endCityName)) {
      return fail(SameStartAndEndCityError.forCityName(startCityName));
    }

    const [startCityResult, endCityResult] = await Promise.all([
      this.roadSegmentRepository.findCityByName(startCityName),
      this.roadSegmentRepository.findCityByName(endCityName),
    ]);

    if (!startCityResult.success) {
      return fail(startCityResult.error);
    }
    if (!endCityResult.success) {
      return fail(endCityResult.error);
    }

    const startCityEntity = startCityResult.value;
    const endCityEntity = endCityResult.value;

    const roadSegmentsResult = await this.roadSegmentRepository.findAll();

    if (!roadSegmentsResult.success) {
      return fail(roadSegmentsResult.error);
    }

    const roadSegments = roadSegmentsResult.value;

    const routeConstraints = RoadConstraintsMapper.toDomain(constraints);

    const pathFinderResult = await this.pathFinder.findFastestRoute(
      roadSegments,
      startCityEntity,
      endCityEntity,
      routeConstraints,
    );

    return ok(PathfindingResultMapper.toOutput(pathFinderResult));
  }
}
