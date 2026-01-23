/**
 * Value Object representing the route search constraints defined by the user
 */
export class RouteConstraints {
  constructor(
    /**
     * Weather conditions to exclude in the route calculation
     * Ex: ['rain', 'snow', 'thunderstorm']
     */
    public readonly excludeWeather?: string[],

    /**
     * Maximum allowed distance per individual route (in km)
     */
    public readonly maxDistance?: number,

    /**
     * Minimum required speed on a route (in km/h)
     */
    public readonly minSpeed?: number,
  ) {}
}
