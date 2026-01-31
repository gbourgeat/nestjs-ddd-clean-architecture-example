# Amélioration des Logs en CI

## 🎯 Problèmes identifiés

Lors de l'exécution de la CI sur GitHub Actions, plusieurs sources de logs verbeux polluaient les sorties :

1. **Logs TypeORM** : Requêtes SQL affichées dans tous les environnements sauf production
2. **Warnings dotenv** : Messages d'avertissement lors du chargement des variables d'environnement
3. **Logs NestJS** : Messages d'initialisation et logs applicatifs
4. **Logs Jest** : Sorties verbales des tests

## ✅ Solutions implémentées

### 1. TypeORM - Désactivation des logs en test

**Fichiers modifiés :**
- `src/infrastructure/database/database.config.ts`
- `src/infrastructure/database/data-source.ts`

**Changement :**
```typescript
// Avant
logging: process.env.NODE_ENV !== 'production',

// Après
logging: process.env.NODE_ENV === 'development',
```

**Impact :** Les requêtes SQL ne sont plus loggées pendant les tests (test, CI), seulement en développement local.

### 2. Dotenv - Suppression des warnings

**Fichier modifié :**
- `test/e2e/setup.ts`

**Changement :**
```typescript
dotenv.config({
  path: join(__dirname, '../../.env.e2e'),
  override: true,
  silent: true, // ✅ Éviter les warnings dans les logs de la CI
});
```

**Impact :** Les warnings liés aux fichiers .env manquants ou déjà chargés sont supprimés.

### 3. NestJS - Désactivation des logs dans les tests

**Fichiers modifiés :**
- `test/e2e/get-fastest-route.e2e-spec.ts`
- `test/e2e/update-road-segment-speed.e2e-spec.ts`
- `test/e2e/create-road-segment.e2e-spec.ts`

**Changement :**
```typescript
// Avant
app = moduleFixture.createNestApplication();

// Après
app = moduleFixture.createNestApplication({
  logger: false, // ✅ Désactiver les logs NestJS dans les tests
});
```

**Impact :** Les messages d'initialisation de NestJS (routes mappées, modules chargés, etc.) ne sont plus affichés pendant les tests.

### 4. Console - Suppression des logs généraux

**Fichiers modifiés :**
- `test/e2e/setup.ts`
- `test/integration/setup.ts`

**Changement :**
```typescript
// Désactiver les logs de la console dans les tests pour réduire le bruit
if (process.env.CI === 'true' || process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // Conserver error pour les vrais problèmes
  };
}
```

**Impact :** Les `console.log`, `console.debug`, `console.info`, et `console.warn` sont désactivés en CI et en mode test. Seul `console.error` reste actif pour signaler les vraies erreurs.

### 5. Jest - Configuration silent et verbose

**Fichiers modifiés :**
- `test/e2e/jest-e2e.json`
- `test/integration/jest.integration.json`

**Changement :**
```json
{
  "silent": false,
  "verbose": false
}
```

**Impact :** Réduit la verbosité des sorties Jest tout en conservant les informations essentielles (résultats des tests, couverture).

### 6. GitHub Actions - Variable CI

**Fichier modifié :**
- `.github/workflows/ci.yml`

**Changement :**
```yaml
env:
  CI: true  # ✅ Ajouté
  NODE_ENV: test
  # ... autres variables
```

**Impact :** La variable `CI=true` active automatiquement les optimisations pour l'environnement CI (notamment la suppression des logs console).

## 📊 Résultat attendu

### Avant
```
[Nest] 12345  - 2024/01/31 10:30:45     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 2024/01/31 10:30:45     LOG [InstanceLoader] RestApiModule dependencies initialized
[Nest] 12345  - 2024/01/31 10:30:45     LOG [RoutesResolver] GetFastestRouteController {/get-fastest-route}:
query: SELECT * FROM "city" WHERE "name" = $1 -- PARAMETERS: ["Paris"]
query: SELECT * FROM "road_segment" WHERE "cityAId" = $1 -- PARAMETERS: [1]
query: SELECT * FROM "road_segment" WHERE "cityBId" = $1 -- PARAMETERS: [1]
dotenv: Cannot load .env.e2e (file may not exist)
✓ should return a valid route between two cities (145 ms)
✓ should return a direct route when available (89 ms)
```

### Après
```
✓ should return a valid route between two cities (145 ms)
✓ should return a direct route when available (89 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        2.534 s
```

## 🔧 Configuration locale vs CI

| Environnement | TypeORM Logs | NestJS Logs | Console Logs |
|---------------|--------------|-------------|--------------|
| **Development** (`NODE_ENV=development`) | ✅ Activé | ✅ Activé | ✅ Activé |
| **Test local** (`NODE_ENV=test`) | ❌ Désactivé | ❌ Désactivé | ❌ Désactivé |
| **CI** (`CI=true`) | ❌ Désactivé | ❌ Désactivé | ❌ Désactivé |
| **Production** | ❌ Désactivé | ⚠️ À configurer | ⚠️ À configurer |

## 🛠️ Comment tester localement

Pour simuler l'environnement CI en local :

```bash
# Activer le mode CI
export CI=true
export NODE_ENV=test

# Lancer les tests
npm run test:e2e
npm run test:integration:cov
```

Pour désactiver temporairement la suppression des logs en développement :

```bash
# Forcer le mode development
export NODE_ENV=development

# Les logs seront visibles même dans les tests
npm run test:e2e
```

## 📝 Notes importantes

1. **Les erreurs sont toujours visibles** : `console.error` reste actif pour signaler les problèmes réels
2. **Développement non affecté** : En `NODE_ENV=development`, tous les logs restent actifs
3. **Couverture de tests** : Les rapports de couverture restent inchangés
4. **Performance** : Réduction marginale du temps d'exécution grâce à moins d'I/O console

## 🔍 Debugging

Si vous avez besoin de voir les logs pendant le développement de tests :

```typescript
// Dans un fichier de test spécifique
beforeAll(() => {
  // Réactiver temporairement les logs
  global.console = {
    ...console,
    log: console.log.bind(console),
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
  };
});
```

Ou simplement commenter temporairement la section dans `setup.ts`.

## 📚 Références

- [NestJS Testing - Logs](https://docs.nestjs.com/fundamentals/testing#testing-utilities)
- [TypeORM Logging Options](https://typeorm.io/logging)
- [Jest Configuration - silent](https://jestjs.io/docs/configuration#silent-boolean)
- [dotenv Options](https://github.com/motdotla/dotenv#options)
