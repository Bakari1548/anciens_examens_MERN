const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['info', 'warning', 'error'],
    required: true,
    default: 'info'
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: String,
    trim: true,
    default: 'System'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  ip: {
    type: String,
    trim: true,
    default: 'localhost'
  },
  userAgent: {
    type: String,
    trim: true,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
logSchema.index({ timestamp: -1 });
logSchema.index({ level: 1 });
logSchema.index({ action: 1 });
logSchema.index({ userId: 1 });

// TTL Index - MongoDB supprime automatiquement les logs après leur expiresAt
logSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Log', logSchema);
