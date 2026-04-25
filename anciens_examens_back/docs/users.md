# Routes Utilisateurs

## Base URL
```
/api/users
```

## Routes publiques

### Inscription
```http
POST /api/users/register
```

**Corps de la requête:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // optionnel, défaut: "user"
}
```

**Réponse (201):**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-09-01T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Connexion
```http
POST /api/users/login
```

**Corps de la requête:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse (200):**
```json
{
  "message": "Connexion réussie",
  "user": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Mot de passe oublié
```http
POST /api/users/forgot-password
```

**Corps de la requête:**
```json
{
  "email": "john@example.com"
}
```

**Réponse (200):**
```json
{
  "message": "Email de réinitialisation envoyé"
}
```

### Réinitialiser le mot de passe
```http
POST /api/users/reset-password/:token
```

**Corps de la requête:**
```json
{
  "password": "newpassword123"
}
```

**Réponse (200):**
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

## Routes protégées (authentification requise)

### Obtenir le profil
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Réponse (200):**
```json
{
  "message": "Profil récupéré avec succès",
  "user": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-09-01T10:00:00.000Z"
  }
}
```

### Changer le mot de passe
```http
PUT /api/users/change-password
Authorization: Bearer <token>
```

**Corps de la requête:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Réponse (200):**
```json
{
  "message": "Mot de passe changé avec succès"
}
```

## Routes administratives (rôle admin requis)

### Obtenir tous les utilisateurs (paginé)
```http
GET /api/users/all?page=1&limit=10
Authorization: Bearer <admin_token>
```

**Réponse (200):**
```json
{
  "users": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2023-09-01T10:00:00.000Z"
    }
  ],
  "total": 25,
  "totalPages": 3,
  "currentPage": 1
}
```

### Obtenir un utilisateur par ID
```http
GET /api/users/get/:id
Authorization: Bearer <admin_token>
```

**Réponse (200):**
```json
{
  "message": "Utilisateur récupéré",
  "user": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-09-01T10:00:00.000Z"
  }
}
```

### Supprimer un utilisateur
```http
DELETE /api/users/delete/:id
Authorization: Bearer <admin_token>
```

**Réponse (200):**
```json
{
  "message": "Utilisateur supprimé"
}
```

## Codes d'erreur spécifiques

- `400`: Données invalides ou manquantes
- `401`: Token invalide ou expiré
- `403`: Accès refusé (rôle insuffisant)
- `404`: Utilisateur non trouvé
- `409`: Email déjà utilisé

## Validation des données

### Inscription
- `name`: Requis, min 3 caractères
- `email`: Requis, format email valide
- `password`: Requis, min 6 caractères
- `role`: Optionnel, valeurs: "user" | "admin"

### Connexion
- `email`: Requis
- `password`: Requis

### Changement mot de passe
- `currentPassword`: Requis
- `newPassword`: Requis, min 6 caractères
