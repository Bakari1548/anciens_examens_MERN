# Secrets GitHub requis pour le CI/CD

## Configuration des secrets dans GitHub

Pour que le CI/CD fonctionne correctement, vous devez configurer les secrets suivants dans votre repository GitHub :

1. Allez dans votre repository GitHub
2. Cliquez sur `Settings` → `Secrets and variables` → `Actions`
3. Cliquez sur `New repository secret` et ajoutez chaque secret ci-dessous

## Secrets requis pour le backend

### JWT_SECRET
- **Description**: Clé secrète pour la signature des tokens JWT
- **Exemple**: `votre_cle_secrete_tres_longue_et_unique_pour_jwt`
- **Note**: Doit être une chaîne de caractères longue et sécurisée

### MONGODB_URI
- **Description**: Chaîne de connexion MongoDB
- **Exemple**: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **Note**: Utilisez votre véritable URI MongoDB

### CLOUDINARY_CLOUD_NAME
- **Description**: Nom du cloud Cloudinary
- **Exemple**: `your-cloud-name`

### CLOUDINARY_API_KEY
- **Description**: Clé API Cloudinary
- **Exemple**: `123456789012345`

### CLOUDINARY_API_SECRET
- **Description**: Secret API Cloudinary
- **Exemple**: `votre-secret-cloudinary`

### EMAIL_HOST
- **Description**: Serveur SMTP pour l'envoi d'emails
- **Exemple**: `smtp.gmail.com`

### EMAIL_PORT
- **Description**: Port SMTP
- **Exemple**: `587`

### EMAIL_USER
- **Description**: Email pour l'envoi
- **Exemple**: `votre-email@gmail.com`

### EMAIL_PASS
- **Description**: Mot de passe application (pour Gmail)
- **Exemple**: `votre-mot-de-passe-app`

## Secrets requis pour le frontend

### VITE_API_URL
- **Description**: URL de l'API backend pour le frontend
- **Exemple**: `https://votre-api.com`

## Secrets optionnels pour le déploiement

### REDIS_PASSWORD
- **Description**: Mot de passe Redis (si utilisé)
- **Exemple**: `votre-redis-password`

## Vérification

Après avoir configuré tous les secrets, vous pouvez vérifier qu'ils fonctionnent en :

1. Faisant un push sur la branche `main`
2. Vérifiant que les tests backend passent dans GitHub Actions
3. Vérifiant que le build frontend réussit

## Dépannage

Si les tests échouent toujours avec l'erreur `secretOrPrivateKey must have a value` :

1. Vérifiez que `JWT_SECRET` est bien configuré dans les secrets GitHub
2. Vérifiez qu'il n'y a pas d'espaces ou de caractères invisibles dans la valeur
3. Assurez-vous que le nom du secret est exactement `JWT_SECRET` (majuscules)

## Sécurité

- Ne jamais partager ces secrets
- Utiliser des valeurs uniques et sécurisées
- Régénérer les secrets si vous pensez qu'ils ont été compromis
- Utiliser des mots de passe application pour Gmail plutôt que des mots de passe réels
