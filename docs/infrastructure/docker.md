# Docker Compose Environments

This project uses three Docker Compose environments to separate execution contexts.

## Available Files

- `docker-compose.dev.yml` - Development environment
- `docker-compose.e2e.yml` - End-to-End tests
- `docker-compose.integration.yml` - Integration tests

## Port Strategy

| Environment | Host Port | Container Port | Database |
|-------------|-----------|----------------|----------|
| Development | 54320 | 5432 | `route_solver_dev` |
| E2E Tests | 54321 | 5432 | `route_solver_e2e_test` |
| Integration Tests | 54322 | 5432 | `route_solver_integration_test` |

### Why Ports 54320-54322?

These ports avoid conflicts with:

- PostgreSQL local installation (5432)
- Other database services (MySQL 3306, MongoDB 27017)
- Multi-project Docker setups using standard ports

The numbering scheme (5432 + suffix 0/1/2) is easy to remember and clearly identifies each environment.

### Verify Port Availability

```bash
# Linux / macOS
lsof -i :54320
lsof -i :54321
lsof -i :54322

# With ss
ss -tuln | grep -E "54320|54321|54322"
```

Empty output indicates the port is available.

## Development Environment

### Characteristics

- **Port**: 54320
- **Database**: `route_solver_dev`
- **Persistence**: Docker volume `postgres_dev_data`
- **Container**: `route-solver-postgres-dev`
- **Network**: `route-solver-dev`

### Commands

```bash
# Start database
npm run docker:dev:up

# Stop database
npm run docker:dev:down

# View logs
npm run docker:dev:logs
```

### Manual Commands

```bash
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
```

## E2E Test Environment

### Characteristics

- **Port**: 54321
- **Database**: `route_solver_e2e_test`
- **Persistence**: None (tmpfs - in-memory data)
- **Container**: `route-solver-postgres-e2e`
- **Restart**: `no` (no automatic restart)
- **Network**: `route-solver-e2e`

### Commands

```bash
# Start E2E database
npm run docker:e2e:up

# Stop E2E database
npm run docker:e2e:down

# Restart (clean state)
npm run docker:e2e:restart

# Run E2E tests
npm run docker:e2e:up && npm run test:e2e
```

### Manual Commands

```bash
docker-compose -f docker-compose.e2e.yml up -d
docker-compose -f docker-compose.e2e.yml down
```

## Integration Test Environment

### Characteristics

- **Port**: 54322
- **Database**: `route_solver_integration_test`
- **Persistence**: None (tmpfs - in-memory data)
- **Container**: `route-solver-postgres-integration`
- **Restart**: `no` (no automatic restart)
- **Network**: `route-solver-integration`

### Commands

```bash
# Start integration database
npm run docker:integration:up

# Stop integration database
npm run docker:integration:down

# Restart (clean state)
npm run docker:integration:restart
```

### Manual Commands

```bash
docker-compose -f docker-compose.integration.yml up -d
docker-compose -f docker-compose.integration.yml down
```

## Environment Variables

### Development (.env)

```env
DB_HOST=localhost
DB_PORT=54320
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=route_solver_dev
```

### E2E Tests (.env.e2e)

```env
DB_HOST=localhost
DB_PORT=54321
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=route_solver_e2e_test
```

### Integration Tests (.env.integration)

```env
DB_HOST=localhost
DB_PORT=54322
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=route_solver_integration_test
```

## Complete Cleanup

```bash
# Stop all environments
npm run docker:dev:down
npm run docker:e2e:down
npm run docker:integration:down

# Remove volumes (WARNING: data loss for dev)
docker volume rm route-solver_postgres_dev_data
```

## Best Practices

### Development

- Start with `npm run docker:dev:up` before launching the application
- Data persists between restarts

### E2E Tests

- Always use `npm run docker:e2e:restart` for a clean state
- Data is lost on stop (by design)

### Integration Tests

- Similar to E2E but on port 54322
- Allows running E2E and integration tests in parallel
- Use for testing TypeORM repositories directly

## Quick Reference

| Action | Command |
|--------|---------|
| Start dev | `npm run docker:dev:up` |
| Stop dev | `npm run docker:dev:down` |
| Logs dev | `npm run docker:dev:logs` |
| Start E2E | `npm run docker:e2e:up` |
| Restart E2E (clean) | `npm run docker:e2e:restart` |
| Stop E2E | `npm run docker:e2e:down` |
| Start integration | `npm run docker:integration:up` |
| Restart integration | `npm run docker:integration:restart` |
| Stop integration | `npm run docker:integration:down` |

## Troubleshooting

### "Port already in use"

```bash
# Identify the process using the port
lsof -i :54320

# If it's an old container:
docker ps -a | grep route-solver
docker stop <container_id>
docker rm <container_id>

# Restart
npm run docker:dev:up
```

### Changing Ports (if necessary)

If ports 54320-54322 are occupied:

1. Edit `docker-compose.dev.yml`, `docker-compose.e2e.yml`, etc.
2. Change the left side of the port mapping: `"NEW_PORT:5432"`
3. Update all `.env*` files

Example:

```yaml
ports:
  - '55320:5432'  # Instead of 54320:5432
```
