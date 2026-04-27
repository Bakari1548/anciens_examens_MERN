# Dockerisation du projet Anciens Examens MERN

Ce document explique comment déployer l'application Anciens Examens MERN avec Docker.

## Architecture

L'application est composée de 4 services principaux :

- **Frontend** : Application React avec Nginx (port 80)
- **Backend** : API Node.js/Express (port 5000)
- **MongoDB** : Base de données NoSQL (port 27017)
- **Redis** : Cache (port 6379)

## Prérequis

- Docker 20.10+
- Docker Compose 2.0+
- Make (optionnel, pour utiliser les commandes raccourcies)

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/Bakari1548/anciens_examens_MERN.git
cd anciens_examens_MERN
```

### 2. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos configurations
nano .env
```

Variables importantes à configurer :

```env
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=votre_mot_de_passe_securise
MONGO_DATABASE=anciens_examens

# JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_complique

# Cloudinary (pour l'upload d'images)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
```

### 3. Démarrer l'application

#### Option 1 : Avec Make (recommandé)

```bash
# Développement
make dev

# Production
make prod
```

#### Option 2 : Avec Docker Compose

```bash
# Développement
docker-compose up --build

# Production
docker-compose -f docker-compose.prod.yml up --build -d
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
# Démarrer les conteneurs
make up

# Arrêter les conteneurs
make down

# Voir les logs
make logs

# Nettoyer tout
make clean
```

### Base de données

```bash
# Se connecter à MongoDB
make db-shell

# Sauvegarder la base de données
make db-backup

# Restaurer la base de données
make db-restore
```

### Tests

```bash
# Exécuter les tests
make test

# Tests en mode watch
make test-watch
```

## Environnement de développement

Pour le développement local sans Docker :

```bash
# Backend
cd anciens_examens_back
npm install
npm start || node app.js

# Frontend (dans un autre terminal)
cd anciens_examens_front
npm install
npm run dev
```

## Environnement de production

Pour la production :

1. Utilisez `docker-compose.prod.yml`
2. Configurez toutes les variables d'environnement
3. Utilisez des mots de passe forts
4. Configurez un reverse proxy (nginx/traefik)
5. Configurez SSL/TLS
6. Mettez en place des sauvegardes régulières

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
   docker-compose logs mongodb
   ```

4. **Volumes corrompus**
   ```bash
   # Recréer les volumes
   make reset
   ```

### Logs

Pour voir les logs d'un service spécifique :

```bash
# Backend
docker-compose logs backend

# Frontend
docker-compose logs frontend

# MongoDB
docker-compose logs mongodb

# Redis
docker-compose logs redis
```

### Mise à jour

Pour mettre à jour l'application :

```bash
# Récupérer les dernières modifications
git pull

# Reconstruire et redémarrer
make prod
```

## Sécurité

- Les conteneurs tournent avec des utilisateurs non-root
- Les mots de passe sont stockés dans les variables d'environnement
- Les ports sont exposés uniquement en interne
- Nginx est configuré avec des en-têtes de sécurité

## Sauvegarde et restauration

### Sauvegarde automatique

Pour mettre en place des sauvegardes automatiques :

```bash
# Créer un script de sauvegarde
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec mongodb mongodump --db anciens_examens --out /backup/backup_$DATE
EOF

chmod +x backup.sh

# Ajouter au crontab
crontab -e
# Ajouter : 0 2 * * * /chemin/vers/backup.sh
```

### Restauration

```bash
# Lister les sauvegardes disponibles
docker-compose exec mongodb ls /backup/

# Restaurer une sauvegarde spécifique
docker-compose exec mongodb mongorestore --db anciens_examens /backup/backup_20231201_020000/anciens_examens
```

## Monitoring

Pour surveiller l'application :

```bash
# Voir l'état des conteneurs
docker-compose ps

# Voir l'utilisation des ressources
docker stats

# Voir les logs en temps réel
docker-compose logs -f
```

## Support

En cas de problème :

1. Vérifiez les logs avec `make logs`
2. Consultez la documentation du projet
3. Créez une issue sur GitHub

## Licence

Ce projet est sous licence MIT.
