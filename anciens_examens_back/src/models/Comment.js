const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'le contenu du commentaire est requis'],
        trim: true,
        minlength: [1, 'le commentaire ne peut pas être vide'],
        maxlength: [500, 'le commentaire ne peut pas dépasser 500 caractères']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = commentSchema;
