#!/bin/bash

# Script d'initialisation de la base de données
# Ce script crée la base de données et exécute les migrations

set -e

echo "🚀 Initialisation de la base de données wavo-route-solver"

# Charger les variables d'environnement si le fichier .env existe
if [ -f .env ]; then
    echo "📝 Chargement des variables d'environnement depuis .env"
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️  Fichier .env non trouvé, utilisation des valeurs par défaut"
fi

# Variables par défaut
DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-5432}
DB_USER=${DATABASE_USERNAME:-postgres}
DB_PASS=${DATABASE_PASSWORD:-postgres}
DB_NAME=${DATABASE_NAME:-wavo_route_solver}

echo "📊 Configuration de la base de données:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"

# Vérifier que PostgreSQL est accessible
echo "🔍 Vérification de la connexion à PostgreSQL..."
if PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw postgres; then
    echo "✅ Connexion à PostgreSQL réussie"
else
    echo "❌ Impossible de se connecter à PostgreSQL"
    echo "   Assurez-vous que PostgreSQL est en cours d'exécution et que les identifiants sont corrects"
    exit 1
fi

# Créer la base de données si elle n'existe pas
echo "🗄️  Création de la base de données si nécessaire..."
if PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "   La base de données $DB_NAME existe déjà"
else
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
    echo "✅ Base de données $DB_NAME créée"
fi

# Activer l'extension UUID
echo "🔧 Activation de l'extension uuid-ossp..."
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" > /dev/null 2>&1
echo "✅ Extension uuid-ossp activée"

# Exécuter les migrations
echo "🔄 Exécution des migrations TypeORM..."
npm run migration:run

echo ""
echo "✨ Initialisation de la base de données terminée avec succès!"
echo ""
echo "📚 Prochaines étapes:"
echo "   1. Démarrez l'application: npm run start:dev"
echo "   2. Les données de test seront chargées automatiquement via le DatabaseSeeder"
echo "   3. Accédez à l'API: http://localhost:3000"
echo "   4. Consultez la documentation Swagger: http://localhost:3000/api"
echo ""
