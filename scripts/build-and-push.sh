#!/bin/bash

# Script complet pour construire et pousser les images sur Docker Hub

set -e  # Arrêter le script en cas d'erreur

echo "🐳 Construction et déploiement sur Docker Hub"
echo "=========================================="

# Couleurs pour une meilleure lisibilité
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé"
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose n'est pas installé"
    exit 1
fi

# Charger les variables
if [ -f .dockerhub ]; then
    source .dockerhub
    print_info "Configuration Docker Hub chargée"
else
    print_error "Fichier .dockerhub non trouvé"
    exit 1
fi

# Vérifier la connexion Docker Hub (compatible Podman)
print_info "Vérification de la connexion Docker Hub..."
if ! docker info 2>/dev/null | grep -q "Username\|Login Succeeded"; then
    print_warning "Connexion Docker Hub non vérifiée"
    echo "🔑 Pour vous connecter :"
    echo "   docker login docker.io"
    echo "   ou"
    echo "   docker login -u ${DOCKER_USERNAME} docker.io"
    echo ""
    read -p "Continuer quand même ? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Connexion à Docker Hub requise"
        exit 1
    fi
fi

print_success "Préparation pour Docker Hub terminée"

# Nettoyer les anciennes images (optionnel)
echo ""
read -p "Voulez-vous nettoyer les anciennes images locales ? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Nettoyage des anciennes images..."
    docker system prune -f
    docker image prune -f
fi

# Construire les images
echo ""
print_info "Construction des images Docker..."

# Backend
echo "📦 Construction du backend..."
docker build -t ${BACKEND_FULL_IMAGE} ./anciens_examens_back/
if [ $? -ne 0 ]; then
    print_error "Erreur lors de la construction du backend"
    exit 1
fi
print_success "Backend construit avec succès"

# Frontend
echo "📦 Construction du frontend..."
docker build -t ${FRONTEND_FULL_IMAGE} ./anciens_examens_front/
if [ $? -ne 0 ]; then
    print_error "Erreur lors de la construction du frontend"
    exit 1
fi
print_success "Frontend construit avec succès"

# Afficher les images construites
echo ""
print_info "Images construites :"
docker images | grep "${DOCKER_USERNAME}"

# Pousser les images
echo ""
print_info "Push des images sur Docker Hub..."

# Backend
echo "📤 Push du backend..."
docker push ${BACKEND_FULL_IMAGE}
if [ $? -ne 0 ]; then
    print_error "Erreur lors du push du backend"
    exit 1
fi
print_success "Backend poussé avec succès"

# Frontend
echo "📤 Push du frontend..."
docker push ${FRONTEND_FULL_IMAGE}
if [ $? -ne 0 ]; then
    print_error "Erreur lors du push du frontend"
    exit 1
fi
print_success "Frontend poussé avec succès"

# Résumé
echo ""
print_success "🎉 Déploiement terminé avec succès !"
echo ""
echo "📊 Informations de déploiement:"
echo "   Backend: ${BACKEND_FULL_IMAGE}"
echo "   Frontend: ${FRONTEND_FULL_IMAGE}"
echo ""
echo "🚀 Pour tester localement avec les images Docker Hub:"
echo "   docker-compose -f docker-compose.hub.yml up -d"
echo ""
echo "🌐 Accès à l'application:"
echo "   Frontend: http://localhost"
echo "   Backend: http://localhost:5000"
echo "   MongoDB: localhost:27017"
echo "   Redis: localhost:6379"
echo ""
echo "📝 Note: N'oubliez pas de configurer votre fichier .env"
echo "   cp .env.example .env"
echo "   # Éditez .env avec vos configurations"
