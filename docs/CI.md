# 🔄 Continuous Integration (CI)

This project uses GitHub Actions for continuous integration. Here is an overview of the configured workflows.

## 📁 Workflow Structure

```
.github/workflows/
├── ci.yml              # Main CI pipeline
└── pr-validation.yml   # Quick Pull Request validation
```

## 🚀 Main CI Pipeline (`ci.yml`)

Triggered on:
- Push to `main` or `develop`
- Pull Request to `main` or `develop`

### Jobs

| Job | Description | Dependencies |
|-----|-------------|--------------|
| 🔍 **lint-build** | ESLint + TypeScript Build | - |
| 🧪 **test-features** | Domain + Application Tests | - |
| 🔌 **test-integration** | Infrastructure Tests (PostgreSQL) | - |
| 🚀 **test-e2e** | End-to-End Tests (PostgreSQL) | - |
| 📊 **coverage-report** | Consolidated coverage report | All tests |
| ✅ **ci-success** | Final success gate | All jobs |

### Code Coverage

Each test type generates a coverage report:

- **Features** → `coverage/features/` (Domain + Application)
- **Integration** → `coverage/integration/` (Infrastructure)
- **E2E** → `coverage/e2e/` (Presentation)

Reports are uploaded as GitHub artifacts and retained for 7 days.

## 🔍 PR Validation (`pr-validation.yml`)

Fast pipeline for Pull Requests:

1. **Quick Checks**: Prettier, ESLint, TypeScript, Build
2. **PR Tests**: Features tests only (faster)
3. **PR Info**: PR summary

## 🐳 Docker Services

Integration and E2E tests use PostgreSQL 16 Alpine:

| Test Type | Port | Database |
|-----------|------|----------|
| Integration | 54322 | `route_solver_integration_test` |
| E2E | 54321 | `route_solver_e2e_test` |

## 🛡️ Branch Protection

Recommendations for protecting `main` and `develop` branches:

1. **Require status checks to pass**:
   - `✅ CI Success`
   
2. **Require branches to be up to date**: Enabled

3. **Require pull request reviews**: At least 1 review

## 📊 Badges

Add these badges to your README:

```markdown
[![CI](https://github.com/gbourgeat/nestjs-ddd-clean-architecture-example/actions/workflows/ci.yml/badge.svg)](https://github.com/gbourgeat/nestjs-ddd-clean-architecture-example/actions/workflows/ci.yml)
```

## 🔧 CI Environment Variables

The `.env.*.example` files are used to create test configurations:

| File | Usage |
|------|-------|
| `.env.e2e.example` | E2E tests configuration |
| `.env.integration.example` | Integration tests configuration |

## 🔐 GitHub Secrets

Sensitive values like API keys must be stored as GitHub Secrets, **never committed to the repository**.

### Required Secrets

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `OPENWEATHERMAP_API_KEY` | OpenWeatherMap API key | Integration & E2E tests |

### How to Configure Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the secret name and value:
   - Name: `OPENWEATHERMAP_API_KEY`
   - Value: Your actual API key (e.g., `9f885ae3c45036beb59101a1f7f23251`)
5. Click **Add secret**

### Security Best Practices

- ✅ **DO**: Store API keys in GitHub Secrets
- ✅ **DO**: Keep `.env.e2e` and `.env.integration` in `.gitignore`
- ✅ **DO**: Use `.env.*.example` files with placeholder values
- ❌ **DON'T**: Commit real API keys to the repository
- ❌ **DON'T**: Print secrets in CI logs

### Local Development

For local testing, copy the example files and add your real API key:

```bash
cp .env.e2e.example .env.e2e
cp .env.integration.example .env.integration
# Then edit the files and add your real API key
```

## Optimizations

1. **Concurrency**: Cancels previous runs on the same branch
2. **npm Cache**: Node.js dependencies caching
3. **Parallel Jobs**: Tests run in parallel
4. **Temporary Artifacts**: 7-day retention to reduce storage

## Local Execution

To simulate CI locally:

```bash
# Lint & Build
npm run lint
npm run build

# Features tests
npm run test:features:cov

# Integration tests (requires Docker)
task docker:integration:up
npm run test:integration:cov
task docker:integration:down

# E2E tests (requires Docker)
task docker:e2e:up
npm run test:e2e:cov
task docker:e2e:down
```
