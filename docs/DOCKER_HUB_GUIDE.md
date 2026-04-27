# 🐳 Guide Complet Docker Hub - Projet Anciens Examens MERN

Ce guide explique comment gérer le cycle de vie complet des images Docker pour votre projet MERN.

## 📋 Table des matières

1. [Configuration préliminaire](#configuration-préliminaire)
2. [Pousser les images sur Docker Hub](#pousser-les-images-sur-docker-hub)
3. [Récupérer les images depuis Docker Hub](#récupérer-les-images-depuis-docker-hub)
4. [Lancer le projet avec Docker Hub](#lancer-le-projet-avec-docker-hub)
5. [Tester l'application](#tester-lapplication)
6. [Vérifier la configuration Nginx](#vérifier-la-configuration-nginx)
7. [Dépannage et bonnes pratiques](#dépannage-et-bonnes-pratiques)

---

## 🔧 Configuration préliminaire

### 1. Se connecter à Docker Hub

```bash
# Connexion interactive
docker login docker.io

# Ou avec variables d'environnement
export DOCKER_USERNAME=bkr00
export DOCKER_PASSWORD=votre_mot_de_passe
echo $DOCKER_PASSWORD | docker login docker.io -u $DOCKER_USERNAME --password-stdin
```

### 2. Variables d'environnement

Le fichier `.dockerhub` contient les variables nécessaires :

```bash
# Charger les variables
source .dockerhub

# Vérifier les variables
echo $BACKEND_FULL_IMAGE    # docker.io/bkr00/anciens_examens_backend:latest
echo $FRONTEND_FULL_IMAGE   # docker.io/bkr00/anciens_examens_frontend:latest
```

---

## 📤 Pousser les images sur Docker Hub

### Méthode 1 : Script automatisé

```bash
# Utiliser le script de push
./build-and-push.sh

# Ou via le Makefile
make docker-hub-push
```

### Méthode 2 : Manuellement

#### Construire les images

```bash
# Construire le backend
cd anciens_examens_back
docker build -t bkr00/anciens_examens_backend:latest .

# Construire le frontend
cd ../anciens_examens_front
docker build -t bkr00/anciens_examens_frontend:latest .
```

#### Pousser les images

```bash
# Pousser le backend
docker push bkr00/anciens_examens_backend:latest

# Pousser le frontend
docker push bkr00/anciens_examens_frontend:latest
```

### Méthode 3 : Avec variables

```bash
source .dockerhub

# Pousser avec les variables
docker push $BACKEND_FULL_IMAGE
docker push $FRONTEND_FULL_IMAGE
```

---

## 📥 Récupérer les images depuis Docker Hub

### 1. Pull manuel

```bash
# Récupérer le backend
docker pull bkr00/anciens_examens_backend:latest

# Récupérer le frontend
docker pull bkr00/anciens_examens_frontend:latest
```

### 2. Pull via Docker Compose

```bash
# Le docker-compose.hub.yml va automatiquement puller les images
docker-compose -f docker-compose.hub.yml pull

# Pull forcé (sans cache)
docker-compose -f docker-compose.hub.yml pull --no-cache
```

---

## 🚀 Lancer le projet avec Docker Hub

### 1. Démarrage complet

```bash
# Démarrer tous les services
docker-compose -f docker-compose.hub.yml up -d

# Vérifier l'état
docker-compose -f docker-compose.hub.yml ps
```

### 2. Services individuels

```bash
# Démarrer uniquement la base de données
docker-compose -f docker-compose.hub.yml up -d mongodb redis

# Démarrer le backend
docker-compose -f docker-compose.hub.yml up -d backend

# Démarrer le frontend
docker-compose -f docker-compose.hub.yml up -d frontend
```

### 3. Arrêt des services

```bash
# Arrêter tous les services
docker-compose -f docker-compose.hub.yml down

# Arrêter et supprimer les volumes
docker-compose -f docker-compose.hub.yml down -v
```

---

## 🧪 Tester l'application

### 1. Tests de base

```bash
# Test de santé du frontend
curl -I http://localhost

# Test de santé du backend
curl -I http://localhost:5000

# Test via nginx (recommandé)
curl -I http://localhost/api
```

### 2. Tests d'API

```bash
# Test d'inscription
curl -X POST http://localhost/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@uni.edu","password":"password123"}'

# Test de connexion
curl -X POST http://localhost/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@uni.edu","password":"password123"}'
```

### 3. Tests dans le navigateur

1. **Frontend** : http://localhost
   - Vérifier que l'interface se charge
   - Tester la navigation entre les pages

2. **Inscription** : 
   - Aller sur http://localhost/inscription
   - Remplir le formulaire avec un email universitaire
   - Vérifier la réponse

3. **Connexion** :
   - Aller sur http://localhost/connexion
   - Tester avec les identifiants créés

---

## 🔍 Vérifier la configuration Nginx

### 1. Vérifier les logs Nginx

```bash
# Logs en temps réel
docker-compose -f docker-compose.hub.yml logs -f frontend

# Derniers logs
docker-compose -f docker-compose.hub.yml logs frontend | tail -20
```

### 2. Tester le proxy

```bash
# Test direct du backend
curl -v http://localhost:5000/api/users/register

# Test via nginx (doit fonctionner)
curl -v http://localhost/api/users/register

# Vérifier les en-têtes de réponse
curl -I http://localhost/api/users/register
```

### 3. Configuration Nginx attendue

Le fichier `nginx.conf` doit contenir :

```nginx
# Redirection des requêtes API vers le backend
location /api/ {
    proxy_pass http://backend:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# Support CORS pour les requêtes OPTIONS
if ($request_method = 'OPTIONS') {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
    add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
    add_header Content-Length 0;
    add_header Content-Type text/plain;
    return 204;
}
```

### 4. Dépannage Nginx

```bash
# Entrer dans le conteneur frontend
docker-compose -f docker-compose.hub.yml exec frontend sh

# Vérifier la configuration nginx
nginx -t

# Recharger nginx
nginx -s reload

# Vérifier les ports ouverts
netstat -tulpn | grep :80
```

---

## 🛠️ Dépannage et bonnes pratiques

### Problèmes courants

#### 1. Permission denied Docker Hub
```bash
# Solution : se reconnecter
docker logout
docker login docker.io
```

#### 2. Port déjà utilisé
```bash
# Vérifier les ports
sudo lsof -i :27017  # MongoDB
sudo lsof -i :5000   # Backend
sudo lsof -i :80     # Frontend

# Solution : arrêter les services locaux
sudo systemctl stop mongod
sudo systemctl stop nginx
```

#### 3. Images non trouvées
```bash
# Vérifier les images locales
docker images | grep bkr00

# Forcer le pull
docker-compose -f docker-compose.hub.yml pull --no-cache
```

#### 4. Conteneurs qui ne démarrent pas
```bash
# Vérifier les logs
docker-compose -f docker-compose.hub.yml logs

# Logs spécifiques
docker-compose -f docker-compose.hub.yml logs backend
docker-compose -f docker-compose.hub.yml logs frontend
docker-compose -f docker-compose.hub.yml logs mongodb
```

### Bonnes pratiques

#### 1. Gestion des versions
```bash
# Tagger les images avec version
docker tag bkr00/anciens_examens_backend:latest bkr00/anciens_examens_backend:v1.0.0
docker tag bkr00/anciens_examens_frontend:latest bkr00/anciens_examens_frontend:v1.0.0

# Pousser les versions
docker push bkr00/anciens_examens_backend:v1.0.0
docker push bkr00/anciens_examens_frontend:v1.0.0
```

#### 2. Nettoyage
```bash
# Supprimer les images non utilisées
docker image prune -f

# Supprimer les conteneurs arrêtés
docker container prune -f

# Vérifier l'espace disque
docker system df
```

#### 3. Surveillance
```bash
# Surveillance des ressources
docker stats

# Surveillance des logs en continu
docker-compose -f docker-compose.hub.yml logs -f --tail=100
```

#### 4. Sécurité
```bash
# Scanner les images
docker scan bkr00/anciens_examens_backend:latest
docker scan bkr00/anciens_examens_frontend:latest

# Utiliser des images officielles pour les services
# MongoDB, Redis, Nginx sont déjà des images officielles
```

---

## 📊 Checklist de déploiement

### Avant le déploiement
- [ ] Connecté à Docker Hub
- [ ] Variables d'environnement configurées
- [ ] Images construites localement avec succès
- [ ] Tests locaux passés

### Pendant le déploiement
- [ ] Images poussées sur Docker Hub
- [ ] Images pullées sur le serveur cible
- [ ] Services démarrés correctement
- [ ] Logs sans erreur

### Après le déploiement
- [ ] Application accessible via http://localhost
- [ ] API répond aux requêtes
- [ ] Base de données connectée
- [ ] Nginx proxy fonctionne
- [ ] Tests fonctionnels validés

---

## 🆘 Aide rapide

### Commandes essentielles

```bash
# Vérifier l'état complet
docker-compose -f docker-compose.hub.yml ps

# Redémarrer un service
docker-compose -f docker-compose.hub.yml restart backend

# Voir les logs récents
docker-compose -f docker-compose.hub.yml logs --tail=50

# Tout arrêter proprement
docker-compose -f docker-compose.hub.yml down -v

# Reconstruire et relancer
docker-compose -f docker-compose.hub.yml up -d --build
```

### Liens utiles

- **Docker Hub** : https://hub.docker.com/u/bkr00
- **Documentation Docker** : https://docs.docker.com/
- **Documentation Docker Compose** : https://docs.docker.com/compose/

---

## 📝 Notes importantes

1. **Toujours vérifier** que les variables d'environnement sont correctement chargées
2. **Utiliser `--no-cache`** lors des builds pour éviter les problèmes de cache
3. **Surveiller les logs** pendant les déploiements pour détecter rapidement les problèmes
4. **Tester l'application** après chaque modification importante
5. **Maintenir les images** à jour avec les dernières corrections de sécurité

---

*Ce guide couvre l'ensemble du cycle de vie Docker pour votre projet MERN. Pour toute question, référez-vous aux sections appropriées ou consultez la documentation officielle Docker.*
