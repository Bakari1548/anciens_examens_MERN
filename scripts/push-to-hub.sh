#!/bin/bash

# Script pour pousser les images Docker sur Docker Hub

# Charger les variables
source .dockerhub

echo "🐳 Déploiement sur Docker Hub"
echo "=========================="

# Vérifier si l'utilisateur est connecté à Docker Hub
echo "📋 Vérification de la connexion Docker Hub..."
if ! docker info | grep -q "Username"; then
    echo "❌ Vous n'êtes pas connecté à Docker Hub"
    echo "🔑 Veuillez vous connecter avec :"
    echo "   docker login"
    echo "   ou"
    echo "   docker login -u votre_nom_utilisateur"
    exit 1
fi

echo "✅ Connexion Docker Hub vérifiée"

# Construire les images avec les tags appropriés
echo "🔨 Construction des images Docker..."

# Backend
echo "📦 Construction du backend..."
docker build -t ${BACKEND_FULL_IMAGE} ./anciens_examens_back/
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la construction du backend"
    exit 1
fi

# Frontend
echo "📦 Construction du frontend..."
docker build -t ${FRONTEND_FULL_IMAGE} ./anciens_examens_front/
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la construction du frontend"
    exit 1
fi

echo "✅ Images construites avec succès"

# Pousser les images sur Docker Hub
echo "📤 Push des images sur Docker Hub..."

# Backend
echo "📤 Push du backend..."
docker push ${BACKEND_FULL_IMAGE}
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du push du backend"
    exit 1
fi

# Frontend
echo "📤 Push du frontend..."
docker push ${FRONTEND_FULL_IMAGE}
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du push du frontend"
    exit 1
fi

echo "✅ Images poussées avec succès sur Docker Hub!"

# Afficher les informations
echo ""
echo "📊 Informations de déploiement:"
echo "Backend: ${BACKEND_FULL_IMAGE}"
echo "Frontend: ${FRONTEND_FULL_IMAGE}"
echo ""
echo "🚀 Pour déployer avec Docker Hub:"
echo "   docker-compose -f docker-compose.hub.yml up -d"
echo ""
echo "🌐 Accès à l'application:"
echo "   Frontend: http://localhost"
echo "   Backend: http://localhost:5000"
echo "   MongoDB: localhost:27017"
echo "   Redis: localhost:6379"
