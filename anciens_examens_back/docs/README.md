# Documentation API - Anciens Examens

## Overview

Cette API RESTful permet de gérer une plateforme de partage d'anciens examens universitaires. Elle inclut la gestion des utilisateurs, des examens, des commentaires, des likes, et des demandes de réactivation de compte.

## Base URL

```
http://localhost:5000/api
```

## Authentification

L'API utilise des tokens JWT pour l'authentification. Le token doit être inclus dans l'en-tête Authorization:

```
Authorization: Bearer <token>
```

## Structure de la réponse

Toutes les réponses suivent ce format:

```json
{
  "message": "Message descriptif",
  "data": "Données de la réponse (Si applicable)",
  "error": "Message d'erreur (si applicable)"
}
```

## Pagination

Les routes qui supportent la pagination utilisent ces paramètres:

- `page`: Page actuelle (défaut: 1)
- `limit`: Nombre d'éléments par page (défaut: 10)
- `sortBy`: Champ de tri (défaut: createdAt)
- `sortOrder`: Ordre de tri (asc/desc, défaut: desc)

Réponse paginée:
```json
{
  "message": "Données récupérées",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "total": 48,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Configuration requise

- Node.js 16+
- MongoDB
- Variables d'environnement:
  - `JWT_SECRET`: Clé secrète pour les tokens JWT
  - `MONGODB_URI`: URI de connexion MongoDB
  - `PORT`: Port du serveur (défaut: 5000)
  - `FRONTEND_URL`: URL du frontend pour CORS (ex: https://votre-frontend.com)
  - `CLOUDINARY_CLOUD_NAME`: Nom Cloudinary
  - `CLOUDINARY_API_KEY`: Clé API Cloudinary
  - `CLOUDINARY_API_SECRET`: Secret API Cloudinary

## Démarrage

```bash
npm install
npm run dev
```

## Documentation des routes

- [Utilisateurs](./users.md)
- [Examens](./exams.md)
- [Modèles de données](./models.md)
- [Middlewares](./middlewares.md)
- [Endpoints](./endpoints.md) — Liste complète incluant les routes `/api/logs`
- [Changelog](./CHANGELOG.md)

## Codes d'erreur

- `200`: Succès
- `201`: Créé avec succès
- `204`: Supprimé avec succès
- `400`: Requête invalide
- `401`: Non authentifié
- `403`: Accès refusé
- `404`: Ressource non trouvée
- `408`: Timeout de la requête
- `409`: Conflit de données
- `413`: Payload trop large
- `422`: Entité non traitable
- `500`: Erreur serveur
- `503`: Service indisponible

## Gestion des fichiers

### Upload de fichiers
- **Format**: multipart/form-data
- **Types acceptés**: PDF, JPG, PNG, GIF
- **Taille maximale**: 10MB par fichier
- **Nombre maximum**: 5 fichiers par requête
- **Timeout**: 60 secondes

### En-têtes requis
```
Content-Type: multipart/form-data
Authorization: Bearer <token_jwt>
```

## Optimisations Mobiles

### Configuration spécifique
- Timeout augmenté à 60 secondes pour les connexions mobiles lentes
- Gestion améliorée des erreurs réseau (ECONNRESET, ETIMEDOUT)
- Messages d'erreur adaptés aux mobiles
- Détection automatique du mode mobile dans le frontend

### Gestion des erreurs mobiles
- **413**: Fichier trop volumineux
- **408**: Timeout de connexion
- **500**: Erreur Cloudinary
- Messages contextuels pour aider l'utilisateur mobile

## Sécurité

### Rate limiting
- **Authentification**: 10 requêtes par 15 minutes
- **Tous les endpoints**: 100 requêtes par 15 minutes

### Permissions
- Seul l'auteur peut modifier/supprimer ses examens
- Les admins peuvent gérer tous les contenus
- Validation stricte des entrées utilisateur

## Fonctionnalités Sociales (Nouveau v2.1.0)

### 👍 Système de Likes
- **Routes**: `GET/POST/DELETE /api/exams/:slug/like`
- **Statut du like**: Vérification en temps réel
- **Compteurs automatiques**: likesCount mis à jour automatiquement
- **Frontend**: Bouton avec animation et état persistant

### 💬 Système de Commentaires
- **Routes**:
  - `GET /api/exams/:slug/comments` - Public (lecture)
  - `POST /api/exams/:slug/comments` - Authentifié (création)
  - `DELETE /api/exams/:slug/comments/:commentId` - Authentifié (suppression)
- **Permissions**: Auteur du commentaire OU auteur de l'examen
- **Validation**: 500 caractères maximum
- **Compteurs automatiques**: commentsCount mis à jour
- **Frontend**: Formulaire, liste avec noms d'utilisateurs, bouton suppression

## Notes importantes

1. **Tokens JWT**: Valides 24h
2. **Slug**: Généré automatiquement à partir du titre avec suffixe aléatoire
3. **Permissions**: Rôles hiérarchiques (user < moderator < admin)
4. **Files**: Stockage sur Cloudinary avec nettoyage automatique
5. **Comments**: L'auteur du commentaire ou de l'examen peut supprimer
6. **Likes**: Un utilisateur peut liker/unliker un examen une seule fois (idempotent)
7. **Account Appeals**: Système de demande de réactivation pour comptes bannis
8. **Academic Data**: Gestion dynamique des UFR, filières, niveaux, semestres
9. **Multi-fichiers**: Support jusqu'à 5 fichiers par examen
10. **Profile Update**: Mise à jour du profil utilisateur avec validation
11. **Social Features**: Likes et commentaires intégrés avec mise à jour temps réel

## Monitoring et Logs

- Logs détaillés des erreurs et requêtes
- Configuration Cloudinary avec logs de connexion
- Gestion des erreurs en production vs développement
- Surveillance des uploads et des performances

## Déploiement

### Production
```bash
npm install
npm run build
npm start
```

### Docker
```bash
docker build -t anciens-examens-api .
docker run -p 5000:5000 anciens-examens-api
```

## Support et Débogage

- Mode développement: logs détaillés et messages d'erreur complets
- Mode production: erreurs génériques pour sécurité
- Monitoring des performances et des timeouts
- Tests unitaires complets pour toutes les fonctionnalités
