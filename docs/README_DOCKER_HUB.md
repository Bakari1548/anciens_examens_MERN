# Déploiement avec Docker Hub

Ce guide explique comment déployer l'application Anciens Examens MERN en utilisant les images Docker Hub.

## Prérequis

- Docker et Docker Compose installés
- Compte Docker Hub créé
- Accès internet pour télécharger les images

## Étapes de déploiement

### 1. Connexion à Docker Hub

```bash
docker login
```

Entrez votre nom d'utilisateur et mot de passe Docker Hub.

### 2. Télécharger et démarrer l'application

```bash
# Cloner le projet (si ce n'est pas déjà fait)
git clone https://github.com/Bakari1548/anciens_examens_MERN.git
cd anciens_examens_MERN

# Démarrer avec les images Docker Hub
docker-compose -f docker-compose.hub.yml up -d
```

### 3. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Configuration MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=votre_mot_de_passe_securise
MONGO_DATABASE=anciens_examens

# Configuration JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_complique

# Configuration Cloudinary (optionnel)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Configuration Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
```

### 4. Vérification du déploiement

```bash
# Vérifier l'état des conteneurs
docker-compose -f docker-compose.hub.yml ps

# Voir les logs
docker-compose -f docker-compose.hub.yml logs -f
```

## Accès à l'application

Une fois démarrée, l'application est accessible aux adresses suivantes :

- **Frontend** : http://localhost
- **Backend API** : http://localhost:5000
- **MongoDB** : localhost:27017
- **Redis** : localhost:6379

## Commandes utiles

### Gestion des conteneurs

```bash
# Démarrer les services
docker-compose -f docker-compose.hub.yml up -d

# Arrêter les services
docker-compose -f docker-compose.hub.yml down

# Voir les logs
docker-compose -f docker-compose.hub.yml logs

# Redémarrer un service spécifique
docker-compose -f docker-compose.hub.yml restart backend

# Mettre à jour les images
docker-compose -f docker-compose.hub.yml pull
docker-compose -f docker-compose.hub.yml up -d
```

### Base de données

```bash
# Se connecter à MongoDB
docker-compose -f docker-compose.hub.yml exec mongodb mongosh -u admin -p password123 anciens_examens

# Sauvegarder la base de données
docker-compose -f docker-compose.hub.yml exec mongodb mongodump --db anciens_examens --out /backup

# Restaurer la base de données
docker-compose -f docker-compose.hub.yml exec mongodb mongorestore --db anciens_examens /backup/anciens_examens
```

## Images Docker Hub

Les images sont disponibles sur Docker Hub :

- **Backend** : `bakari1548/anciens_examens_backend:latest`
- **Frontend** : `bakari1548/anciens_examens_frontend:latest`

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │     MongoDB     │
│   (Nginx)       │────│   (Node.js)     │────│   (Database)    │
│   Port: 80      │    │   Port: 5000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │      Redis      │
                       │     (Cache)     │
                       │   Port: 6379    │
                       └─────────────────┘
```

## Sécurité

- Les conteneurs tournent avec des utilisateurs non-root (pour le backend)
- Les mots de passe sont stockés dans les variables d'environnement
- Les ports sont exposés uniquement en interne (sauf pour l'accès utilisateur)
- Nginx est configuré avec des en-têtes de sécurité

## Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   # Vérifier les ports utilisés
   netstat -tulpn | grep :80
   netstat -tulpn | grep :5000
   ```

2. **Problèmes de permissions**
   ```bash
   # Donner les permissions nécessaires
   sudo chown -R $USER:$USER uploads/
   ```

3. **MongoDB ne démarre pas**
   ```bash
   # Vérifier les logs de MongoDB
   docker-compose -f docker-compose.hub.yml logs mongodb
   ```

4. **Images non trouvées**
   ```bash
   # Vérifier la connexion à Docker Hub
   docker pull bakari1548/anciens_examens_backend:latest
   docker pull bakari1548/anciens_examens_frontend:latest
   ```

### Logs

Pour voir les logs d'un service spécifique :

```bash
# Backend
docker-compose -f docker-compose.hub.yml logs backend

# Frontend
docker-compose -f docker-compose.hub.yml logs frontend

# MongoDB
docker-compose -f docker-compose.hub.yml logs mongodb

# Redis
docker-compose -f docker-compose.hub.yml logs redis
```

## Mise à jour

Pour mettre à jour l'application avec les dernières images :

```bash
# Télécharger les nouvelles images
docker-compose -f docker-compose.hub.yml pull

# Redémarrer avec les nouvelles images
docker-compose -f docker-compose.hub.yml up -d
```

## Support

En cas de problème :

1. Vérifiez les logs avec `docker-compose -f docker-compose.hub.yml logs`
2. Consultez la documentation du projet
3. Créez une issue sur GitHub

## Licence

Ce projet est sous licence MIT.
