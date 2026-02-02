# Ubiquitous Language - Route Solver

> **Objectif** : Ce glossaire est la source de vérité pour le vocabulaire métier du projet. Tous les termes utilisés dans le code, la documentation et les échanges doivent être cohérents avec ce référentiel.

## Concepts Métier Principaux

### City (Ville)

| Aspect | Valeur |
|--------|--------|
| **Définition** | Localisation géographique dans le réseau routier français |
| **Identité** | Identifiée par un `CityId` unique (forme normalisée du nom) |
| **Exemples** | Paris, Lyon, Aix-en-Provence, Saint-Denis |
| **Code** | `City` (Entity), `CityId` (VO), `CityName` (VO) |

**Règles métier :**
- Le nom suit les conventions de nommage françaises (majuscule initiale, accents, tirets, apostrophes)
- Deux villes sont égales si elles ont le même `CityId`

---

### RoadSegment (Segment Routier)

| Aspect | Valeur |
|--------|--------|
| **Définition** | Connexion routière bidirectionnelle entre deux villes distinctes |
| **Identité** | Identifié par un `RoadSegmentId` composite (ex: `lyon__paris`) |
| **Propriétés** | Distance (km), Limite de vitesse (km/h) |
| **Code** | `RoadSegment` (Entity), `RoadSegmentId` (VO) |

**Règles métier :**
- Un segment ne peut pas relier une ville à elle-même
- Les villes sont toujours triées alphabétiquement pour garantir l'unicité
- La durée estimée = distance / vitesse

---

### Itinerary (Itinéraire)

| Aspect | Valeur |
|--------|--------|
| **Définition** | Chemin ordonné de segments routiers reliant une ville de départ à une ville d'arrivée |
| **Résultat de** | Calcul de pathfinding (algorithme Dijkstra) |
| **Composition** | Liste de `RouteStep` (étapes) |
| **REST** | `/itineraries` |
| **Code** | `PathfindingResult`, `RouteStep` |

> **Note** : On utilise "Itinerary" (et non "Route") pour éviter la confusion avec "Road" (la route en français).

**Règles métier :**
- La ville de départ et d'arrivée doivent être différentes
- Un itinéraire peut ne pas exister si aucun chemin n'est disponible

---

### RouteStep (Étape d'Itinéraire)

| Aspect | Valeur |
|--------|--------|
| **Définition** | Portion d'un itinéraire correspondant à un segment routier traversé |
| **Propriétés** | Ville de départ, Ville d'arrivée, Distance, Vitesse, Durée, Météo |
| **Code** | `RouteStep` (Interface) |

---

### PathFinder (Calculateur d'Itinéraire)

| Aspect | Valeur |
|--------|--------|
| **Définition** | Service abstrait responsable du calcul de l'itinéraire le plus rapide |
| **Algorithme** | Dijkstra (implémentation infrastructure) |
| **Code** | `PathFinder` (Abstract Service) |

---

## Value Objects

### Distance

| Aspect | Valeur |
|--------|--------|
| **Définition** | Mesure de longueur d'un segment routier |
| **Unité** | Kilomètres (km) |
| **Contraintes** | ≥ 0, finie |
| **Code** | `Distance` |

---

### Speed (Vitesse)

| Aspect | Valeur |
|--------|--------|
| **Définition** | Limite de vitesse autorisée sur un segment routier |
| **Unité** | Kilomètres par heure (km/h) |
| **Contraintes** | ≥ 0, finie |
| **Code** | `Speed` |

---

### Duration (Durée)

| Aspect | Valeur |
|--------|--------|
| **Définition** | Temps de trajet estimé |
| **Unité** | Heures (avec conversion minutes/secondes) |
| **Calcul** | distance / vitesse |
| **Contraintes** | ≥ 0, finie, vitesse ≠ 0 pour le calcul |
| **Code** | `Duration` |

---

### WeatherCondition (Condition Météorologique)

| Aspect | Valeur |
|--------|--------|
| **Définition** | État météorologique affectant les conditions de route |
| **Valeurs** | `sunny`, `cloudy`, `rain`, `snow`, `thunderstorm`, `fog` |
| **Traduction** | Ensoleillé, Nuageux, Pluie, Neige, Orage, Brouillard |
| **Code** | `WeatherCondition` |

---

### RoadConstraints (Contraintes de Route)

