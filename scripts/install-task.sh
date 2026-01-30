#!/bin/bash

# Installation script for Task (Taskfile runner)
# Run this script to install Task on your system

set -e

echo "🚀 Installation de Task (Taskfile runner)"
echo ""

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Cygwin;;
    MINGW*)     MACHINE=MinGw;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "Système détecté: ${MACHINE}"
echo ""

if [ "${MACHINE}" = "Mac" ]; then
    echo "📦 Installation via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install go-task
        echo "✅ Task installé avec succès!"
    else
        echo "❌ Homebrew n'est pas installé. Veuillez installer Homebrew d'abord:"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
elif [ "${MACHINE}" = "Linux" ]; then
    echo "📦 Installation via script officiel..."

    # Check if snap is available
    if command -v snap &> /dev/null; then
        echo "Option 1: Installation via snap (recommandé)"
        echo "sudo snap install task --classic"
        echo ""
        read -p "Utiliser snap? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo snap install task --classic
            echo "✅ Task installé avec succès via snap!"
            exit 0
        fi
    fi

    echo "Option 2: Installation via script officiel"
    sudo sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin
    echo "✅ Task installé avec succès!"
else
    echo "❌ Système non supporté par ce script."
    echo ""
    echo "Veuillez installer Task manuellement depuis:"
    echo "https://taskfile.dev/installation/"
    exit 1
fi

echo ""
echo "🎉 Installation terminée!"
echo ""
echo "Vérification de l'installation:"
task --version

echo ""
echo "📋 Commandes disponibles:"
echo "  task --list     # Afficher toutes les commandes"
echo "  task setup      # Configuration initiale du projet"
echo "  task dev        # Démarrer le serveur de développement"
echo ""
echo "📖 Documentation complète: docs/TASKFILE.md"
