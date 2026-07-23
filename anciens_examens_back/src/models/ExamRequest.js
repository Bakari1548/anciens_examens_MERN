const mongoose = require('mongoose');

const examRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterName: {
    type: String,
    required: true,
    trim: true
  },
  requesterEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  ufr: {
    type: String,
    required: true,
    trim: true
  },
  filiere: {
    type: String,
    required: true,
    trim: true
  },
  niveau: {
    type: String,
    required: true,
    trim: true
  },
  semestre: {
    type: String,
    required: true,
    trim: true
  },
  matiere: {
    type: String,
    required: true,
    trim: true
  },
  typeExamen: {
    type: String,
    default: '',
    trim: true
  },
  anneeExamen: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  messages: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'fulfilled', 'rejected'],
    default: 'pending'
  },
  adminMessage: {
    type: String,
    trim: true,
    default: ''
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  respondedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

examRequestSchema.index({ requester: 1, createdAt: -1 });
examRequestSchema.index({ status: 1, createdAt: -1 });
examRequestSchema.index({ 'messages.author': 1 });

module.exports = mongoose.model('ExamRequest', examRequestSchema);
