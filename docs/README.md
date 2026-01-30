# 📚 Documentation Route Solver

Ce dossier contient toute la documentation technique du projet Route Solver.

## 📋 Index des documents

### 🐳 Docker & Infrastructure

| Document | Description |
|----------|-------------|
| **[DOCKER.md](./DOCKER.md)** | 📖 Documentation complète Docker Compose (ports, configuration, variables d'environnement) |
| **[DOCKER-QUICK-REFERENCE.md](./DOCKER-QUICK-REFERENCE.md)** | ⚡ Référence rapide des commandes Docker essentielles |
| **[DOCKER-SETUP-SUMMARY.md](./DOCKER-SETUP-SUMMARY.md)** | 📦 Récapitulatif de la configuration Docker (fichiers créés, avantages) |
| **[MIGRATION.md](./MIGRATION.md)** | 🔄 Guide de migration depuis l'ancien docker-compose.yml |
| **[PORTS-STRATEGY.md](./PORTS-STRATEGY.md)** | 🔒 Stratégie de choix des ports (54320-54322) et anti-conflit |

### ⚙️ Task Runner & Automation

| Document | Description |
|----------|-------------|
| **[TASKFILE.md](./TASKFILE.md)** | 🚀 Guide complet du Task Runner (alternative moderne à Makefile) |
| **[TASK-INSTALLATION.md](./TASK-INSTALLATION.md)** | 📥 Guide d'installation de Task |
| **[TASK-QUICKREF.md](./TASK-QUICKREF.md)** | ⚡ Référence rapide des commandes Task |
| **[TASK-SUMMARY.md](./TASK-SUMMARY.md)** | 📋 Récapitulatif des fichiers Task et avantages |
| **[TASK-README.txt](./TASK-README.txt)** | 📄 README Task (format texte) |

### 📁 Organisation & Maintenance

| Document | Description |
|----------|-------------|
| **[REORGANISATION.md](./REORGANISATION.md)** | 📦 Historique de la réorganisation des fichiers du projet |

### 🤖 AI & Development

| Document | Description |
|----------|-------------|
| **[CLAUDE.md](./CLAUDE.md)** | 🧠 Instructions et contexte pour l'IA Claude (développement assisté) |

## 🚀 Par où commencer ?

### Nouveau sur le projet ?
1. Lisez le **[README principal](../README.md)** pour comprendre l'architecture
2. Consultez **[DOCKER-QUICK-REFERENCE.md](./DOCKER-QUICK-REFERENCE.md)** pour démarrer rapidement
3. Installez **[Task Runner](./TASKFILE.md)** pour faciliter le développement

### Task Runner (Recommandé)
1. **[TASKFILE.md](./TASKFILE.md)** - Guide d'installation et d'utilisation
2. Commandes essentielles: `task setup`, `task dev`, `task test:cov`

### Configuration Docker
1. **[DOCKER-QUICK-REFERENCE.md](./DOCKER-QUICK-REFERENCE.md)** - Commandes essentielles
2. **[DOCKER.md](./DOCKER.md)** - Configuration détaillée
3. **[PORTS-STRATEGY.md](./PORTS-STRATEGY.md)** - Pourquoi ces ports ?

### Migration depuis ancien setup
1. **[MIGRATION.md](./MIGRATION.md)** - Guide complet de migration
2. Utilisez le script `../migrate-docker-compose.sh`

## 📖 Documentation principale

Pour la documentation du projet (architecture, patterns DDD, tests), consultez le **[README.md](../README.md)** à la racine du projet.

## 🔗 Liens utiles

- [README principal](../README.md) - Architecture et Getting Started
- [Copilot Instructions](../.github/copilot-instructions.md) - Instructions pour les agents IA
- [Package.json](../package.json) - Scripts disponibles

---

**Structure du projet:**
```
route-solver/
├── README.md                       # 📖 Documentation principale
├── docs/                           # 📚 Documentation technique (vous êtes ici)
│   ├── README.md               
│   ├── DOCKER.md
│   ├── DOCKER-QUICK-REFERENCE.md
│   ├── DOCKER-SETUP-SUMMARY.md
│   ├── MIGRATION.md
│   ├── PORTS-STRATEGY.md
│   ├── TASKFILE.md
│   ├── TASK-INSTALLATION.md
│   ├── TASK-QUICKREF.md
│   ├── TASK-SUMMARY.md
│   ├── TASK-README.txt
│   ├── REORGANISATION.md
│   └── CLAUDE.md
├── scripts/                        # 🛠️ Scripts d'administration
│   ├── install-task.sh
│   └── check-task-env.sh
├── src/                            # 💻 Code source
└── test/                           # 🧪 Tests
```
