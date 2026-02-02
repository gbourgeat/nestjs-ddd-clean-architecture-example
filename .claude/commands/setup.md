# Setup

Set up the project for development.

## Arguments

$ARGUMENTS - (optional) `reset` to reset everything including database

## Instructions

### Standard Setup

Run the complete setup:

```bash
task setup
```

This executes:
1. `npm install` - Install dependencies
2. Create `.env` from `.env.example` (if missing)
3. `docker:dev:up` - Start development database
4. `migration:run` - Run database migrations

### Manual Setup

If Task is not installed:

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start database
npm run docker:dev:up

# Run migrations
npm run migration:run

# (Optional) Seed data
npm run seed:run
```

### Reset Setup

If argument is `reset`:

```bash
# Stop all Docker containers
npm run docker:dev:down
npm run docker:e2e:down
npm run docker:integration:down

# Remove Docker volumes (WARNING: data loss)
docker volume rm route-solver_postgres_dev_data

# Clean build artifacts
rm -rf dist coverage node_modules

# Fresh install
npm install

# Start fresh
task setup
```

Or with Task:

```bash
task db:reset
```

## Environment Variables

Key variables in `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=54320
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=route_solver_dev

# OpenWeatherMap API
OPENWEATHERMAP_API_KEY=your_api_key_here
```

## Verify Setup

After setup, verify everything works:

```bash
# Check architecture
npm run deps:check

# Run tests
npm run test:features

# Start development server
npm run start:dev

# Access API docs
open http://localhost:3000/docs
```

## Docker Ports

| Environment | Port | Database |
|-------------|------|----------|
| Development | 54320 | route_solver_dev |
| E2E Tests | 54321 | route_solver_e2e_test |
| Integration | 54322 | route_solver_integration_test |