# 🔄 Migration Docker Compose

Si vous utilisiez l'ancien fichier `docker-compose.yml`, le projet utilise maintenant **trois environnements séparés**.

## ⚡ Migration rapide

### Option 1 : Script automatique

```bash
chmod +x migrate-docker-compose.sh
./migrate-docker-compose.sh
```

### Option 2 : Migration manuelle

```bash
# 1. Arrêter l'ancien conteneur
docker-compose down

# 2. (Optionnel) Copier les données vers le nouveau volume
docker run --rm \
  -v postgres_data:/from \
  -v postgres_dev_data:/to \
  alpine ash -c "cd /from && cp -av . /to"

# 3. Démarrer le nouvel environnement
npm run docker:dev:up

# 4. Mettre à jour .env
# DATABASE_NAME=route_solver_dev

# 5. Exécuter les migrations
npm run migration:run
```

## 📋 Nouveaux fichiers

| Fichier | Usage |
|---------|-------|
| `docker-compose.dev.yml` | Développement (port 5432) |
| `docker-compose.e2e.yml` | Tests E2E (port 5433) |
| `docker-compose.integration.yml` | Tests d'intégration (port 5434) |
| `docker-compose.yml` | **DEPRECATED** (conservé pour compatibilité) |

## 🎯 Avantages de la nouvelle structure

✅ **Isolation** : Les environnements ne se perturbent plus  
✅ **Tests parallèles** : E2E et intégration peuvent tourner simultanément  
✅ **Nettoyage facile** : Les bases de test sont éphémères (tmpfs)  
✅ **Ports distincts** : Pas de conflits entre environnements  

## 📚 Documentation

- **[DOCKER.md](./DOCKER.md)** - Documentation complète
- **[DOCKER-QUICK-REFERENCE.md](./DOCKER-QUICK-REFERENCE.md)** - Référence rapide
- **[README.md](../README.md)** - Documentation du projet

## ❓ Questions fréquentes

### Mes données sont-elles perdues ?

Non ! Les données de l'ancien volume `postgres_data` sont conservées. Vous pouvez les copier vers `postgres_dev_data` avec le script de migration.

### Dois-je modifier mon .env ?

Oui, changez `DATABASE_NAME=route_solver` en `DATABASE_NAME=route_solver_dev`.

### Puis-je toujours utiliser docker-compose up ?

Oui, mais il est **fortement recommandé** d'utiliser les nouveaux fichiers :
- `npm run docker:dev:up` pour le développement
- `npm run docker:e2e:up` pour les tests E2E

### Comment supprimer l'ancien conteneur ?

```bash
docker-compose down
docker rm postgres
docker volume rm postgres_data  # ⚠️ Supprime les données
```

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes, consultez les logs :

```bash
npm run docker:dev:logs
```

Ou ouvrez une issue sur le projet.
