# Middlewares

## Overview

Les middlewares sont des fonctions qui s'exécutent avant les routes pour vérifier l'authentification, les autorisations et valider les données.

## Middleware d'authentification

### `auth.middleware.js`

**Rôle:** Vérifie que l'utilisateur est authentifié via un token JWT valide.

**Utilisation:**
```javascript
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/profile', authMiddleware, getProfile);
```

**Processus:**
1. Extrait le token de l'en-tête `Authorization: Bearer <token>`
2. Vérifie la validité du token avec `jwt.verify()`
3. Récupère l'utilisateur depuis la base de données
4. Ajoute `req.user` avec les informations de l'utilisateur
5. Passe au middleware suivant

**Réponses d'erreur:**
- `401`: Token manquant
```json
{
  "message": "Token d'accès requis"
}
```

- `401`: Token invalide ou expiré
```json
{
  "message": 'Token invalide',
  "error": "TokenExpiredError: jwt expired"
}
```

- `401`: Utilisateur non trouvé
```json
{
  "message": "Token invalide"
}
```

## Middleware administrateur

### `admin.middleware.js`

**Rôle:** Vérifie que l'utilisateur a le rôle 'admin'.

**Utilisation:**
```javascript
const adminMiddleware = require('../middlewares/admin.middleware');

router.get('/all', adminMiddleware, getAllUsers);
```

**Processus:**
1. Exécute le même processus que `authMiddleware`
2. Vérifie que `req.user.role === 'admin'`
3. Passe au middleware suivant si autorisé

**Réponses d'erreur:**
- `401`: Token manquant ou invalide (même que authMiddleware)
- `403`: Rôle insuffisant
```json
{
  "message": "Accès refusé. Rôle admin requis."
}
```

## Middleware de validation (à implémenter)

### `validation.middleware.js`

**Rôle:** Valide les données entrantes selon des schémas prédéfinis.

**Exemple d'utilisation:**
```javascript
const { validateExam } = require('../middlewares/validation.middleware');

router.post('/', authMiddleware, validateExam, createExam);
```

**Schéma de validation pour les examens:**
```javascript
const examValidationSchema = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100
  },
  ufr: {
    required: true,
    minLength: 3,
    maxLength: 50
  },
  filiere: {
    required: true,
    minLength: 3,
    maxLength: 50
  },
  matiere: {
    required: true,
    minLength: 3,
    maxLength: 50
  },
  year: {
    required: true,
    type: 'number',
    min: 2000,
    max: 2100
  }
};
```

## Middleware de gestion des erreurs

### `error.middleware.js`

**Rôle:** Gère les erreurs de manière centralisée.

**Utilisation:**
```javascript
const errorHandler = require('../middlewares/error.middleware');

app.use(errorHandler);
```

**Processus:**
1. Capture toutes les erreurs non gérées
2. Formate la réponse d'erreur cohérente
3. Log les erreurs en développement

## Middleware de logging

### `logging.middleware.js`

**Rôle:** Log les requêtes HTTP pour le débogage et la surveillance.

**Utilisation:**
```javascript
const logger = require('../middlewares/logging.middleware');

app.use(logger);
```

**Format de log:**
```
[2023-09-01T10:00:00.000Z] GET /api/exams?page=1 - 200 - 127.0.0.1 - Mozilla/5.0...
```

## Middleware de rate limiting

### `rateLimit.middleware.js`

**Rôle:** Limite le nombre de requêtes par utilisateur/IP.

**Configuration:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes
  message: {
    message: "Trop de requêtes, veuillez réessayer plus tard"
  }
});

app.use('/api/', limiter);
```

## Ordre d'exécution des middlewares

Pour une route protégée avec validation:
1. `rateLimit.middleware.js` (limitation de débit)
2. `logging.middleware.js` (logging de la requête)
3. `auth.middleware.js` (vérification de l'authentification)
4. `admin.middleware.js` (vérification du rôle admin si nécessaire)
5. `validation.middleware.js` (validation des données)
6. Route handler
7. `error.middleware.js` (gestion des erreurs)

## Personnalisation

### Ajouter un middleware personnalisé

```javascript
// custom.middleware.js
const customMiddleware = (req, res, next) => {
  // Logique personnalisée
  console.log('Middleware personnalisé exécuté');
  next();
};

module.exports = customMiddleware;
```

### Composition de middlewares

```javascript
// Combiner plusieurs middlewares
router.get('/protected', 
  authMiddleware, 
  adminMiddleware, 
  validateData, 
  getProtectedData
);
```

## Bonnes pratiques

1. **Ordre**: Placer les middlewares dans le bon ordre
2. **Gestion d'erreurs**: Toujours appeler `next(error)` en cas d'erreur
3. **Performance**: Éviter les opérations lourdes dans les middlewares
4. **Logging**: Logger les erreurs pour le débogage
5. **Validation**: Valider les données le plus tôt possible
6. **Sécurité**: Ne jamais exposer d'informations sensibles dans les messages d'erreur
