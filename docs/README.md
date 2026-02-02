# Documentation

Technical documentation for the Route Solver project.

## Document Index

### Architecture

| Document | Description |
|----------|-------------|
| [clean-architecture.md](./architecture/clean-architecture.md) | Layer rules, dependency validation, CI integration |
| [domain-patterns.md](./architecture/domain-patterns.md) | Result pattern, aggregates, entity patterns |

### Infrastructure

| Document | Description |
|----------|-------------|
| [docker.md](./infrastructure/docker.md) | Docker Compose environments, ports, configuration |
| [ci-cd.md](./infrastructure/ci-cd.md) | GitHub Actions workflows, coverage, local testing |

### Workflows

| Document | Description |
|----------|-------------|
| [git.md](./workflows/git.md) | Branch strategy, conventional commits, PR workflow |
| [pre-commit-hooks.md](./workflows/pre-commit-hooks.md) | Husky, lint-staged, automatic formatting |

### Tools

| Document | Description |
|----------|-------------|
| [task-runner.md](./tools/task-runner.md) | Task installation, commands, workflows |

### Features

| Document | Description |
|----------|-------------|
| [create-road-segment.md](./features/create-road-segment.md) | POST /road-segments endpoint documentation |

## Getting Started

### New to the Project

1. Read the [main README](../README.md) to understand the architecture
2. Check [docker.md](./infrastructure/docker.md) to set up your environment
3. Install the [Task Runner](./tools/task-runner.md) to simplify development

### Quick Setup

```bash
# Install Task (optional but recommended)
brew install go-task  # macOS
# or: sudo snap install task --classic  # Linux

# Complete project setup
task setup
# This runs: npm install, creates .env, starts DB, runs migrations

# Start development
task dev
```

### Essential Commands

| Command | Description |
|---------|-------------|
| `task setup` | First-time project setup |
| `task dev` | Start development server |
| `task test:cov` | Run tests with coverage |
| `task test:e2e` | Run E2E tests |
| `task check` | Lint + format + tests |

## Folder Structure

```
docs/
├── README.md                      # This file
├── architecture/
│   ├── clean-architecture.md      # Layer rules, dependency validation
│   └── domain-patterns.md         # Result pattern, aggregates
├── infrastructure/
│   ├── docker.md                  # Docker environments, ports
│   └── ci-cd.md                   # GitHub Actions, CI configuration
├── workflows/
│   ├── git.md                     # Branch strategy, commits, PRs
│   └── pre-commit-hooks.md        # Husky, lint-staged setup
├── tools/
│   └── task-runner.md             # Task installation, commands
└── features/
    └── create-road-segment.md     # POST /road-segments endpoint
```

## Related Resources

- [Main README](../README.md) - Project architecture and getting started
- [CLAUDE.md](../CLAUDE.md) - Instructions for AI agents
- [Package.json](../package.json) - Available npm scripts
