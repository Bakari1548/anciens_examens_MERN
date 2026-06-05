# Liste des Endpoints API

## Base URL
```
http://localhost:5000/api
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
| PUT | `/users/profile` | Mettre à jour le profil utilisateur | Oui |
| PUT | `/users/change-password` | Changer le mot de passe | Oui |

### Routes administratives
| Méthode | Endpoint | Description | Auth requise | Rôle requis |
|---------|----------|-------------|--------------|-------------|
| GET | `/users/all/:page/:limit` | Obtenir tous les utilisateurs (paginé) | Oui | Admin |
| GET | `/users/get/:id` | Obtenir un utilisateur par ID | Oui | Admin |
| DELETE | `/users/delete/:id` | Supprimer un utilisateur | Oui | Admin |
| PUT | `/users/activate/:id` | Activer un utilisateur | Oui | Admin |
| PUT | `/users/desactivate/:id` | Désactiver un utilisateur | Oui | Admin |
| POST | `/users/ban/:id` | Bannir un utilisateur | Oui | Admin |
| PUT | `/users/unban/:id` | Débannir un utilisateur | Oui | Admin |

### Routes de demandes de réactivation
| Méthode | Endpoint | Description | Auth requise | Rôle requis |
|---------|----------|-------------|--------------|-------------|
| POST | `/users/appeal` | Soumettre une demande de réactivation | Non | Non |
| GET | `/users/appeals` | Obtenir toutes les demandes | Non | Admin |
| PATCH | `/users/appeals/:id/approve` | Approuver une demande | Non | Admin |
| PATCH | `/users/appeals/:id/reject` | Rejeter une demande | Non | Admin |

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
| POST | `/exams` | Créer un nouvel examen (multi-fichiers supporté) | Oui |
| PUT | `/exams/:id` | Mettre à jour un examen | Oui |
| DELETE | `/exams/:id` | Supprimer un examen (avec fichiers Cloudinary) | Oui |

### Routes de commentaires (nouveau)
| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| GET | `/exams/:slug/comments` | Récupérer tous les commentaires | Non |
| POST | `/exams/:slug/comments` | Ajouter un commentaire | Oui |
| DELETE | `/exams/:slug/comments/:commentId` | Supprimer un commentaire | Oui |

### Routes de likes (nouveau)
| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| GET | `/exams/:slug/like/status` | Vérifier le statut du like | Oui |
| POST | `/exams/:slug/like` | Liker un examen | Oui |
| DELETE | `/exams/:slug/like` | Retirer un like | Oui |

**Notes importantes:**
- Les likes et commentaires utilisent le `slug` de l'examen, pas l'ID
- Les commentaires sont publics en lecture, mais requièrent une authentification pour créer/supprimer
- Seul l'auteur d'un commentaire ou l'auteur de l'examen peut supprimer un commentaire

## Routes Logs (`/api/logs`) — Nouveau v2.2.0

| Méthode | Endpoint | Description | Auth requise | Rôle requis |
|---------|----------|-------------|--------------|-------------|
| GET | `/logs` | Liste paginée des logs (filtres: level, action, search) | Oui | Admin |
| GET | `/logs/stats` | Statistiques agrégées (total/info/warning/error) | Oui | Admin |
| GET | `/logs/export` | Export CSV des logs filtrés | Oui | Admin |
| POST | `/logs` | Créer un log manuellement | Oui | Admin |
| DELETE | `/logs/cleanup?days=N` | Supprimer les logs plus anciens que N jours | Oui | Admin |

### Filtres et paramètres `/api/logs`
| Paramètre | Type | Description |
|-----------|------|-------------|
| page | number | Page (défaut: 1) |
| limit | number | Éléments par page (défaut: 20) |
| level | string | `info` \| `warning` \| `error` |
| action | string | Code d'action (ex: `LOGIN`, `EXAM_UPLOAD`) |
| search | string | Recherche dans `message`, `user`, `action` |

### Réponse `/api/logs`
```json
{
  "logs": [
    {
      "_id": "...",
      "level": "info",
      "action": "LOGIN",
      "user": "Jean Dupont",
      "userId": "...",
      "message": "Connexion réussie: Jean Dupont",
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "metadata": {},
      "timestamp": "2026-05-13T20:30:00.000Z"
    }
  ],
  "pagination": { "current": 1, "pages": 5, "total": 87 }
}
```

### Actions tracées automatiquement
- **Auth** : `LOGIN`, `FAILED_LOGIN`, `LOGIN_BANNED`, `LOGIN_INACTIVE`, `LOGOUT`, `REGISTER`, `REGISTER_FAILED`
- **Password** : `PASSWORD_CHANGED`, `PASSWORD_RESET_REQUEST`, `PASSWORD_RESET_SUCCESS`, `PASSWORD_RESET_FAILED`
- **Users** : `USER_UPDATED`, `USER_DELETED`, `USER_ACTIVATED`, `USER_DESACTIVATED`, `USER_BANNED`, `USER_UNBANNED`
- **Exams** : `EXAM_UPLOAD`, `EXAM_UPLOAD_FAILED`, `EXAM_UPDATED`, `EXAM_DELETED`, `EXAM_APPROVED`, `EXAM_REJECTED`
- **Social** : `EXAM_LIKED`, `EXAM_UNLIKED`, `COMMENT_ADDED`, `COMMENT_DELETED`
- **Modération** : `REPORT_RESOLVED`, `APPEAL_SUBMITTED`, `APPEAL_APPROVED`, `APPEAL_REJECTED`
- **Sécurité** : `AUTH_ERROR`, `SYSTEM_ERROR`, `EMAIL_FAILED`

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
| Fichiers d'examen | 10MB par fichier, 5 fichiers maximum |
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
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Obtenir les utilisateurs (admin)
```bash
curl -X GET "http://localhost:5000/api/users/all/1/25" \
  -H "Authorization: Bearer <token>"
