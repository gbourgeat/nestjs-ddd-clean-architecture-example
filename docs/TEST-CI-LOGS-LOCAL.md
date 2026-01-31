# Guide de Test Local - Configuration des Logs CI

## 🎯 Objectif

Ce guide vous montre comment tester localement la configuration des logs pour simuler l'environnement CI avant de pousser vos changements.

## 🧪 Test 1 : Validation de la configuration

Vérifiez que tous les fichiers sont correctement configurés :

```bash
./scripts/test-ci-logs.sh
```

**Résultat attendu :** Tous les tests doivent être ✅ verts.

## 🧪 Test 2 : Tests E2E en mode CI

Simulez l'exécution des tests E2E comme dans la CI :

```bash
# Définir les variables d'environnement CI
export CI=true
export NODE_ENV=test

# Démarrer la base de données de test
npm run docker:e2e:up

# Lancer les tests E2E
npm run test:e2e

# Nettoyer
npm run docker:e2e:down
unset CI
```

**Observations attendues :**
- ❌ Pas de logs TypeORM (requêtes SQL)
- ❌ Pas de logs NestJS (initialisation, routes)
- ❌ Pas de console.log/debug/info/warn
- ✅ Résultats des tests clairement visibles
- ✅ Les erreurs (console.error) restent visibles

## 🧪 Test 3 : Tests d'intégration en mode CI

Testez les tests d'intégration avec les logs désactivés :

```bash
# Définir les variables d'environnement CI
export CI=true
export NODE_ENV=test

# Démarrer la base de données de test
npm run docker:integration:up

# Lancer les tests d'intégration
npm run test:integration:cov

# Nettoyer
npm run docker:integration:down
unset CI
```

**Observations attendues :**
- ❌ Pas de logs TypeORM
- ❌ Pas de console.log/debug/info/warn
- ✅ Rapport de couverture clair
- ✅ Résultats des tests bien formatés

## 🧪 Test 4 : Comparaison avant/après

### Mode Normal (avec logs)

```bash
# Sans CI=true
export NODE_ENV=development

npm run docker:e2e:up
npm run test:e2e | tee logs-avec.txt
npm run docker:e2e:down
```

### Mode CI (sans logs)

```bash
# Avec CI=true
export CI=true
export NODE_ENV=test

npm run docker:e2e:up
npm run test:e2e | tee logs-sans.txt
npm run docker:e2e:down
```

### Comparer

```bash
# Voir la différence de taille
wc -l logs-avec.txt logs-sans.txt

# Différence devrait être significative (50-80% de réduction)
```

## 🧪 Test 5 : Vérifier les logs en développement

Assurez-vous que les logs restent actifs en mode développement :

```bash
# Mode développement
export NODE_ENV=development

npm run docker:dev:up
npm run start:dev
```

**Observations attendues :**
- ✅ Logs TypeORM visibles (requêtes SQL)
- ✅ Logs NestJS visibles (routes, modules)
- ✅ Console.log fonctionnel

## 🔍 Debugging

Si vous avez besoin de voir tous les logs pendant le débogage d'un test :

### Option 1 : Modifier temporairement setup.ts

```typescript
// test/e2e/setup.ts ou test/integration/setup.ts
// Commenter cette section temporairement :
/*
if (process.env.CI === 'true' || process.env.NODE_ENV === 'test') {
  global.console = { ... };
}
*/
```

### Option 2 : Forcer le mode développement

```bash
# Forcer NODE_ENV=development pour un test spécifique
NODE_ENV=development npm run test:e2e -- get-fastest-route.e2e-spec.ts
```

### Option 3 : Réactiver les logs NestJS

```typescript
// Dans le fichier de test E2E
app = moduleFixture.createNestApplication({
  logger: true, // ou ['error', 'warn', 'log']
});
```

## 📊 Métriques attendues

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| Lignes de log (E2E) | ~5000 | ~200 | -96% |
| Temps d'affichage | ~5s | ~1s | -80% |
| Lisibilité | ⭐⭐ | ⭐⭐⭐⭐⭐ | +150% |

## ✅ Checklist avant commit

- [ ] `./scripts/test-ci-logs.sh` passe ✅
- [ ] Tests E2E en mode CI (peu de logs)
- [ ] Tests E2E en mode dev (logs visibles)
- [ ] Tests d'intégration en mode CI (peu de logs)
- [ ] Build réussi : `npm run build`
- [ ] Lint réussi : `npm run lint`
- [ ] Pas d'erreurs TypeScript

## 🚀 Commit et push

Une fois tous les tests validés :

```bash
git add .
git commit -m "ci: reduce log verbosity in CI environment

- Disable TypeORM logging in test mode
- Suppress NestJS logs in E2E tests
- Silence dotenv warnings
- Disable console.log/debug/info/warn in CI
- Add CI=true env var in GitHub Actions
- Add documentation and test scripts"

git push
```

## 📚 Références

- Documentation complète : [docs/CI-LOGS-OPTIMIZATION.md](CI-LOGS-OPTIMIZATION.md)
- Récapitulatif : [CHANGELOG-CI-LOGS.md](../CHANGELOG-CI-LOGS.md)
- Script de validation : [scripts/test-ci-logs.sh](../scripts/test-ci-logs.sh)
