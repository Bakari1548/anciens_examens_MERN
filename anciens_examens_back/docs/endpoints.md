# Liste des Endpoints API

## Base URL
```
http://localhost:8000/api
```

## Routes Utilisateurs (`/api/users`)

### Routes publiques
| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/users/register` | Inscription d'un nouvel utilisateur | Non |
| POST | `/users/login` | Connexion d'un utilisateur | Non |
| POST | `/users/forgot-password` | Demande de réinitialisation mot de passe | Non |
| POST | `/users/reset-password/:token` | Réinitialiser mot de passe avec token | Non |

### Routes protégées
| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| GET | `/users/profile` | Obtenir le profil utilisateur | Oui |
| PUT | `/users/change-password` | Changer le mot de passe | Oui |

### Routes administratives
| Méthode | Endpoint | Description | Auth requise | Rôle requis |
|---------|----------|-------------|--------------|-------------|
| GET | `/users/all/:page/:limit` | Obtenir tous les utilisateurs (paginé) | Oui | Admin |
| GET | `/users/get/:id` | Obtenir un utilisateur par ID | Oui | Admin |
| DELETE | `/users/delete/:id` | Supprimer un utilisateur | Oui | Admin |
| PUT | `/users/activate/:id` | Activer un utilisateur | Oui | Admin |
| PUT | `/users/desactivate/:id` | Désactiver un utilisateur | Oui | Admin |
| PUT | `/users/ban/:id` | Bannir un utilisateur | Oui | Admin |
| PUT | `/users/unban/:id` | Débannir un utilisateur | Oui | Admin |

### Modération et signalements
| Méthode | Endpoint | Description | Auth requise | Rôle requis |
|---------|----------|-------------|--------------|-------------|
| GET | `/admin/reports` | Obtenir tous les signalements | Oui | Admin |
| GET | `/admin/reports/:id` | Obtenir un signalement par ID | Oui | Admin |
| PATCH | `/admin/reports/:id/resolve` | Résoudre un signalement | Oui | Admin |
| POST | `/admin/users/:id/ban` | Bannir un utilisateur (admin) | Oui | Admin |
| POST | `/admin/users/:id/unban` | Débannir un utilisateur (admin) | Oui | Admin |

## Routes Examens (`/api/exams`)

### Routes publiques
| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| GET | `/exams` | Obtenir tous les examens (paginé, filtré) | Non |
| GET | `/exams/:slug` | Obtenir un examen par slug | Non |

### Routes protégées
| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/exams` | Créer un nouvel examen | Oui |
| PUT | `/exams/:id` | Mettre à jour un examen | Oui |
| DELETE | `/exams/:id` | Supprimer un examen | Oui |

### Routes de commentaires
| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/exams/:id/comment` | Ajouter un commentaire | Oui |
| DELETE | `/exams/:id/comment/:commentId` | Supprimer un commentaire | Oui |

### Routes de likes
| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/exams/:id/like` | Liker un examen | Oui |
| DELETE | `/exams/:id/like` | Unliker un examen | Oui |

## Paramètres de Requête

### Pagination et tri (applicable aux listes)
| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| page | number | 1 | Page actuelle |
| limit | number | 10 | Nombre d'éléments par page |
| sortBy | string | createdAt | Champ de tri |
| sortOrder | string | desc | Ordre (asc/desc) |

### Filtres pour utilisateurs
| Paramètre | Type | Description |
|-----------|------|-------------|
| search | string | Recherche textuelle (nom, prénom, email) |
| role | string | Filtrer par rôle (admin, moderator, user) |
| status | string | Filtrer par statut (active, inactive, banned) |

### Filtres pour examens
| Paramètre | Type | Description |
|-----------|------|-------------|
| search | string | Recherche textuelle (titre, matière) |
| filiere | string | Filtrer par filière |
| ufr | string | Filtrer par UFR |
| matiere | string | Filtrer par matière |
| year | number | Filtrer par année |

## Codes HTTP

### Succès
| Code | Signification |
|------|---------------|
| 200 | OK - Requête réussie |
| 201 | Created - Ressource créée |
| 204 | No Content - Suppression réussie |

| Erreurs client | Signification |
|---------------|---------------|
| 400 | Bad Request - Données invalides |
| 401 | Unauthorized - Non authentifié |
| 403 | Forbidden - Accès refusé |
| 404 | Not Found - Ressource non trouvée |
| 409 | Conflict - Conflit de données |
| 413 | Payload Too Large - Fichier trop volumineux |
| 422 | Unprocessable Entity - Validation échouée |

### Erreurs serveur
| Code | Signification |
|------|---------------|
| 500 | Internal Server Error - Erreur serveur |
| 503 | Service Unavailable - Service indisponible |

## Format des Réponses

### Succès
```json
{
  "message": "Message descriptif",
  "data": "Données de la réponse",
  "pagination": { // Optionnel pour les listes
    "currentPage": 1,
    "totalPages": 5,
    "total": 48,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Erreur
```json
{
  "message": "Message d'erreur",
  "error": "Détails de l'erreur (optionnel)"
}
```

## Limites et Restrictions

### Limites de taille
| Ressource | Limite |
|-----------|--------|
| Fichiers d'examen | 10MB |
| Commentaires | 500 caractères |
| Noms | 50 caractères |
| Titres | 100 caractères |

### Rate limiting
| Endpoint | Limite | Période |
|----------|--------|---------|
| Tous les endpoints | 100 requêtes | 15 minutes |
| Authentification | 10 requêtes | 15 minutes |

## En-têtes HTTP

### Authentification
```
Authorization: Bearer <token_jwt>
```

### Upload de fichiers
```
Content-Type: multipart/form-data
```

### Requêtes JSON
```
Content-Type: application/json
```

## Exemples d'utilisation

### Inscription
```bash
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Obtenir les utilisateurs (admin)
```bash
curl -X GET "http://localhost:8000/api/users/all/1/25" \
  -H "Authorization: Bearer <token>"
```

### Obtenir les utilisateurs avec filtres (admin)
```bash
curl -X GET "http://localhost:8000/api/users/all/1/25?search=jean&role=admin" \
  -H "Authorization: Bearer <token>"
```

### Obtenir les examens
```bash
curl "http://localhost:8000/api/exams?page=1&limit=10&search=math"
```

### Créer un examen
```bash
curl -X POST http://localhost:8000/api/exams \
  -H "Authorization: Bearer <token>" \
  -F "title=Examen de Math" \
  -F "ufr=Sciences" \
  -F "filiere=Informatique" \
  -F "matiere=Mathématiques" \
  -F "year=2023" \
  -F "file=@exam.pdf"
```

## Notes importantes

1. **Tokens JWT**: Valides 24h
2. **Slug**: Généré automatiquement à partir du titre
3. **Permissions**: Seul l'auteur peut modifier/supprimer ses examens
4. **Comments**: L'auteur du commentaire ou de l'examen peut supprimer
5. **Likes**: Un utilisateur peut liker/unliker un examen une seule fois
6. **Files**: Format PDF uniquement pour les examens
