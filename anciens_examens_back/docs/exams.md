# Routes Examens

## Base URL
```
/api/exams
```

## Routes publiques

### Obtenir tous les examens (paginé)
```http
GET /api/exams?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=math&filiere=info&ufr=sci&matiere=math&year=2023
```

**Paramètres de requête:**
- `page`: Page actuelle (défaut: 1)
- `limit`: Nombre d'examens par page (défaut: 10)
- `sortBy`: Champ de tri (défaut: createdAt)
- `sortOrder`: Ordre de tri (asc/desc, défaut: desc)
- `search`: Recherche textuelle dans titre/matière
- `filiere`: Filtrer par filière
- `ufr`: Filtrer par UFR
- `matiere`: Filtrer par matière
- `year`: Filtrer par année

**Réponse (200):**
```json
{
  "message": "Examens récupérés avec succès",
  "exams": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "title": "Examen de Mathématiques",
      "ufr": "Sciences",
      "filiere": "Informatique",
      "matiere": "Mathématiques",
      "year": 2023,
      "author": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "filePath": "/uploads/exams/math_exam_2023.pdf",
      "likesCount": 15,
      "commentsCount": 8,
      "createdAt": "2023-09-01T10:00:00.000Z",
      "updatedAt": "2023-09-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "total": 48,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

### Obtenir un examen par slug
```http
GET /api/exams/:slug
```

**Réponse (200):**
```json
{
  "message": "Examen récupéré avec succès",
  "exam": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Examen de Mathématiques",
    "ufr": "Sciences",
    "filiere": "Informatique",
    "matiere": "Mathématiques",
    "year": 2023,
    "author": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "filePath": "/uploads/exams/math_exam_2023.pdf",
    "likesCount": 15,
    "commentsCount": 8,
    "comments": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "user": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
          "name": "Jane Smith"
        },
        "content": "Très bon examen, merci !",
        "createdAt": "2023-09-02T14:30:00.000Z"
      }
    ],
    "likes": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
        "user": "64f1a2b3c4d5e6f7g8h9i0j6",
        "createdAt": "2023-09-02T10:15:00.000Z"
      }
    ],
    "createdAt": "2023-09-01T10:00:00.000Z",
    "updatedAt": "2023-09-01T10:00:00.000Z"
  }
}
```

## Routes protégées (authentification requise)

### Créer un examen
```http
POST /api/exams
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Corps de la requête (form-data):**
```
title: "Examen de Physique"
ufr: "Sciences"
filiere: "Informatique"
matiere: "Physique"
year: "2023"
file: [fichier PDF]
```

**Réponse (201):**
```json
{
  "message": "Examen créé avec succès",
  "exam": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
    "title": "Examen de Physique",
    "ufr": "Sciences",
    "filiere": "Informatique",
    "matiere": "Physique",
    "year": 2023,
    "author": "64f1a2b3c4d5e6f7g8h9i0j1",
    "filePath": "/uploads/exams/physics_exam_2023.pdf",
    "likesCount": 0,
    "commentsCount": 0,
    "createdAt": "2023-09-03T09:00:00.000Z",
    "updatedAt": "2023-09-03T09:00:00.000Z"
  }
}
```

### Mettre à jour un examen
```http
PUT /api/exams/:slug
Authorization: Bearer <token>
```

**Corps de la requête:**
```json
{
  "title": "Examen de Physique - Modifié",
  "ufr": "Sciences",
  "filiere": "Informatique",
  "matiere": "Physique",
  "year": 2023
}
```

**Réponse (200):**
```json
{
  "message": "Examen mis à jour avec succès",
  "updatedExam": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
    "title": "Examen de Physique - Modifié",
    "ufr": "Sciences",
    "filiere": "Informatique",
    "matiere": "Physique",
    "year": 2023,
    "author": "64f1a2b3c4d5e6f7g8h9i0j1",
    "filePath": "/uploads/exams/physics_exam_2023.pdf",
    "likesCount": 0,
    "commentsCount": 0,
    "updatedAt": "2023-09-03T10:00:00.000Z"
  }
}
```

### Supprimer un examen
```http
DELETE /api/exams/:slug
Authorization: Bearer <token>
```

**Réponse (200):**
```json
{
  "message": "Examen supprimé avec succès"
}
```

## Routes de commentaires (authentification requise)

### Ajouter un commentaire
```http
POST /api/exams/:id/comment
Authorization: Bearer <token>
```

**Corps de la requête:**
```json
{
  "content": "Excellent examen, très utile !"
}
```

**Réponse (201):**
```json
{
  "message": "Commentaire ajouté avec succès",
  "exam": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "commentsCount": 9,
    "comments": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j8",
        "user": "64f1a2b3c4d5e6f7g8h9i0j1",
        "content": "Excellent examen, très utile !",
        "createdAt": "2023-09-03T11:00:00.000Z"
      }
    ]
  }
}
```

### Supprimer un commentaire
```http
DELETE /api/exams/:id/comment/:commentId
Authorization: Bearer <token>
```

**Réponse (200):**
```json
{
  "message": "Commentaire supprimé avec succès"
}
```

## Routes de likes (authentification requise)

### Liker un examen
```http
POST /api/exams/:id/like
Authorization: Bearer <token>
```

**Réponse (200):**
```json
{
  "message": "Examen liké avec succès",
  "exam": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "likesCount": 16,
    "isLiked": true
  }
}
```

### Unliker un examen
```http
DELETE /api/exams/:id/like
Authorization: Bearer <token>
```

**Réponse (200):**
```json
{
  "message": "Like retiré avec succès",
  "exam": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "likesCount": 15,
    "isLiked": false
  }
}
```

## Codes d'erreur spécifiques

- `400`: Données invalides ou manquantes
- `401`: Token invalide ou expiré
- `403`: Accès refusé (pas l'auteur de l'examen)
- `404`: Examen non trouvé
- `409`: Slug déjà existant (création)
- `413`: Fichier trop volumineux

## Validation des données

### Création/Mise à jour
- `title`: Requis, min 3 caractères
- `ufr`: Requis, min 3 caractères
- `filiere`: Requis, min 3 caractères
- `matiere`: Requis, min 3 caractères
- `year`: Requis, nombre à 4 chiffres
- `file`: Requis (création), format PDF, max 10MB

### Commentaires
- `content`: Requis, min 1 caractère, max 500 caractères

## Permissions

- **Création**: Utilisateurs authentifiés
- **Modification**: Auteur de l'examen uniquement
- **Suppression**: Auteur de l'examen uniquement
- **Commentaires**: Utilisateurs authentifiés
- **Likes**: Utilisateurs authentifiés
- **Suppression commentaire**: Auteur du commentaire ou auteur de l'examen
