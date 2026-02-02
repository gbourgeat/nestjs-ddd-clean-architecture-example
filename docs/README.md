# Documentation Route Solver

This folder contains all technical documentation for the Route Solver project.

## Document Index

### Docker & Infrastructure

| Document | Description |
|----------|-------------|
| **[DOCKER.md](./DOCKER.md)** | Complete Docker Compose documentation (ports, configuration, environment variables) |
| **[DOCKER-QUICK-REFERENCE.md](./DOCKER-QUICK-REFERENCE.md)** | Quick reference for essential Docker commands |
| **[DOCKER-SETUP-SUMMARY.md](./DOCKER-SETUP-SUMMARY.md)** | Docker configuration summary (files created, benefits) |
| **[MIGRATION.md](./MIGRATION.md)** | Migration guide from old docker-compose.yml |
| **[PORTS-STRATEGY.md](./PORTS-STRATEGY.md)** | Port selection strategy (54320-54322) and conflict avoidance |

### Task Runner & Automation

| Document | Description |
|----------|-------------|
| **[TASKFILE.md](./TASKFILE.md)** | Complete Task Runner guide (modern alternative to Makefile) |
| **[TASK-INSTALLATION.md](./TASK-INSTALLATION.md)** | Task installation guide |
| **[TASK-QUICKREF.md](./TASK-QUICKREF.md)** | Quick reference for Task commands |
| **[TASK-SUMMARY.md](./TASK-SUMMARY.md)** | Summary of Task files and benefits |
| **[TASK-README.txt](./TASK-README.txt)** | Task README (text format) |

### Organization & Maintenance

| Document | Description |
|----------|-------------|
| **[REORGANISATION.md](./REORGANISATION.md)** | History of project file reorganization |

### Architecture & Quality

| Document | Description |
|----------|-------------|
| **[DEPENDENCY-CHECKING.md](./DEPENDENCY-CHECKING.md)** | Complete guide for architectural dependency control (EN) |
| **[DEPENDENCY-CHECKING-FR.md](./DEPENDENCY-CHECKING-FR.md)** | Quick start guide for dependency control (FR) |
| **[DEPENDENCY-CHECKING-BARRELS.md](./DEPENDENCY-CHECKING-BARRELS.md)** | Configuration compatible with barrel exports (FR) |
| **[DEPENDENCY-CHECKING-SETUP.md](./DEPENDENCY-CHECKING-SETUP.md)** | Technical summary of control implementation |
| **[DEPENDENCY-CHECKING-SUMMARY.md](./DEPENDENCY-CHECKING-SUMMARY.md)** | Complete setup summary |

### Git & Code Quality

| Document | Description |
|----------|-------------|
| **[PRE-COMMIT-HOOKS.md](./PRE-COMMIT-HOOKS.md)** | Automatic formatting and lint configuration before commit (husky + lint-staged) |
| **[GIT-WORKFLOW.md](./GIT-WORKFLOW.md)** | Branch, commit and Pull Request conventions |
| **[GIT-CHEAT-SHEET.md](./GIT-CHEAT-SHEET.md)** | Quick reference for Git commands |
| **[GIT-COMMANDS-EXAMPLES.md](./GIT-COMMANDS-EXAMPLES.md)** | Detailed examples of Git workflows |
| **[GIT-VISUAL-GUIDE.md](./GIT-VISUAL-GUIDE.md)** | Visual guide for Git workflows |

### AI & Development

| Document | Description |
|----------|-------------|
| **[CLAUDE.md](./CLAUDE.md)** | Instructions and context for Claude AI (assisted development) |

## Getting Started

### New to the project?
1. Read the **[main README](../README.md)** to understand the architecture
2. Check **[DOCKER-QUICK-REFERENCE.md](./DOCKER-QUICK-REFERENCE.md)** to get started quickly
3. Install **[Task Runner](./TASKFILE.md)** to facilitate development

### Task Runner (Recommended)
1. **[TASKFILE.md](./TASKFILE.md)** - Installation and usage guide
2. Essential commands: `task setup`, `task dev`, `task test:cov`

### Docker Configuration
1. **[DOCKER-QUICK-REFERENCE.md](./DOCKER-QUICK-REFERENCE.md)** - Essential commands
2. **[DOCKER.md](./DOCKER.md)** - Detailed configuration
3. **[PORTS-STRATEGY.md](./PORTS-STRATEGY.md)** - Why these ports?

### Migration from old setup
1. **[MIGRATION.md](./MIGRATION.md)** - Complete migration guide
2. Use the script `../migrate-docker-compose.sh`

## Main Documentation

For project documentation (architecture, DDD patterns, tests), see the **[README.md](../README.md)** at the root of the project.

## Useful Links

- [Main README](../README.md) - Architecture and Getting Started
- [Copilot Instructions](../.github/copilot-instructions.md) - Instructions for AI agents
- [Package.json](../package.json) - Available scripts

---

**Project structure:**
```
route-solver/
├── README.md                       # Main documentation
├── docs/                           # Technical documentation (you are here)
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
├── scripts/                        # Administration scripts
│   ├── install-task.sh
│   └── check-task-env.sh
├── src/                            # Source code
└── test/                           # Tests
```
