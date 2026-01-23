/**
 * Entity representing a route between two cities
 */
export class Route {
  constructor(
    public readonly from: string,
    public readonly to: string,
    public readonly distance: number,
    public readonly speed: number,
  ) {}

  /**
   * Calculates the travel time for this route in hours
   */
  get travelTime(): number {
    return this.distance / this.speed;
  }
}
