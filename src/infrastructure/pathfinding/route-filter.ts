import { Route } from '../../domain/entities';
import { RouteConstraints, WeatherCondition } from '../../domain/value-objects';

/**
 * Filters routes based on user constraints
 */
export class RouteFilter {
  /**
   * Filters routes according to constraints
   */
  filter(
    routes: Route[],
    weatherData: Map<string, WeatherCondition>,
    constraints?: RouteConstraints,
  ): Route[] {
    if (!constraints) {
      return routes;
    }

    return routes.filter((route) =>
      this.isRouteValid(route, weatherData, constraints),
    );
  }

  /**
   * Checks if a route is valid according to constraints
   */
  private isRouteValid(
    route: Route,
    weatherData: Map<string, WeatherCondition>,
    constraints: RouteConstraints,
  ): boolean {
    return (
      this.isDistanceValid(route, constraints) &&
      this.isSpeedValid(route, constraints) &&
      this.isWeatherValid(route, weatherData, constraints)
    );
  }

  /**
   * Checks if route distance respects max distance constraint
   */
  private isDistanceValid(
    route: Route,
    constraints: RouteConstraints,
  ): boolean {
    if (!constraints.maxDistance) {
      return true;
    }
    return route.distance <= constraints.maxDistance;
  }

  /**
   * Checks if route speed respects min speed constraint
   */
  private isSpeedValid(route: Route, constraints: RouteConstraints): boolean {
    if (!constraints.minSpeed) {
      return true;
    }
    return route.speed >= constraints.minSpeed;
  }

  /**
   * Checks if destination weather is acceptable
   */
  private isWeatherValid(
    route: Route,
    weatherData: Map<string, WeatherCondition>,
    constraints: RouteConstraints,
  ): boolean {
    if (
      !constraints.excludeWeather ||
      constraints.excludeWeather.length === 0
    ) {
      return true;
    }

    const destinationWeather = weatherData.get(route.to);
    if (!destinationWeather) {
      return true;
    }

    return !constraints.excludeWeather.includes(destinationWeather);
  }
}
