# Documentation API - Anciens Examens

## Overview

Cette API RESTful permet de gérer une plateforme de partage d'anciens examens universitaires. Elle inclut la gestion des utilisateurs, des examens, des commentaires et des likes.

## Base URL

```
http://localhost:8000/api
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
  "data": "Données de la réponse (si applicable)",
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
  - `PORT`: Port du serveur (défaut: 8000)

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

## Codes d'erreur

- `200`: Succès
- `201`: Créé avec succès
- `400`: Requête invalide
- `401`: Non authentifié
- `403`: Accès refusé
- `404`: Ressource non trouvée
- `500`: Erreur serveur
