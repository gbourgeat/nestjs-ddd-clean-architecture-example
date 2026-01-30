# 🚀 Task Runner - Fichiers ajoutés

> Récapitulatif des fichiers liés au Task Runner

## 📦 Fichiers créés

### Fichiers principaux

| Fichier | Description | Type |
|---------|-------------|------|
| **`Taskfile.yml`** | Configuration principale du Task Runner | Configuration |
| **`scripts/install-task.sh`** | Script d'installation automatique de Task | Script (exécutable) |
| **`docs/TASK-QUICKREF.md`** | Référence rapide des commandes Task | Documentation |
| **`docs/TASKFILE.md`** | Documentation complète du Task Runner | Documentation |

### Fichiers modifiés

| Fichier | Modification |
|---------|--------------|
| **`README.md`** | Ajout de la section "Task Runner (Alternative to Make)" |
| **`docs/README.md`** | Ajout de la référence au TASKFILE.md dans l'index |

## 🎯 Objectif

Fournir une alternative moderne et plus lisible à Makefile pour automatiser les tâches courantes du projet.

## 📋 Avantages du Task Runner

### Par rapport à npm scripts

✅ **Orchestration simplifiée:** Une commande peut exécuter plusieurs tâches séquentiellement ou en parallèle  
✅ **Dépendances automatiques:** Les prérequis sont gérés automatiquement  
✅ **Plus lisible:** Syntaxe YAML claire vs scripts npm enchaînés  
✅ **Variables et templating:** Factorisation du code de configuration  
✅ **Documentation intégrée:** `task --list` affiche toutes les commandes avec descriptions

### Par rapport à Makefile

✅ **Cross-platform:** Fonctionne identiquement sur Linux, macOS, Windows  
✅ **Syntaxe moderne:** YAML vs syntaxe Make parfois obscure  
✅ **Pas de tab vs spaces:** Évite les erreurs de formatage classiques de Make  
✅ **Écosystème actif:** Développement actif et communauté grandissante

## 🔧 Installation

### Méthode 1: Script automatique (recommandé)

```bash
./scripts/install-task.sh
```

### Méthode 2: Installation manuelle

**macOS:**
```bash
brew install go-task
```

**Linux (snap):**
```bash
sudo snap install task --classic
```

**Linux (script officiel):**
```bash
sudo sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin
```

### Vérification

```bash
task --version
```

## 📖 Documentation

### Référence rapide

Pour les commandes les plus utilisées:
```bash
cat docs/TASK-QUICKREF.md
```

### Documentation complète

Pour tous les détails (installation, commandes, workflows):
```bash
cat docs/TASKFILE.md
```

### Aide intégrée

Pour afficher toutes les commandes disponibles:
```bash
task --list
```

## 🎮 Utilisation

### Configuration initiale du projet

```bash
task setup
```

Cette commande unique fait:
1. `npm install` - Installe les dépendances
2. Crée `.env` depuis `.env.example` (si absent)
3. Démarre la base de données Docker
4. Exécute les migrations

### Commandes quotidiennes

```bash
# Développement
task dev                 # Démarre le serveur (auto-start DB)
task test:watch          # Tests en mode watch
task check               # Vérifie tout (lint + format + test)

# Base de données
task migration:run       # Exécute les migrations
task db:reset           # Réinitialise la DB

# Tests
task test:cov           # Tests avec couverture
task test:e2e           # Tests E2E (gère la DB automatiquement)
```

## 🔗 Équivalences npm ↔ Task

| npm script | Task command | Amélioration |
|------------|--------------|--------------|
| `npm run start:dev` | `task dev` | Auto-start DB |
| `npm run test:features:cov` | `task test:cov` | Plus court |
| `npm run docker:dev:up && npm run migration:run` | `task setup` | Orchestration |
| Plusieurs commandes npm | `task check` | Tout en une commande |
| N/A | `task db:reset` | Réinitialisation complète DB |

## 🌟 Commandes les plus utiles

### Top 5 pour le développement quotidien

1. **`task setup`** - Premier démarrage (fait tout)
2. **`task dev`** - Développer (serveur + auto-start DB)
3. **`task test:watch`** - Tests en continu pendant le développement
4. **`task check`** - Avant de committer (lint + format + test)
5. **`task db:reset`** - Repartir d'une DB propre

### Top 5 pour la gestion de la base de données

1. **`task docker:dev:up`** - Démarrer la DB
2. **`task migration:run`** - Exécuter les migrations
3. **`task migration:generate`** - Créer une nouvelle migration (interactif)
4. **`task migration:show`** - Voir le statut des migrations
5. **`task db:reset`** - Reset complet (clean + up + migrate)

### Top 5 pour les tests

1. **`task test:cov`** - Tests features avec couverture
2. **`task test:watch`** - Tests en mode watch
3. **`task test:e2e`** - Tests E2E (gère la DB)
4. **`task test:all`** - Tous les tests avec couverture
5. **`task check`** - Lint + format + tests

## 📂 Structure du Taskfile.yml

Le `Taskfile.yml` est organisé en sections logiques:

```yaml
# Variables globales
vars:
  DOCKER_DEV_FILE: docker-compose.dev.yml
  # ...

# Tâches groupées par catégorie:
tasks:
  # 📦 Installation & Setup
  install, setup, env:create
  
  # 🚀 Développement
  dev, start, build, clean
  
  # 🧪 Tests
  test, test:watch, test:cov, test:e2e
  
  # 🐳 Docker (Dev, E2E, Integration)
  docker:dev:*, docker:e2e:*, docker:integration:*
  
  # 🗄️ Base de données - Migrations
  migration:*, db:reset
  
  # 🔍 Qualité du code
  lint, format, check
  
  # 📚 Documentation
  docs
  
  # 🛠️ Utilitaires
  info, help
```

## 💡 Tips

### Exécuter plusieurs tâches en parallèle

```bash
task docker:dev:up docker:e2e:up
```

### Voir les commandes exécutées (mode verbose)

```bash
task --verbose dev
```

### Exécuter une tâche sans les dépendances

```bash
task --force dev
```

### Lister uniquement les tâches d'une catégorie

```bash
task --list | grep docker
```

## 🤝 Contribution

Lors de l'ajout de nouvelles commandes:

1. ✅ Ajouter la tâche dans `Taskfile.yml` dans la section appropriée
2. ✅ Ajouter une description claire avec `desc:`
3. ✅ Mettre à jour `docs/TASKFILE.md` si c'est une tâche importante
4. ✅ Mettre à jour `docs/TASK-QUICKREF.md` si c'est une commande essentielle
5. ✅ Garder la cohérence avec les noms de tâches existants

### Conventions de nommage

- **Actions simples:** `verb` (ex: `dev`, `build`, `clean`)
- **Sous-commandes:** `category:action` (ex: `docker:dev:up`, `test:cov`)
- **Cohérence avec npm:** Garder les mêmes noms quand possible

## 🔗 Ressources

- **Site officiel:** https://taskfile.dev
- **Documentation:** https://taskfile.dev/usage/
- **GitHub:** https://github.com/go-task/task
- **Installation:** https://taskfile.dev/installation/

## 📄 Licence

Même licence que le projet principal (UNLICENSED - À but éducatif).

---

**Date de création:** 2026-01-30  
**Dernière mise à jour:** 2026-01-30
