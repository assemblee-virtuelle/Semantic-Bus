#!/bin/bash

# Script de configuration des tests pour Semantic Bus

set -e

echo "🚀 Configuration de l'environnement de test pour Semantic Bus"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
fi

NODE_VERSION=$(node --version)
log_info "Node.js version: $NODE_VERSION"

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
fi

NPM_VERSION=$(npm --version)
log_info "npm version: $NPM_VERSION"

# Installer les dépendances racine
log_info "Installation des dépendances racine..."
npm install

# Installer les dépendances du moteur
log_info "Installation des dépendances du moteur..."
cd engine
npm install
cd ..

# Installer les dépendances des tests unitaires
log_info "Installation des dépendances des tests unitaires..."
cd tests/test_unitaires
npm install
cd ../..

# Installer les dépendances des tests d'intégration
log_info "Installation des dépendances des tests d'intégration..."

# Auth tests
cd tests/test_integrations/auth
npm install
cd ../../..

# User tests
cd tests/test_integrations/user
npm install
cd ../../..

# Workspaces tests
cd tests/test_integrations/workspaces
npm install
cd ../../..

# Installer les autres modules si nécessaire
if [ -d "main" ]; then
    log_info "Installation des dépendances du module main..."
    cd main
    if [ -f "package.json" ]; then
        npm install
    fi
    cd ..
fi

if [ -d "timer" ]; then
    log_info "Installation des dépendances du module timer..."
    cd timer
    if [ -f "package.json" ]; then
        npm install
    fi
    cd ..
fi

if [ -d "core" ]; then
    log_info "Installation des dépendances du module core..."
    cd core
    if [ -f "package.json" ]; then
        npm install
    fi
    cd ..
fi

# Vérifier que les tests peuvent s'exécuter
log_info "Vérification de la configuration des tests..."

# Test des tests unitaires existants
log_info "Test des tests unitaires existants..."
if npm run test:unit; then
    log_info "✅ Tests unitaires existants : OK"
else
    log_warn "⚠️ Tests unitaires existants : Échec (normal si première installation)"
fi

# Test des tests du moteur
log_info "Test des tests du moteur..."
if npm run test:engine; then
    log_info "✅ Tests du moteur : OK"
else
    log_warn "⚠️ Tests du moteur : Échec (vérifiez les dépendances)"
fi

# Test des tests d'intégration
log_info "Test des tests d'intégration..."
if npm run test:integration; then
    log_info "✅ Tests d'intégration : OK"
else
    log_warn "⚠️ Tests d'intégration : Échec (normal si services non démarrés)"
fi

# Vérifier Docker pour les tests e2e
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    log_info "Docker disponible: $DOCKER_VERSION"
    
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        log_info "Docker Compose disponible: $COMPOSE_VERSION"
        log_info "Les tests e2e peuvent être exécutés avec 'npm run test:e2e'"
    else
        log_warn "Docker Compose non disponible. Tests e2e limités."
    fi
else
    log_warn "Docker non disponible. Tests e2e non disponibles."
fi

# Résumé
echo ""
log_info "🎉 Configuration terminée !"
echo ""
echo "Commandes disponibles :"
echo "  npm test                    # Tous les tests"
echo "  npm run test:unit          # Tests unitaires existants"
echo "  npm run test:engine        # Tests du moteur"
echo "  npm run test:integration   # Tests d'intégration"
echo "  npm run test:e2e           # Tests end-to-end"
echo "  npm run lint               # Linting"
echo ""
echo "Pour plus d'informations, consultez tests/README.md"