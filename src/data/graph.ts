import { City, Route } from '../domain/entities';

export const CITIES: City[] = [
  new City('Lille'),
  new City('Paris'),
  new City('Strasbourg'),
  new City('Lyon'),
  new City('Bordeaux'),
  new City('Toulouse'),
  new City('Marseille'),
  new City('Nice'),
  new City('Nantes'),
  new City('Dijon'),
];

export const ROUTES: Route[] = [
  // From Lille
  new Route('Lille', 'Paris', 225, 130),
  new Route('Lille', 'Strasbourg', 530, 120),

  // From Paris
  new Route('Paris', 'Lille', 225, 130),
  new Route('Paris', 'Strasbourg', 490, 120),
  new Route('Paris', 'Dijon', 315, 110),
  new Route('Paris', 'Lyon', 465, 120),
  new Route('Paris', 'Nantes', 385, 110),

  // From Strasbourg
  new Route('Strasbourg', 'Paris', 490, 120),
  new Route('Strasbourg', 'Lille', 530, 120),
  new Route('Strasbourg', 'Dijon', 330, 110),
  new Route('Strasbourg', 'Lyon', 490, 110),

  // From Dijon
  new Route('Dijon', 'Paris', 315, 110),
  new Route('Dijon', 'Strasbourg', 330, 110),
  new Route('Dijon', 'Lyon', 195, 110),

  // From Lyon
  new Route('Lyon', 'Paris', 465, 120),
  new Route('Lyon', 'Strasbourg', 490, 110),
  new Route('Lyon', 'Dijon', 195, 110),
  new Route('Lyon', 'Marseille', 315, 120),
  new Route('Lyon', 'Nice', 470, 110),
  new Route('Lyon', 'Toulouse', 540, 110),

  // From Marseille
  new Route('Marseille', 'Lyon', 315, 120),
  new Route('Marseille', 'Nice', 205, 110),
  new Route('Marseille', 'Toulouse', 405, 110),

  // From Nice
  new Route('Nice', 'Lyon', 470, 110),
  new Route('Nice', 'Marseille', 205, 110),

  // From Toulouse
  new Route('Toulouse', 'Lyon', 540, 110),
  new Route('Toulouse', 'Marseille', 405, 110),
  new Route('Toulouse', 'Bordeaux', 245, 110),

  // From Bordeaux
  new Route('Bordeaux', 'Toulouse', 245, 110),
  new Route('Bordeaux', 'Nantes', 330, 110),
  new Route('Bordeaux', 'Paris', 580, 120),

  // From Nantes
  new Route('Nantes', 'Paris', 385, 110),
  new Route('Nantes', 'Bordeaux', 330, 110),
];

/**
 * Helper function to get all unique city names from routes
 */
export function getCityNames(): string[] {
  return CITIES.map((city) => city.name);
}

/**
 * Helper function to validate that all routes reference existing cities
 */
export function validateGraph(): boolean {
  const cityNames = new Set(getCityNames());

  for (const route of ROUTES) {
    if (!cityNames.has(route.from) || !cityNames.has(route.to)) {
      throw new Error(
        `Invalid route: ${route.from} -> ${route.to}. City not found in graph.`,
      );
    }
  }

  return true;
}

// Validate graph on module load
validateGraph();
