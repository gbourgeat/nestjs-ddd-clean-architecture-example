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

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

**Configuration requise :**

```env
# OpenWeatherMap API
OPENWEATHERMAP_API_KEY=votre_cle_api_ici

# Base de données PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=wavo_route_solver
```

🔑 **Obtenir une clé API OpenWeatherMap :**
1. Créez un compte sur [OpenWeatherMap](https://openweathermap.org/api)
2. Récupérez votre clé API gratuite
3. Ajoutez-la dans le fichier `.env`

📖 **Documentation complète :** 
- Météo : Voir [docs/OPENWEATHERMAP_CONFIG.md](docs/OPENWEATHERMAP_CONFIG.md)
- Base de données : Voir [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md)
- Migrations : Voir [docs/MIGRATIONS.md](docs/MIGRATIONS.md)

### Base de données PostgreSQL

#### Démarrer PostgreSQL avec Docker

```bash
# Démarrer PostgreSQL
docker-compose up -d

# Vérifier que le conteneur fonctionne
docker-compose ps
```

#### Initialisation de la base de données

**Option 1 : Script automatique (recommandé)**

```bash
npm run db:init
```

Ce script :
- ✅ Crée la base de données si nécessaire
- ✅ Active l'extension UUID
- ✅ Exécute toutes les migrations
- ✅ Prépare la base pour le premier démarrage

**Option 2 : Migrations manuelles**

```bash
# Exécuter les migrations
npm run migration:run

# Voir le statut des migrations
npm run migration:show

# Annuler la dernière migration
npm run migration:revert
```

**Option 3 : Automatique au démarrage**

Les migrations sont automatiquement exécutées au premier démarrage de l'application grâce à `migrationsRun: true`.

Au premier démarrage, la base de données sera automatiquement :
- 🗄️ Structurée avec les tables `cities` et `routes`
- 📊 Peuplée avec les villes et routes initiales (via DatabaseSeeder)

## Lancement

```bash
# Mode développement (watch)
npm run start:dev

# Mode production
npm run start:prod
```

L'API démarre sur `http://localhost:3000`

## Documentation API (Swagger)

Une documentation interactive de l'API est disponible via Swagger UI :

```
http://localhost:3000/api
```

Swagger vous permet de :
- 📖 Consulter la documentation complète de l'API
- 🧪 Tester les endpoints directement depuis le navigateur
- 📋 Voir des exemples de requêtes et réponses
- 📥 Exporter la spécification OpenAPI

Pour plus de détails, consultez [docs/SWAGGER.md](docs/SWAGGER.md).

## Endpoints API

### GET /cities

Récupère la liste de toutes les villes disponibles.

**Réponse :**

```json
{
  "cities": [
    { "name": "Paris" },
    { "name": "Lyon" },
    { "name": "Marseille" },
    { "name": "Lille" },
    ...
  ]
}
```

Pour plus de détails, consultez [docs/CITIES_ENDPOINT.md](docs/CITIES_ENDPOINT.md).

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
    { "cities": "Lille", "to": "Paris", "distance": 180, "speed": 130, "weather": "cloudy" },
    { "cities": "Paris", "to": "Dijon", "distance": 315, "speed": 110, "weather": "cloudy" },
    { "cities": "Dijon", "to": "Lyon", "distance": 195, "speed": 110, "weather": "sunny" },
    { "cities": "Lyon", "to": "Nice", "distance": 470, "speed": 110, "weather": "sunny" }
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

## Tester l'API

### Avec Swagger UI (recommandé)

La façon la plus simple de tester l'API est d'utiliser l'interface Swagger :

1. Démarrez l'application : `npm run start:dev`
2. Ouvrez votre navigateur : `http://localhost:3000/api`
3. Explorez et testez directement les endpoints :
   - **GET /cities** : Cliquez sur "Try it out" → "Execute"
   - **POST /get-fastest-route** : Cliquez sur "Try it out" → Modifiez le JSON → "Execute"

### Avec curl

```bash
# Lister toutes les villes
curl -X GET http://localhost:3000/cities

# Calculer un itinéraire
curl -X POST http://localhost:3000/get-fastest-route \
  -H "Content-Type: application/json" \
  -d '{
    "startCity": "Paris",
    "endCity": "Nice"
  }'
```


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
