# Task Runner Quick Reference

> Référence rapide des commandes Task les plus utilisées

## 🎯 Commandes essentielles

```bash
# Afficher toutes les commandes disponibles
task --list

# Configuration initiale (première utilisation)
task setup

# Développement quotidien
task dev                    # Démarrer le serveur
task test:watch             # Tests en mode watch
task check                  # Vérifier qualité du code

# Tests
task test:cov               # Tests avec couverture
task test:e2e               # Tests E2E

# Base de données
task docker:dev:up          # Démarrer la DB
task migration:run          # Exécuter les migrations
task db:reset              # Réinitialiser la DB

# Qualité du code
task lint                   # Linter le code
task format                 # Formater le code
task check                  # Tout vérifier (lint + format + test)
```

## 📦 Installation rapide de Task

### macOS
```bash
brew install go-task
```

### Linux
```bash
# Via snap
sudo snap install task --classic

# Ou via le script du projet
./scripts/install-task.sh
```

### Vérification
```bash
task --version
```

## 🔄 Workflow typique

### Premier démarrage
```bash
task setup      # Install + env + db + migrations
task dev        # Démarrer le serveur
```

### Développement quotidien
```bash
task dev                # Terminal 1: Serveur
task test:watch         # Terminal 2: Tests
```

### Avant un commit
```bash
task check      # Lint + format + test:cov
```

### Gestion de la base de données
```bash
task migration:generate     # Créer une migration
task migration:run          # Exécuter les migrations
task db:reset              # Réinitialiser complètement
```

## 📖 Documentation complète

Voir [docs/TASKFILE.md](./docs/TASKFILE.md) pour la documentation complète.

## 🆚 npm vs Task

| npm | Task | Avantage Task |
|-----|------|---------------|
| `npm run start:dev` | `task dev` | Plus court + auto-start DB |
| `npm run test:features:cov` | `task test:cov` | Plus court |
| `npm run test:e2e` | `task test:e2e` | Gère le cycle de vie DB |
| Plusieurs commandes | `task check` | Orchestration simplifiée |
| Pas de setup | `task setup` | Configuration en une commande |

## ⚡ Tips

- `task` sans arguments = `task --list` (affiche l'aide)
- Les commandes Task peuvent s'enchaîner: `task lint format test`
- Autocomplétion disponible (voir docs/TASKFILE.md)
- Les tâches avec dépendances s'exécutent automatiquement (ex: `task dev` démarre la DB)

## 🔗 Liens

- **Documentation Task:** https://taskfile.dev
- **Taskfile du projet:** [Taskfile.yml](./Taskfile.yml)
- **Guide complet:** [docs/TASKFILE.md](./docs/TASKFILE.md)
