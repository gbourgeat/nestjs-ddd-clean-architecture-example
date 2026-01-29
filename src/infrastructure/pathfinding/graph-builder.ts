import { Graph, SimplifiedSegmentData } from './types';

export class GraphBuilder {
  build(segments: SimplifiedSegmentData[]): Graph {
    const graph: Graph = new Map();

    for (const segment of segments) {
      this.addSegmentToGraph(graph, segment);
    }

    return graph;
  }

  private addSegmentToGraph(
    graph: Graph,
    segment: SimplifiedSegmentData,
  ): void {
    const fromCityName = segment.fromCity;
    if (!graph.has(fromCityName)) {
      graph.set(fromCityName, []);
    }
    graph.get(fromCityName)!.push(segment);
  }
}
