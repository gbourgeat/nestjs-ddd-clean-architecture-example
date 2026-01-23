# Couche Présentation - Guide d'utilisation

## 🎯 Vue d'ensemble

La couche présentation expose l'API REST pour calculer l'itinéraire le plus rapide entre deux villes en prenant en compte la météo et les contraintes utilisateur.

## 🚀 Démarrage rapide

### 1. Démarrer le serveur

```bash
npm run start:dev
```

Le serveur démarre sur `http://localhost:3000`

### 2. Tester l'API

#### Avec le script fourni (recommandé)
```bash
./test-presentation-api.sh
```

#### Avec curl
```bash
curl -X POST http://localhost:3000/get-fastest-route \
  -H "Content-Type: application/json" \
  -d '{
    "startCity": "Paris",
    "endCity": "Nice"
  }'
```

#### Avec HTTPie
```bash
http POST localhost:3000/get-fastest-route \
  startCity=Paris \
  endCity=Nice
```

## 📡 API Reference

### Endpoint principal

```
POST /get-fastest-route
```

Calcule le chemin le plus rapide entre deux villes françaises.

### Request Body

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `startCity` | string | ✅ | Ville de départ |
| `endCity` | string | ✅ | Ville d'arrivée |
| `constraints` | object | ❌ | Contraintes de recherche |
| `constraints.excludeWeather` | string[] | ❌ | Conditions météo à éviter |
| `constraints.maxDistance` | number | ❌ | Distance max par route (km) |
| `constraints.minSpeed` | number | ❌ | Vitesse min par route (km/h) |

### Villes disponibles

Paris, Lyon, Marseille, Nice, Toulouse, Bordeaux, Nantes, Strasbourg, Lille, Dijon

### Conditions météo

`sunny`, `cloudy`, `rain`, `snow`, `thunderstorm`, `fog`

### Response Body (Succès - 201)

```json
{
  "path": ["Paris", "Lyon", "Nice"],
  "totalDistance": 935,
  "estimatedTime": 8.5,
  "steps": [
    {
      "from": "Paris",
      "to": "Lyon",
      "distance": 465,
      "speed": 120,
      "travelTime": 3.875,
      "weather": "cloudy"
    },
    {
      "from": "Lyon",
      "to": "Nice",
      "distance": 470,
      "speed": 110,
      "travelTime": 4.27,
      "weather": "sunny"
    }
  ]
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `path` | string[] | Liste ordonnée des villes (vide si aucun chemin) |
| `totalDistance` | number | Distance totale en kilomètres |
| `estimatedTime` | number | Temps de trajet total en heures |
| `steps` | array | Détails de chaque étape du trajet |
| `steps[].from` | string | Ville de départ de l'étape |
| `steps[].to` | string | Ville d'arrivée de l'étape |
| `steps[].distance` | number | Distance de l'étape (km) |
| `steps[].speed` | number | Vitesse sur cette route (km/h) |
| `steps[].travelTime` | number | Temps de l'étape (heures) |
| `steps[].weather` | string | Météo à la ville d'arrivée |

### Codes de réponse

| Code | Description |
|------|-------------|
| 201 | Succès - Route calculée |
| 400 | Erreur de validation (champs manquants ou invalides) |
| 404 | Ville introuvable dans le graphe |
| 500 | Erreur serveur interne |

### Exemples de réponses d'erreur

#### 400 - Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "startCity should not be empty",
    "startCity must be a string"
  ],
  "error": "Bad Request"
}
```

#### 404 - City Not Found
```json
{
  "statusCode": 404,
  "message": "End city \"Londres\" not found in graph",
  "error": "City Not Found"
}
```

## 💡 Exemples d'utilisation

### Exemple 1 : Route simple

```bash
curl -X POST http://localhost:3000/get-fastest-route \
  -H "Content-Type: application/json" \
  -d '{
    "startCity": "Paris",
    "endCity": "Lyon"
  }'
```

### Exemple 2 : Éviter la pluie et la neige

```bash
curl -X POST http://localhost:3000/get-fastest-route \
  -H "Content-Type: application/json" \
  -d '{
    "startCity": "Lille",
    "endCity": "Nice",
    "constraints": {
      "excludeWeather": ["rain", "snow"]
    }
  }'
```

