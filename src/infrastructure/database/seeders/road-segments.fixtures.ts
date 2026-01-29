export interface RawCityData {
  name: string;
}

export interface RawRoadSegmentData {
  fromCityName: string;
  toCityName: string;
  distance: number;
  speed: number;
}

export const CITIES: RawCityData[] = [
  { name: 'Lille' },
  { name: 'Paris' },
  { name: 'Strasbourg' },
  { name: 'Lyon' },
  { name: 'Bordeaux' },
  { name: 'Toulouse' },
  { name: 'Marseille' },
  { name: 'Nice' },
  { name: 'Nantes' },
  { name: 'Dijon' },
];

function createSegment(
  fromCityName: string,
  toCityName: string,
  distance: number,
  speed: number,
): RawRoadSegmentData {
  return {
    fromCityName,
    toCityName,
    distance,
    speed,
  };
}

export const ROAD_SEGMENTS: RawRoadSegmentData[] = [
  // From Lille
  createSegment('Lille', 'Paris', 225, 130),
  createSegment('Lille', 'Strasbourg', 530, 120),

  // From Paris
  createSegment('Paris', 'Lille', 225, 130),
  createSegment('Paris', 'Strasbourg', 490, 120),
  createSegment('Paris', 'Dijon', 315, 110),
  createSegment('Paris', 'Lyon', 465, 120),
  createSegment('Paris', 'Nantes', 385, 110),

  // From Strasbourg
  createSegment('Strasbourg', 'Paris', 490, 120),
  createSegment('Strasbourg', 'Lille', 530, 120),
  createSegment('Strasbourg', 'Dijon', 330, 110),
  createSegment('Strasbourg', 'Lyon', 490, 110),

  // From Dijon
  createSegment('Dijon', 'Paris', 315, 110),
  createSegment('Dijon', 'Strasbourg', 330, 110),
  createSegment('Dijon', 'Lyon', 195, 110),

  // From Lyon
  createSegment('Lyon', 'Paris', 465, 120),
  createSegment('Lyon', 'Strasbourg', 490, 110),
  createSegment('Lyon', 'Dijon', 195, 110),
  createSegment('Lyon', 'Marseille', 315, 120),
  createSegment('Lyon', 'Nice', 470, 110),
  createSegment('Lyon', 'Toulouse', 540, 110),

  // From Marseille
  createSegment('Marseille', 'Lyon', 315, 120),
  createSegment('Marseille', 'Nice', 205, 110),
  createSegment('Marseille', 'Toulouse', 405, 110),

  // From Nice
  createSegment('Nice', 'Lyon', 470, 110),
  createSegment('Nice', 'Marseille', 205, 110),

  // From Toulouse
  createSegment('Toulouse', 'Lyon', 540, 110),
  createSegment('Toulouse', 'Marseille', 405, 110),
  createSegment('Toulouse', 'Bordeaux', 245, 110),

  // From Bordeaux
  createSegment('Bordeaux', 'Toulouse', 245, 110),
  createSegment('Bordeaux', 'Nantes', 330, 110),
  createSegment('Bordeaux', 'Paris', 580, 120),

  // From Nantes
  createSegment('Nantes', 'Paris', 385, 110),
  createSegment('Nantes', 'Bordeaux', 330, 110),
];

export function getCityNames(): string[] {
  return CITIES.map((city) => city.name);
}

export function validateGraph(): boolean {
  const cityNames = new Set(getCityNames());

  for (const segment of ROAD_SEGMENTS) {
    if (
      !cityNames.has(segment.fromCityName) ||
      !cityNames.has(segment.toCityName)
    ) {
      throw new Error(
        `Invalid road segment: ${segment.fromCityName} -> ${segment.toCityName}. City not found in graph.`,
      );
    }
  }

  return true;
}

validateGraph();
