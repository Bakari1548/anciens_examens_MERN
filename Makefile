# Makefile pour le projet Anciens Examens MERN

.PHONY: help build up down logs clean dev prod install

help:
	@echo "Commandes disponibles:"
	@echo "  make install    - Installer les dépendances"
	@echo "  make dev        - Démarrer l'environnement de développement"
	@echo "  make build      - Construire les images Docker"
	@echo "  make up         - Démarrer les conteneurs (mode développement)"
	@echo "  make prod       - Démarrer les conteneurs (mode production)"
	@echo "  make down       - Arrêter les conteneurs"
	@echo "  make logs       - Afficher les logs"
	@echo "  make clean      - Nettoyer les conteneurs et volumes"
	@echo "  make reset      - Réinitialiser complètement l'environnement"

install:
	@echo "Installation des dépendances..."
	cd anciens_examens_back && npm install
	cd anciens_examens_front && npm install

dev:
	@echo "Démarrage en mode développement..."
	docker-compose up --build

build:
	@echo "Construction des images Docker..."
	docker-compose build

up:
	@echo "Démarrage des conteneurs (mode développement)..."
	docker-compose up -d

prod:
	@echo "Démarrage des conteneurs (mode production)..."
	docker-compose -f docker-compose.prod.yml up -d --build

down:
	@echo "Arrêt des conteneurs..."
	docker-compose down

logs:
	@echo "Affichage des logs..."
	docker-compose logs -f

clean:
	@echo "Nettoyage des conteneurs et volumes non utilisés..."
	docker-compose down -v
	docker system prune -f

reset:
	@echo "Réinitialisation complète de l'environnement..."
	docker-compose down -v --rmi all
	docker system prune -af
	docker volume prune -f

# Commandes de développement
backend-dev:
	@echo "Démarrage du backend en mode développement..."
	cd anciens_examens_back && node app.js

frontend-dev:
	@echo "Démarrage du frontend en mode développement..."
	cd anciens_examens_front && npm run dev

# Tests
test:
	@echo "Exécution des tests backend..."
	cd anciens_examens_back && npm test

test-watch:
	@echo "Exécution des tests backend en mode watch..."
	cd anciens_examens_back && npm run test:watch

# Database
db-shell:
	@echo "Connexion à la base de données MongoDB..."
	docker-compose exec mongodb mongosh -u admin -p password123 anciens_examens

db-backup:
	@echo "Sauvegarde de la base de données..."
	docker-compose exec mongodb mongodump --db anciens_examens --out /backup

db-restore:
	@echo "Restauration de la base de données..."
	docker-compose exec mongodb mongorestore --db anciens_examens /backup/anciens_examens

# Docker Hub
docker-login:
	@echo "Connexion à Docker Hub..."
	docker login

docker-build:
	@echo "Construction des images pour Docker Hub..."
	./build-and-push.sh

docker-push:
	@echo "Push des images sur Docker Hub..."
	./push-to-hub.sh

docker-hub-up:
	@echo "Démarrage avec les images Docker Hub..."
	docker-compose -f docker-compose.hub.yml up -d

docker-hub-down:
	@echo "Arrêt des services Docker Hub..."
	docker-compose -f docker-compose.hub.yml down

docker-hub-logs:
	@echo "Affichage des logs Docker Hub..."
	docker-compose -f docker-compose.hub.yml logs -f
