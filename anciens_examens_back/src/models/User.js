const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


// le Schema de l'utilisateur
const userSchema = new mongoose.Schema({
   firstName: {
    type: String,
    required: [true, 'le nom  est requis'],
    trim: true,
    minlength: [3, 'le nom doit avoir au moins 3 characters long']
  },
  lastName: {
    type: String,
    required: [true, 'le nom de famille est requis'],
    trim: true,
    minlength: [3, 'le nom de famille doit avoir au moins 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'l\'mail est requis'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@univ-thies\.sn$/, 'Veuillez entrer votre email universitaire']
  },
  password: {
    type: String,
    required: [true, 'le mot de passe est requis'],
    minlength: [6, 'le mot de passe doit avoir au moins 6 characters long']
  },
  passwordResetToken:{ 
    type: String,
    default: null
  },
  passwordResetExpires:{ 
    type: Date,
    default: null
  },
  exams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
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

// Hasher le mot de passe avant  de l'enregistrer
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    next(error);
  }
});

// Verifier si le mot de passe est correct
userSchema.methods.comparePassword = async function(passwordEntered) {
  return await bcrypt.compare(passwordEntered, this.password);
};

module.exports = mongoose.model('User', userSchema);