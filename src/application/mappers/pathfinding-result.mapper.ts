import { PathfindingResult } from '@/domain/services';
import { RouteStepMapper } from '@/application/mappers';
import { GetFastestRoadOutput } from '@/application/use-cases/get-fastest-route';

export class PathfindingResultMapper {
  static toOutput(result: PathfindingResult | null): GetFastestRoadOutput {
    if (!result) {
      return {
        totalDistance: 0,
        estimatedDuration: 0,
        steps: [],
      };
    }

    return {
      totalDistance: result.totalDistance.kilometers,
      estimatedDuration: Math.round(result.estimatedTime.hours * 10) / 10,
      steps: RouteStepMapper.toOutputArray(result.steps),
    };
  }
}