| Aspect | Valeur |
|--------|--------|
| **Définition** | Critères optionnels de filtrage pour la recherche d'itinéraire |
| **Propriétés** | Conditions météo à exclure, Distance max, Vitesse min |
| **Code** | `RoadConstraints` |

---

## Correspondance REST API

| Concept Métier | Ressource REST | Méthode | Endpoint |
|----------------|----------------|---------|----------|
| Calcul d'itinéraire | Itinerary | POST | `/itineraries` |
| Création segment | RoadSegment | POST | `/road-segments` |
| Mise à jour segment | RoadSegment | PATCH | `/road-segments/:id` |
| Lecture segment | RoadSegment | GET | `/road-segments/:id` |
| Liste segments | RoadSegment | GET | `/road-segments` |

> **Conventions REST** :
> - Utiliser des noms de ressources (substantifs), jamais de verbes
> - ❌ `/get-fastest-route` → ✅ `/itineraries`
> - Les ressources sont au pluriel (`/itineraries`, `/road-segments`)

---

## Erreurs Métier

| Code | Nom | Description |
|------|-----|-------------|
| `CITY_NOT_FOUND` | Ville non trouvée | La ville demandée n'existe pas dans le référentiel |
| `ROAD_SEGMENT_NOT_FOUND` | Segment non trouvé | Le segment routier n'existe pas |
| `SAME_START_END_CITY` | Même ville départ/arrivée | Impossible de calculer un itinéraire vers la même ville |
| `NO_ROUTE_FOUND` | Aucun itinéraire | Aucun chemin disponible entre les deux villes |
| `INVALID_CITY_NAME` | Nom de ville invalide | Le format du nom ne respecte pas les conventions |
| `INVALID_DISTANCE` | Distance invalide | Valeur négative ou non finie |
| `INVALID_SPEED` | Vitesse invalide | Valeur négative, nulle ou non finie |

---

## Conventions de Nommage

### Code

| Type | Pattern | Exemple |
|------|---------|---------|
| Entity | `PascalCase` | `City`, `RoadSegment` |
| Value Object | `PascalCase` | `CityId`, `Distance` |
| Error | `PascalCase` + `Error` | `CityNotFoundError` |
| Repository | `Abstract` + `PascalCase` + `Repository` | `RoadSegmentRepository` |
| Use Case | `PascalCase` + `UseCase` | `GetFastestRouteUseCase` |

### Fichiers

| Type | Pattern | Exemple |
|------|---------|---------|
| Entity | `kebab-case.ts` | `road-segment.ts` |
| Value Object | `kebab-case.ts` | `city-id.ts` |
| Error | `kebab-case.error.ts` | `city-not-found.error.ts` |
| Repository (Interface) | `kebab-case.repository.ts` | `road-segment.repository.ts` |
| Repository (Impl) | `kebab-case.typeorm-repository.ts` | `road-segment.typeorm-repository.ts` |

### REST API

| Élément | Convention | Exemple |
|---------|------------|---------|
| Ressource | `kebab-case` pluriel | `/road-segments` |
| Identifiant | `:id` ou `:compositeKey` | `/road-segments/:id` |
| Actions | Éviter les verbes | ❌ `/get-fastest-route` → ✅ `/routes` |

---

## Glossaire Français ↔ Anglais

| Français | Anglais | REST | Contexte |
|----------|---------|------|----------|
| Ville | City | `/cities` | Entité géographique |
| Segment routier | Road Segment | `/road-segments` | Connexion entre villes |
| Itinéraire | Itinerary | `/itineraries` | Résultat du calcul de chemin |
| Étape | Itinerary Step | - | Portion d'itinéraire |
| Distance | Distance | - | Longueur en km |
| Vitesse | Speed | - | Limite en km/h |
| Durée | Duration | - | Temps de trajet |
| Contraintes | Constraints | - | Filtres de recherche |
| Condition météo | Weather Condition | - | État climatique |
| Recherche de chemin | Pathfinding | - | Algorithme Dijkstra |

> **Attention** : "Route" en français = "Road" en anglais (la route physique). Pour éviter toute confusion, on utilise "Itinerary" pour désigner le chemin calculé.

---

## Mises à Jour

| Date | Modification | Auteur |
|------|--------------|--------|
| 2026-02-02 | Création initiale du glossaire | Claude Code |
