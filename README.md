# Wavo Route Solver

API de planification d'itinéraires optimaux entre villes françaises, avec prise en compte des contraintes météo, distance et vitesse.

## Objectif

Déterminer le **chemin le plus rapide** entre deux villes tout en respectant des contraintes utilisateur :
- Éviter les villes avec une météo indésirable (pluie, neige, orage)
- Éviter les routes trop longues
- Éviter les routes avec une vitesse maximale trop faible

## Installation

```bash
# Installer les dépendances
npm install
```

## Lancement

```bash
# Mode développement (watch)
npm run start:dev

# Mode production
npm run start:prod
```

L'API démarre sur `http://localhost:3000`

## Endpoint API

### POST /get-fastest-route

Trouve le chemin le plus rapide entre deux villes.

**Requête :**

```json
{
  "startCity": "Lille",
  "endCity": "Nice",
  "constraints": {
    "excludeWeather": ["rain", "snow", "thunderstorm"],
    "maxDistance": 500,
    "minSpeed": 100
  }
}
```

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `startCity` | string | ✅ | Ville de départ |
| `endCity` | string | ✅ | Ville d'arrivée |
| `constraints.excludeWeather` | string[] | ❌ | Météos à éviter : `rain`, `snow`, `thunderstorm`, `fog` |
| `constraints.maxDistance` | number | ❌ | Distance max par route (km) |
| `constraints.minSpeed` | number | ❌ | Vitesse min par route (km/h) |

**Réponse :**

```json
{
  "path": ["Lille", "Paris", "Dijon", "Lyon", "Nice"],
  "totalDistance": 1465,
  "estimatedTime": 12.8,
  "steps": [
    { "from": "Lille", "to": "Paris", "distance": 180, "speed": 130, "weather": "cloudy" },
    { "from": "Paris", "to": "Dijon", "distance": 315, "speed": 110, "weather": "cloudy" },
    { "from": "Dijon", "to": "Lyon", "distance": 195, "speed": 110, "weather": "sunny" },
    { "from": "Lyon", "to": "Nice", "distance": 470, "speed": 110, "weather": "sunny" }
  ]
}
```

**Si aucun chemin possible :**

```json
{
  "path": []
}
```

## Villes disponibles

Lille, Paris, Rennes, Nantes, Lyon, Dijon, Saint-Étienne, Nice, Marseille, Bordeaux

## Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Couverture de code
npm run test:cov
```

## Stack technique

- **Framework** : NestJS
- **Langage** : TypeScript
- **API Météo** : OpenWeatherMap
- **Cache** : cache-manager (TTL 10 min)
- **Validation** : class-validator

## Licence

private
