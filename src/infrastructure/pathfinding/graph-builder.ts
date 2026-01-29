import { Graph } from './types';
import { RoadSegment } from '../../domain/entities/road-segment';

export class GraphBuilder {
  build(segments: RoadSegment[]): Graph {
    const graph: Graph = new Map();

    for (const segment of segments) {
      this.addSegmentToGraph(graph, segment);
    }

    return graph;
  }

  private addSegmentToGraph(graph: Graph, segment: RoadSegment): void {
    const fromCityName = segment.cities.name.value;
    if (!graph.has(fromCityName)) {
      graph.set(fromCityName, []);
    }
    graph.get(fromCityName)!.push(segment);
  }
}