### Exemple 3 : Routes courtes uniquement

```bash
curl -X POST http://localhost:3000/get-fastest-route \
  -H "Content-Type: application/json" \
  -d '{
    "startCity": "Paris",
    "endCity": "Marseille",
    "constraints": {
      "maxDistance": 400
    }
  }'
```

### Exemple 4 : Routes rapides uniquement

```bash
curl -X POST http://localhost:3000/get-fastest-route \
  -H "Content-Type: application/json" \
  -d '{
    "startCity": "Bordeaux",
    "endCity": "Strasbourg",
    "constraints": {
      "minSpeed": 120
    }
  }'
```

### Exemple 5 : Contraintes multiples

```bash
curl -X POST http://localhost:3000/get-fastest-route \
  -H "Content-Type: application/json" \
  -d '{
    "startCity": "Nantes",
    "endCity": "Nice",
    "constraints": {
      "excludeWeather": ["rain", "thunderstorm", "fog"],
      "maxDistance": 500,
      "minSpeed": 110
    }
  }'
```

## 🧪 Tests

### Tests unitaires

```bash
# Tous les tests
npm test

# Tests de la couche présentation uniquement
npm test -- --testPathPatterns=presentation
```

### Tests end-to-end

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:cov
```

## 📊 Validation des données

Les données sont automatiquement validées avec `class-validator` :

### Règles de validation

- `startCity` : **requis**, non vide, string
- `endCity` : **requis**, non vide, string
- `constraints.excludeWeather` : optionnel, tableau de strings
- `constraints.maxDistance` : optionnel, nombre ≥ 0
- `constraints.minSpeed` : optionnel, nombre ≥ 0

### Exemples d'erreurs de validation

```json
// Champ manquant
{
  "statusCode": 400,
  "message": ["startCity should not be empty"],
  "error": "Bad Request"
}

// Type incorrect
{
  "statusCode": 400,
  "message": ["maxDistance must be a number"],
  "error": "Bad Request"
}

// Valeur négative
{
  "statusCode": 400,
  "message": ["minSpeed must not be less than 0"],
  "error": "Bad Request"
}
```

## 🔧 Configuration

### Variables d'environnement requises

Créez un fichier `.env` à la racine :

```env
OPENWEATHERMAP_API_KEY=votre_cle_api
OPENWEATHERMAP_BASE_URL=https://api.openweathermap.org/data/2.5
```

### Obtenir une clé API

1. Créez un compte sur https://openweathermap.org
2. Générez une clé API gratuite (60 appels/min)
3. Ajoutez-la dans le fichier `.env`

## 📦 Architecture

```
src/presentation/
├── controllers/          # Contrôleurs REST
│   ├── route.controller.ts
│   └── route.controller.spec.ts
├── dtos/                 # Data Transfer Objects
│   ├── constraints.dto.ts
│   ├── get-fastest-route.dto.ts
│   ├── route-response.dto.ts
│   └── route-step.dto.ts
├── presentation.module.ts
└── index.ts
```

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier les dépendances
npm install

# Vérifier la compilation
npm run build
```

### Erreur 500 - Internal Server Error
- Vérifiez que la clé API OpenWeatherMap est valide
- Vérifiez que vous n'avez pas dépassé la limite de 60 appels/min
- Consultez les logs du serveur

### Tests e2e échouent
- Assurez-vous que le fichier `.env` contient une clé API valide
- Les tests appellent l'API réelle (limite de 60 appels/min)

## 📚 Documentation complète

- [Architecture globale](../ARCHITECTURE.md)
- [Documentation de la couche présentation](../docs/PRESENTATION_LAYER.md)
- [Configuration OpenWeatherMap](../docs/OPENWEATHERMAP_CONFIG.md)

## ✅ Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Tests unitaires passent (`npm test`)
- [ ] Tests e2e passent (`npm run test:e2e`)
- [ ] Application compile sans erreurs (`npm run build`)
- [ ] API testée manuellement avec curl/Postman
- [ ] Documentation à jour

## 🎓 Points clés

- ✅ Validation automatique des entrées
- ✅ Gestion d'erreurs complète avec codes HTTP appropriés
- ✅ Respect des principes Clean Architecture
- ✅ Tests unitaires et e2e complets
- ✅ Documentation complète
- ✅ Prêt pour la production