```

### Obtenir les utilisateurs avec filtres (admin)
```bash
curl -X GET "http://localhost:5000/api/users/all/1/25?search=jean&role=admin" \
  -H "Authorization: Bearer <token>"
```

### Obtenir les examens
```bash
curl "http://localhost:5000/api/exams?page=1&limit=10&search=math"
```

### Demander une réactivation de compte
```bash
curl -X POST http://localhost:5000/api/users/appeal \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "reason": "Compte banni par erreur",
    "message": "Je souhaite réactiver mon compte pour continuer mes études"
  }'
```

### Obtenir les demandes de réactivation (admin)
```bash
curl -X GET "http://localhost:5000/api/users/appeals" \
  -H "Authorization: Bearer <admin_token>"
```

### Approuver une demande (admin)
```bash
curl -X PATCH "http://localhost:5000/api/users/appeals/12345/approve" \
  -H "Authorization: Bearer <admin_token>"
```

### Rejeter une demande (admin)
```bash
curl -X PATCH "http://localhost:5000/api/users/appeals/12345/reject" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "reason": "Informations insuffisantes"
  }'
```

### Créer un examen (multi-fichiers)
```bash
curl -X POST http://localhost:5000/api/exams \
  -H "Authorization: Bearer <token>" \
  -F "title=Examen de Math" \
  -F "ufr=Sciences" \
  -F "filiere=Informatique" \
  -F "matiere=Mathématiques" \
  -F "year=2023" \
  -F "file=@exam1.pdf" \
  -F "file=@exam2.pdf" \
  -F "file=@correction.jpg"
```

### Liker un examen
```bash
curl -X POST http://localhost:5000/api/exams/examen-math-abc12/like \
  -H "Authorization: Bearer <token>"
```

### Retirer un like
```bash
curl -X DELETE http://localhost:5000/api/exams/examen-math-abc12/like \
  -H "Authorization: Bearer <token>"
```

### Vérifier le statut du like
```bash
curl http://localhost:5000/api/exams/examen-math-abc12/like/status \
  -H "Authorization: Bearer <token>"
```

### Ajouter un commentaire
```bash
curl -X POST http://localhost:5000/api/exams/examen-math-abc12/comments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Super examen, merci pour le partage !"}'
```

### Récupérer les commentaires (public)
```bash
curl http://localhost:5000/api/exams/examen-math-abc12/comments
```

### Supprimer un commentaire
```bash
curl -X DELETE http://localhost:5000/api/exams/examen-math-abc12/comments/commentId123 \
  -H "Authorization: Bearer <token>"
```

## Notes importantes

1. **Tokens JWT**: Valides 24h
2. **Slug**: Généré automatiquement à partir du titre
3. **Permissions**: Seul l'auteur peut modifier/supprimer ses examens
4. **Comments**: L'auteur du commentaire ou de l'examen peut supprimer
5. **Likes**: Un utilisateur peut liker/unliker un examen une seule fois (idempotent)
6. **Files**: Format PDF uniquement pour les examens
7. **Social features**: Likes et commentaires intégrés avec compteurs automatiques
