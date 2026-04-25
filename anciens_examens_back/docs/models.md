# Modèles de Données

## Overview

Les modèles de données définissent la structure des collections dans MongoDB. Ils incluent la validation, les méthodes utilitaires et les relations entre les entités.

## Modèle User

### Fichier: `src/models/User.js`

### Schéma

```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [3, 'Le nom doit avoir au moins 3 caractères'],
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit avoir au moins 6 caractères'],
    select: false // Non inclus par défaut dans les requêtes
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

### Méthodes

#### `comparePassword(candidatePassword)`
Compare un mot de passe en clair avec le hash stocké.

```javascript
const isMatch = await user.comparePassword('password123');
```

#### `getResetPasswordToken()`
Génère un token de réinitialisation de mot de passe.

```javascript
const resetToken = user.getResetPasswordToken();
```

### Hooks

#### `pre('save')`
Hash le mot de passe avant sauvegarde si modifié.

```javascript
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
```

## Modèle Exam

### Fichier: `src/models/Exam.js`

### Schéma

```javascript
const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    minlength: [3, 'Le titre doit avoir au moins 3 caractères']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  ufr: {
    type: String,
    required: [true, 'L\'UFR est requise'],
    trim: true,
    minlength: [3, 'L\'UFR doit avoir au moins 3 caractères']
  },
  filiere: {
    type: String,
    required: [true, 'La filière est requise'],
    trim: true,
    minlength: [3, 'La filière doit avoir au moins 3 caractères']
  },
  matiere: {
    type: String,
    required: [true, 'La matière est requise'],
    trim: true,
    minlength: [3, 'La matière doit avoir au moins 3 caractères']
  },
  year: {
    type: Number,
    required: [true, 'L\'année est requise'],
    validate: {
      validator: function(v) {
        return v.toString().length === 4;
      },
      message: 'L\'année doit avoir 4 chiffres'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filePath: {
    type: String,
    required: [true, 'Le chemin du fichier est requis']
  },
  comments: [commentSchema],
  likes: [likeSchema],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

### Méthodes

#### `addComment(userId, content)`
Ajoute un commentaire à l'examen.

```javascript
await exam.addComment('userId123', 'Très bon examen !');
```

#### `removeComment(commentId)`
Supprime un commentaire.

```javascript
await exam.removeComment('commentId123');
```

#### `addLike(userId)`
Ajoute un like (vérifie les doublons).

```javascript
await exam.addLike('userId123');
```

#### `removeLike(userId)`
Supprime un like.

```javascript
await exam.removeLike('userId123');
```

#### `isLikedBy(userId)`
Vérifie si un utilisateur a liké.

```javascript
const isLiked = exam.isLikedBy('userId123');
```

### Index

```javascript
examSchema.index({ title: 'text', matiere: 'text' });
examSchema.index({ author: 1 });
examSchema.index({ 'comments.user': 1 });
examSchema.index({ 'likes.user': 1 });
examSchema.index({ filiere: 1, ufr: 1, matiere: 1, year: 1 });
```

## Modèle Comment

### Fichier: `src/models/Comment.js`

### Schéma

```javascript
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Le contenu du commentaire est requis'],
    trim: true,
    minlength: [1, 'Le commentaire ne peut pas être vide'],
    maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

## Modèle Like

### Fichier: `src/models/Like.js`

### Schéma

```javascript
const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

## Relations entre modèles

### User et Exam
- Un `User` peut créer plusieurs `Exam`
- Un `Exam` appartient à un `User` (author)

### User et Comment
- Un `User` peut écrire plusieurs `Comment`
- Un `Comment` appartient à un `User`

### User et Like
- Un `User` peut liker plusieurs `Exam`
- Un `Like` appartient à un `User`

### Exam et Comment
- Un `Exam` peut avoir plusieurs `Comment`
- Un `Comment` appartient à un `Exam`

### Exam et Like
- Un `Exam` peut avoir plusieurs `Like`
- Un `Like` appartient à un `Exam`

## Population des références

### Exemples de population

```javascript
// Populer l'auteur d'un examen
const exam = await Exam.findById(id).populate('author', 'name email');

// Populer les utilisateurs des commentaires
const exam = await Exam.findById(id).populate('comments.user', 'name');

// Population multiple
const exam = await Exam.findById(id)
  .populate('author', 'name email')
  .populate('comments.user', 'name')
  .populate('likes.user', 'name');
```

## Validation et contraintes

### Uniques
- `User.email`: Uniquement par utilisateur
- `Exam.slug`: Uniquement par examen

### Requis
- Tous les champs marqués `required: true`

### Enums
- `User.role`: 'user' | 'admin'

### Formats
- `User.email`: Format email valide
- `Exam.year`: 4 chiffres obligatoires

## Hooks et middlewares

### Pre-save hooks
- **User**: Hash du mot de passe
- **Exam**: Génération du slug, mise à jour des compteurs

### Pre-remove hooks
- **User**: Suppression des examens, commentaires et likes associés

## Performance et optimisation

### Index recommandés
```javascript
// Pour les recherches textuelles
examSchema.index({ title: 'text', matiere: 'text' });

// Pour les filtres
examSchema.index({ filiere: 1, ufr: 1, matiere: 1, year: 1 });

// Pour les relations
examSchema.index({ author: 1 });
examSchema.index({ 'comments.user': 1 });
examSchema.index({ 'likes.user': 1 });

// Pour les utilisateurs
userSchema.index({ email: 1 });
```

### Projection
```javascript
// Exclure le mot de passe
const user = await User.findById(id).select('-password');

// Inclure seulement certains champs
const exam = await Exam.findById(id).select('title filiere matiere year');
```

## Bonnes pratiques

1. **Validation**: Toujours valider les données au niveau du modèle
2. **Sécurité**: Ne jamais exposer de mots de passe ou données sensibles
3. **Performance**: Utiliser les index pour les requêtes fréquentes
4. **Population**: Populer seulement les champs nécessaires
5. **Hooks**: Utiliser les hooks pour la logique métier automatique
6. **Relations**: Définir clairement les relations entre les modèles
