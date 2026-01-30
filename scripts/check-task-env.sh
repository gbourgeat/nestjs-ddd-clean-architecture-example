#!/bin/bash

# Script de vérification de l'environnement Task
# Vérifie que tout est correctement installé et configuré

set -e

echo "🔍 Vérification de l'environnement Task Runner"
echo "================================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
SUCCESS=0
WARNINGS=0
ERRORS=0

# Fonction pour afficher le résultat
check_status() {
    local status=$1
    local message=$2

    if [ "$status" = "ok" ]; then
        echo -e "${GREEN}✅${NC} $message"
        ((SUCCESS++))
    elif [ "$status" = "warning" ]; then
        echo -e "${YELLOW}⚠️${NC}  $message"
        ((WARNINGS++))
    else
        echo -e "${RED}❌${NC} $message"
        ((ERRORS++))
    fi
}

# 1. Vérifier Task
echo "1️⃣  Vérification de Task..."
if command -v task &> /dev/null; then
    VERSION=$(task --version)
    check_status "ok" "Task installé: $VERSION"
else
    check_status "error" "Task n'est pas installé"
    echo "   → Installez avec: ./scripts/install-task.sh"
fi
echo ""

# 2. Vérifier Taskfile.yml
echo "2️⃣  Vérification des fichiers de configuration..."
if [ -f "Taskfile.yml" ]; then
    check_status "ok" "Taskfile.yml présent"
else
    check_status "error" "Taskfile.yml manquant"
fi

if [ -f ".env.example" ]; then
    check_status "ok" ".env.example présent"
else
    check_status "warning" ".env.example manquant"
fi

if [ -f ".env" ]; then
    check_status "ok" ".env présent"
else
    check_status "warning" ".env manquant (sera créé par 'task setup')"
fi
echo ""

# 3. Vérifier Node.js et npm
echo "3️⃣  Vérification de l'environnement Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_status "ok" "Node.js installé: $NODE_VERSION"
else
    check_status "error" "Node.js n'est pas installé"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_status "ok" "npm installé: $NPM_VERSION"
else
    check_status "error" "npm n'est pas installé"
fi
echo ""

# 4. Vérifier Docker
echo "4️⃣  Vérification de Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    check_status "ok" "Docker installé: $DOCKER_VERSION"

    # Vérifier que Docker est en cours d'exécution
    if docker info &> /dev/null; then
        check_status "ok" "Docker daemon en cours d'exécution"
    else
        check_status "warning" "Docker daemon ne répond pas"
        echo "   → Démarrez Docker"
    fi
else
    check_status "warning" "Docker n'est pas installé (optionnel)"
fi

if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f4 | tr -d ',')
    check_status "ok" "Docker Compose installé: $COMPOSE_VERSION"
else
    check_status "warning" "Docker Compose n'est pas installé (optionnel)"
fi
echo ""

# 5. Vérifier les dépendances npm
echo "5️⃣  Vérification des dépendances npm..."
if [ -d "node_modules" ]; then
    check_status "ok" "node_modules présent"
else
    check_status "warning" "node_modules manquant (exécutez 'task install')"
fi
echo ""

# 6. Vérifier les fichiers Docker Compose
echo "6️⃣  Vérification des fichiers Docker Compose..."
for file in docker-compose.dev.yml docker-compose.e2e.yml docker-compose.integration.yml; do
    if [ -f "$file" ]; then
        check_status "ok" "$file présent"
    else
        check_status "warning" "$file manquant"
    fi
done
echo ""

# 7. Vérifier la documentation
echo "7️⃣  Vérification de la documentation..."
for doc in docs/TASKFILE.md docs/TASK-SUMMARY.md docs/TASK-QUICKREF.md; do
    if [ -f "$doc" ]; then
        check_status "ok" "$doc présent"
    else
        check_status "warning" "$doc manquant"
    fi
done
echo ""

# Résumé
echo "================================================"
echo "📊 Résumé de la vérification"
echo "================================================"
echo -e "${GREEN}✅ Réussites:${NC} $SUCCESS"
echo -e "${YELLOW}⚠️  Avertissements:${NC} $WARNINGS"
echo -e "${RED}❌ Erreurs:${NC} $ERRORS"
echo ""

# Recommandations
if [ $ERRORS -gt 0 ]; then
    echo "🚨 Actions requises:"
    if ! command -v task &> /dev/null; then
        echo "  1. Installer Task: ./scripts/install-task.sh"
    fi
    if ! command -v node &> /dev/null; then
        echo "  2. Installer Node.js: https://nodejs.org/"
    fi
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "💡 Recommandations:"
    if [ ! -d "node_modules" ]; then
        echo "  • Installer les dépendances: task install"
    fi
    if [ ! -f ".env" ]; then
        echo "  • Créer le fichier .env: task env:create"
    fi
    if ! command -v docker &> /dev/null; then
        echo "  • Installer Docker pour utiliser les bases de données (optionnel)"
    fi
    echo ""
    echo "✨ Pour une configuration complète, exécutez:"
    echo "   task setup"
    echo ""
else
    echo "✨ Environnement prêt!"
    echo ""
    echo "🚀 Prochaines étapes:"
    echo "  • Configuration initiale: task setup"
    echo "  • Démarrer le serveur: task dev"
    echo "  • Voir toutes les commandes: task --list"
    echo "  • Documentation: cat docs/TASKFILE.md"
    echo ""
fi
