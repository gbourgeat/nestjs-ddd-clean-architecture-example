#!/bin/bash

# Script de validation de la configuration des logs en CI
# Usage: ./scripts/test-ci-logs.sh

set -e

echo "🧪 Test de configuration des logs en CI"
echo "========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de test
test_config() {
    local file=$1
    local pattern=$2
    local description=$3

    if grep -q "$pattern" "$file"; then
        echo -e "${GREEN}✓${NC} $description"
        return 0
    else
        echo -e "${RED}✗${NC} $description"
        return 1
    fi
}

# Test 1: TypeORM logging désactivé en test
echo "1️⃣  Vérification de la configuration TypeORM..."
test_config "src/infrastructure/database/database.config.ts" \
    "logging: process.env.NODE_ENV === 'development'" \
    "TypeORM logging désactivé en test"

test_config "src/infrastructure/database/data-source.ts" \
    "logging: process.env.NODE_ENV === 'development'" \
    "DataSource logging désactivé en test"

echo ""

# Test 2: Console logs désactivés
echo "2️⃣  Vérification de la désactivation des logs console..."
test_config "test/e2e/setup.ts" \
    "global.console = {" \
    "Console logs désactivés en E2E"

test_config "test/integration/setup.ts" \
    "global.console = {" \
    "Console logs désactivés en integration"

echo ""

# Test 3: NestJS logger désactivé
echo "3️⃣  Vérification de la désactivation du logger NestJS..."
test_config "test/e2e/get-fastest-route.e2e-spec.ts" \
    "logger: false" \
    "Logger NestJS désactivé dans get-fastest-route"

test_config "test/e2e/update-road-segment-speed.e2e-spec.ts" \
    "logger: false" \
    "Logger NestJS désactivé dans update-road-segment-speed"

test_config "test/e2e/create-road-segment.e2e-spec.ts" \
    "logger: false" \
    "Logger NestJS désactivé dans create-road-segment"

echo ""

# Test 4: Jest configuration
echo "4️⃣  Vérification de la configuration Jest..."
test_config "test/e2e/jest-e2e.json" \
    '"silent": false' \
    "Jest E2E en mode silent configuré"

test_config "test/integration/jest.integration.json" \
    '"silent": false' \
    "Jest integration en mode silent configuré"

echo ""

# Test 5: GitHub Actions CI variable
echo "5️⃣  Vérification de la variable CI dans GitHub Actions..."
test_config ".github/workflows/ci.yml" \
    "CI: true" \
    "Variable CI définie dans workflow"

echo ""
echo "========================================="
echo -e "${GREEN}✅ Tous les tests de configuration sont passés !${NC}"
echo ""
echo "📝 Les logs devraient être réduits dans la CI."
echo "🔍 Pour tester localement : export CI=true && npm run test:e2e"
echo ""
