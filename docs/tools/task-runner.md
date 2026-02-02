# Task Runner Guide

Modern task automation for Route Solver using [Task](https://taskfile.dev) as an alternative to Makefile.

## Why Task?

- **Cross-platform**: Works on Linux, macOS, and Windows
- **Readable**: YAML syntax is clearer than Makefile
- **Modern**: Built with Go, fast and reliable
- **Dependencies**: Easy task dependencies and parallel execution
- **Variables**: Powerful variable system

## Installation

### macOS

```bash
brew install go-task
```

### Linux

```bash
# Using snap
snap install task --classic

# Using apt (Ubuntu/Debian)
sudo sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin

# Using yum/dnf (Fedora/RHEL)
sudo sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin
```

### Windows

```powershell
# Using Chocolatey
choco install go-task

# Using Scoop
scoop install task
```

### Manual Installation

Download the binary from the [releases page](https://github.com/go-task/task/releases).

### Verify Installation

```bash
task --version
```

## Quick Start

### List All Available Commands

```bash
task --list
# or simply
task
```

### Common Commands

```bash
# Full project setup (first time)
task setup

# Start development
task dev

# Run tests
task test
task test:cov
task test:e2e

# Docker management
task docker:dev:up
task docker:dev:down
task docker:dev:logs

# Database
task migration:run
task migration:show
task db:reset

# Code quality
task lint
task format
task check
```

## Command Reference

### Installation and Setup

| Command | Description |
|---------|-------------|
| `task install` | Install npm dependencies |
| `task setup` | Complete project setup (install + env + db + migrations) |
| `task env:create` | Create .env file from .env.example |

### Development

| Command | Description |
|---------|-------------|
| `task dev` | Start development server (with watch mode) |
| `task start` | Alias for `task dev` |
| `task start:prod` | Start production server |
| `task build` | Build project for production |
| `task clean` | Remove dist/ and coverage/ folders |
| `task clean:all` | Complete cleanup (includes node_modules/) |

### Tests

| Command | Description |
|---------|-------------|
| `task test` | Run feature tests |
| `task test:watch` | Run tests in watch mode |
| `task test:cov` | Run tests with coverage report |
| `task test:features` | Run feature tests (Use Cases) |
| `task test:features:cov` | Feature tests with coverage |
| `task test:e2e` | Run end-to-end tests (auto-manages DB) |
| `task test:all` | Run all tests with coverage |

### Docker - Development

| Command | Description |
|---------|-------------|
| `task docker:dev:up` | Start development database (port 54320) |
| `task docker:dev:down` | Stop development database |
| `task docker:dev:logs` | Show database logs (follow mode) |
| `task docker:dev:restart` | Restart development database |
| `task docker:dev:clean` | Clean database (removes volumes) |

### Docker - E2E Tests

| Command | Description |
|---------|-------------|
| `task docker:e2e:up` | Start E2E test database (port 54321) |
| `task docker:e2e:down` | Stop E2E test database |
| `task docker:e2e:restart` | Restart E2E database (clean state) |

### Docker - Integration Tests

| Command | Description |
|---------|-------------|
| `task docker:integration:up` | Start integration test database (port 54322) |
| `task docker:integration:down` | Stop integration test database |
| `task docker:integration:restart` | Restart integration database |

### Docker - Global Management

| Command | Description |
|---------|-------------|
| `task docker:up` | Start all Docker services |
| `task docker:down` | Stop all Docker services |
| `task docker:clean` | Clean all Docker volumes |

### Database - Migrations

| Command | Description |
|---------|-------------|
| `task migration:run` | Execute pending migrations |
| `task migration:revert` | Revert last migration |
| `task migration:show` | Show migrations status |
| `task migration:generate` | Generate migration from entities (interactive) |
| `task migration:create` | Create empty migration (interactive) |
| `task db:reset` | Reset database completely (clean + up + migrate) |

### Code Quality

| Command | Description |
|---------|-------------|
| `task lint` | Lint and fix code with Biome |
| `task format` | Format code with Biome |
| `task check` | Complete quality check (lint + format + test:cov) |
| `task lint-staged` | Run lint-staged manually |

### Documentation

| Command | Description |
|---------|-------------|
| `task docs` | Open Swagger documentation (browser) |

### Utilities

| Command | Description |
|---------|-------------|
| `task info` | Show project information (versions, ports, docs) |
| `task help` | Show help (same as `task --list`) |

## Typical Workflows

### First Time Setup

```bash
# Complete setup in one command
task setup

# This will:
# 1. Install npm dependencies
# 2. Create .env file (if missing)
# 3. Start development database
# 4. Run migrations
```

### Daily Development

```bash
# Start development
task dev

# In another terminal: run tests in watch mode
task test:watch

# Check code quality before committing
task check
```

### Running Tests

```bash
# Feature tests with coverage
task test:cov

# E2E tests (database is auto-managed)
task test:e2e

# Run all tests
task test:all
```

### Database Management

```bash
# Create and run a new migration
task migration:generate
# Enter migration name when prompted
task migration:run

# Check migration status
task migration:show

# Reset database to clean state
task db:reset
```

### Code Quality Check (Before Push)

```bash
# One command to check everything
task check
```

## Comparison with npm Scripts

| npm script | Task command | Notes |
|------------|--------------|-------|
| `npm run start:dev` | `task dev` | Task auto-starts database |
| `npm run test:features:cov` | `task test:cov` | Shorter command |
| `npm run test:e2e` | `task test:e2e` | Task manages DB lifecycle |
| `npm run docker:dev:up && npm run migration:run` | `task setup` | Orchestration |
| Multiple commands | `task check` | Lint + format + test in one |

## Advanced Usage

### Running Multiple Tasks in Parallel

```bash
task docker:dev:up docker:e2e:up
```

### Task Dependencies

Some tasks have automatic dependencies:

- `task dev` automatically runs `docker:dev:up` first
- `task test:e2e` automatically manages E2E database lifecycle

### Variables

You can override variables:

```bash
task docker:dev:up DOCKER_DEV_FILE=docker-compose.custom.yml
```

### Verbose Mode

```bash
task --verbose dev
```

### Skip Dependencies

```bash
task --force dev
```

### Filter Tasks by Category

```bash
task --list | grep docker
```

## Troubleshooting

### Command not found

Make sure Task is installed and in your PATH:

```bash
which task
task --version
```

### Permission denied

On Linux, you might need to add execute permissions:

```bash
chmod +x $(which task)
```

### Tasks not running as expected

Check the `Taskfile.yml` syntax:

```bash
task --taskfile Taskfile.yml --list
```

## Configuration

The configuration is in `Taskfile.yml` at the project root. You can customize:

- Variables (Docker compose files, ports, etc.)
- Task dependencies
- Command sequences
- Platform-specific commands

### Taskfile Structure

```yaml
# Global variables
vars:
  DOCKER_DEV_FILE: docker-compose.dev.yml
  # ...

# Tasks grouped by category:
tasks:
  # Installation & Setup
  install, setup, env:create

  # Development
  dev, start, build, clean

  # Tests
  test, test:watch, test:cov, test:e2e

  # Docker (Dev, E2E, Integration)
  docker:dev:*, docker:e2e:*, docker:integration:*

  # Database - Migrations
  migration:*, db:reset

  # Code Quality
  lint, format, check

  # Documentation
  docs

  # Utilities
  info, help
```

### Naming Conventions

- **Simple actions**: `verb` (e.g., `dev`, `build`, `clean`)
- **Sub-commands**: `category:action` (e.g., `docker:dev:up`, `test:cov`)
- **npm consistency**: Keep the same names when possible

## Resources

- **Task Documentation**: https://taskfile.dev
- **GitHub Repository**: https://github.com/go-task/task
- **Task Examples**: https://taskfile.dev/usage/
