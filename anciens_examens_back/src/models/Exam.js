const mongoose = require('mongoose');
const commentSchema = require('./Comment');
const likeSchema = require('./Like');

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'le titre est requis'],
        trim: true,
        minlength: [3, 'le titre doit avoir au moins 3 characters long']
    },
    slug: {
        type: String,
        required: [true, 'le slug est requis'],
        trim: true,
        unique: [true, 'le slug doit être unique'],
        minlength: [3, 'le slug doit avoir au moins 3 characters long']
    },
    ufr: {
        type: String,
        required: [true, 'l\'ufr est requise'],
        trim: true,
        minlength: [3, 'l\'ufr doit avoir au moins 3 characters long']
    },
    filiere: {
        type: String,
        required: [true, 'la filiere est requise'],
        trim: true,
        minlength: [2, 'la filiere doit avoir au moins 2 characters long']
    },
    matiere: {
        type: String,
        required: [true, 'la matiere est requise'],
        trim: true,
        minlength: [3, 'la matiere doit avoir au moins 3 characters long']
    },
    description : {
        type: String,
        nullable: true
    },
    year: {
        type: Number,
        nullable: true,
        validate: {
            validator: function(v) {
                if (v === null || v === undefined) return true;
                return v.toString().length === 4;
            },
            message: 'l\'année doit avoir 4 chiffres'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    author: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        }
    },
    filePath: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true,
        enum: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    },
    cloudinaryPublicId: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
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
    }
});

examSchema.pre('save', function() {
    this.updatedAt = Date.now();
});

examSchema.pre('save', function() {
    if (this.title && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Supprime les caractères spéciaux
            .replace(/\s+/g, '-') // Remplace les espaces par des tirets
            .replace(/-+/g, '-') // Supprime les tirets multiples
            .trim(); // Supprime les espaces en début/fin
    }
});

// Méthode pour ajouter un commentaire
examSchema.methods.addComment = function(userId, content) {
    this.comments.push({ user: userId, content });
    this.commentsCount += 1;
    return this.save();
};

// Méthode pour supprimer un commentaire
examSchema.methods.removeComment = function(commentId) {
    this.comments = this.comments.filter(comment => comment._id.toString() !== commentId.toString());
    this.commentsCount = Math.max(0, this.commentsCount - 1);
    return this.save();
};

// Méthode pour liker un examen
examSchema.methods.addLike = function(userId) {
    // Vérifier si l'utilisateur a déjà liké
    const alreadyLiked = this.likes.some(like => like.user.toString() === userId.toString());
    
    if (!alreadyLiked) {
        this.likes.push({ user: userId });
        this.likesCount += 1;
    }
    
    return this.save();
};

// Méthode pour unlike un examen
examSchema.methods.removeLike = function(userId) {
    const likeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
    
    if (likeIndex !== -1) {
        this.likes.splice(likeIndex, 1);
        this.likesCount = Math.max(0, this.likesCount - 1);
    }
    
    return this.save();
};

// Méthode pour vérifier si un utilisateur a liké
examSchema.methods.isLikedBy = function(userId) {
    return this.likes.some(like => like.user.toString() === userId.toString());
};

// Index pour optimiser les requêtes
examSchema.index({ 'comments.user': 1 });
examSchema.index({ 'likes.user': 1 });

module.exports = mongoose.model('Exam', examSchema);