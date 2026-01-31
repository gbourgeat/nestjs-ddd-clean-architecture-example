# Feature: Create Road Segment

## 📋 Vue d'ensemble

Cette fonctionnalité permet de créer un nouveau segment de route entre deux villes existantes via l'API REST.

## 🎯 Endpoint

**POST** `/road-segments`

## 📥 Requête

```json
{
  "cityA": "Paris",
  "cityB": "Lyon",
  "distance": 465,
  "speedLimit": 130
}
```

### Paramètres

| Champ | Type | Validation | Description |
|-------|------|------------|-------------|
| `cityA` | string | Non vide | Nom de la première ville |
| `cityB` | string | Non vide | Nom de la deuxième ville |
| `distance` | number | >= 0 | Distance en kilomètres |
| `speedLimit` | number | >= 0 | Limite de vitesse en km/h |

## 📤 Réponse

### Succès (201 Created)

```json
{
  "roadSegmentId": "lyon__paris",
  "cityA": "Lyon",
  "cityB": "Paris",
  "distance": 465,
  "speedLimit": 130
}
```

**Note:** Les villes sont automatiquement triées par ordre alphabétique dans la réponse.

### Erreurs

#### 404 - City Not Found
```json
{
  "statusCode": 404,
  "message": "City with name \"UnknownCity\" not found",
  "error": "City Not Found"
}
```

#### 400 - Invalid Road Segment
```json
{
  "statusCode": 400,
  "message": "Cannot create a road segment connecting a city to itself",
  "error": "Invalid Road Segment"
}
```

#### 400 - Invalid Distance
```json
{
  "statusCode": 400,
  "message": "Distance must be positive",
  "error": "Invalid Distance"
}
```

#### 400 - Invalid Speed
```json
{
  "statusCode": 400,
  "message": "Speed must be positive",
  "error": "Invalid Speed"
}
```

## 🏗️ Architecture

Cette fonctionnalité suit l'architecture hexagonale du projet :

### Couche Application
- **Use Case**: `CreateRoadSegmentUseCase`
  - Orchestre la création d'un segment de route
  - Vérifie l'existence des villes
  - Valide les données via les Value Objects du domaine
  - Sauvegarde le segment via le repository

### Couche Presentation
- **Controller**: `CreateRoadSegmentController`
  - Gère la route HTTP POST `/road-segments`
  - Transforme les DTOs en inputs du use case
  - Gère les erreurs métier et les convertit en réponses HTTP
- **Request DTO**: `CreateRoadSegmentRequest`
  - Validation avec `class-validator`
- **Response DTO**: `CreateRoadSegmentResponse`
  - Documentation Swagger avec `@ApiProperty`

### Couche Domain
Réutilise les entités et value objects existants :
- `RoadSegment` (entité)
- `City` (entité)
- `Distance` (value object)
- `Speed` (value object)
- `RoadSegmentId` (value object)
- `CityName` (value object)

## ✅ Tests

### Tests Unitaires (12 tests)
Fichier: `test/features/application/use-cases/create-road-segment/create-road-segment.use-case.spec.ts`

- ✓ Création réussie d'un segment
- ✓ Tri alphabétique des villes
- ✓ Valeurs minimales acceptées
- ✓ Gestion des erreurs (ville inexistante, nom vide, distance/vitesse négative, même ville)

### Tests E2E (15 tests)
Fichier: `test/e2e/create-road-segment.e2e-spec.ts`

- ✓ Requêtes valides
- ✓ Validation des erreurs HTTP
- ✓ Gestion des champs manquants
- ✓ Validation des contraintes métier

## 🔄 Règles Métier

1. **Les deux villes doivent exister** dans la base de données
2. **Les villes doivent être différentes** (pas de boucle)
3. **La distance doit être >= 0** (0 km accepté)
4. **La vitesse doit être >= 0** (0 km/h accepté pour représenter un arrêt)
5. **Les villes sont triées alphabétiquement** dans l'ID du segment et la réponse
6. **Les segments sont bidirectionnels** (Paris-Lyon = Lyon-Paris)

## 🔧 Utilisation

### Avec cURL

```bash
curl -X POST http://localhost:3000/road-segments \
  -H "Content-Type: application/json" \
  -d '{
    "cityA": "Paris",
    "cityB": "Lyon",
    "distance": 465,
    "speedLimit": 130
  }'
```

### Avec Swagger UI

1. Accéder à http://localhost:3000/api
2. Chercher la section "Road Segments"
3. Cliquer sur POST `/road-segments`
4. Cliquer sur "Try it out"
5. Remplir le body et exécuter

## 📚 Dépendances

Cette fonctionnalité dépend de :
- `CityRepository` (pour vérifier l'existence des villes)
- `RoadSegmentRepository` (pour sauvegarder le segment)
- Value Objects du domaine pour la validation
