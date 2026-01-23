import { Route } from '../../domain/entities';

/**
 * Internal type for tracking previous cities in Dijkstra
 */
export interface PreviousCity {
  city: string;
  route: Route;
}

/**
 * Graph represented as adjacency list
 */
export type Graph = Map<string, Route[]>;

/**
 * Constants for Dijkstra algorithm
 */
export const INFINITE_DISTANCE = Infinity;
export const INITIAL_DISTANCE = 0;
