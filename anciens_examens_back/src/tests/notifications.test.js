const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
require('dotenv').config();

jest.mock('../utils/sendEmail');
jest.mock('../middlewares/auth.middleware', () => {
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user) { req.user = user; next(); }
        else { res.status(401).json({ message: 'Utilisateur non trouvé' }); }
      } catch { res.status(401).json({ message: 'Token invalide' }); }
    } else { res.status(401).json({ message: 'Token manquant' }); }
  };
});
jest.mock('../middlewares/admin.middleware', () => (req, res, next) => next());

const app = require('../../app');

describe('Notification Tests', () => {
  let userToken, adminToken, testUser, testAdmin;

  beforeAll(async () => {
    testAdmin = await User.create({ firstName: 'Admin', lastName: 'Test', email: 'admin@univ-thies.sn', password: 'password123', role: 'admin', status: 'active' });
    testUser = await User.create({ firstName: 'User', lastName: 'Test', email: 'user@univ-thies.sn', password: 'password123', role: 'user', status: 'active', ufr: 'UFR Test', filiere: 'Informatique' });
    userToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    adminToken = jwt.sign({ userId: testAdmin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  });

  test('Notification de bienvenue après inscription', async () => {
    const newUser = await User.create({
      firstName: 'New', lastName: 'User', email: 'new@univ-thies.sn', password: 'password123', ufr: 'UFR Test', filiere: 'Informatique'
    });
    await Notification.create({
      recipient: newUser._id,
      type: 'success',
      title: 'Bienvenue sur Anciens Examens !',
      message: `Bonjour ${newUser.firstName} ! Bienvenue sur notre plateforme. Vous pouvez maintenant partager et consulter des examens.`,
      metadata: { userId: newUser._id },
      read: false
    });
    const notifications = await Notification.find({ recipient: newUser._id });
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].title).toBe('Bienvenue sur Anciens Examens !');
  });

  test('Notification de changement de mot de passe', async () => {
    await Notification.create({
      recipient: testUser._id,
      type: 'system',
      title: 'Mot de passe modifié',
      message: 'Votre mot de passe a été modifié avec succès. Si vous n\'êtes pas à l\'origine de cette modification, veuillez contacter le support.',
      metadata: { userId: testUser._id },
      read: false
    });
    const notifications = await Notification.find({ recipient: testUser._id, title: 'Mot de passe modifié' });
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].type).toBe('system');
  });

  test('Notification de partage d\'examen', async () => {
    const exam = await Exam.create({
      title: 'Test Exam', slug: 'test-exam', ufr: 'UFR Test', filiere: 'Informatique',
      niveau: 'L3', semestre: 'S6', typeExamen: 'Examen Final', matiere: 'Math',
      author: { _id: testUser._id, firstName: testUser.firstName, lastName: testUser.lastName }, files: []
    });
    await Notification.create({
      recipient: testUser._id, type: 'exam', title: 'Examen partagé avec succès',
      message: `Votre examen "${exam.title}" a été partagé et est en attente d'approbation.`,
      metadata: { examId: exam._id, slug: exam.slug }, read: false
    });
    const notifications = await Notification.find({ recipient: testUser._id, title: 'Examen partagé avec succès' });
    expect(notifications.length).toBeGreaterThan(0);
  });

  test('Notification de nouvel examen dans la filière', async () => {
    const otherUser = await User.create({
      firstName: 'Other', lastName: 'User', email: 'other@univ-thies.sn', password: 'password123',
      role: 'user', status: 'active', ufr: 'UFR Test', filiere: 'Informatique'
    });
    const exam = await Exam.create({
      title: 'New Exam', slug: 'new-exam', ufr: 'UFR Test', filiere: 'Informatique',
      niveau: 'L3', semestre: 'S6', typeExamen: 'Examen Final', matiere: 'Physique',
      author: { _id: testUser._id, firstName: testUser.firstName, lastName: testUser.lastName }, files: []
    });
    await Notification.create({
      recipient: otherUser._id, type: 'exam', title: 'Nouvel examen disponible',
      message: `Un nouvel examen "${exam.title}" est disponible dans votre filière Informatique.`,
      metadata: { examId: exam._id, slug: exam.slug, filiere: 'Informatique' }, read: false
    });
    const notifications = await Notification.find({ recipient: otherUser._id, title: 'Nouvel examen disponible' });
    expect(notifications.length).toBeGreaterThan(0);
  });

  test('Notification de commentaire sur examen', async () => {
    const exam = await Exam.create({
      title: 'Comment Exam', slug: 'comment-exam', ufr: 'UFR Test', filiere: 'Informatique',
      niveau: 'L3', semestre: 'S6', typeExamen: 'Examen Final', matiere: 'Chimie',
      author: { _id: testUser._id, firstName: testUser.firstName, lastName: testUser.lastName }, files: []
    });
    const commenter = await User.create({
      firstName: 'Commenter', lastName: 'User', email: 'commenter@univ-thies.sn', password: 'password123',
      role: 'user', status: 'active', ufr: 'UFR Test', filiere: 'Informatique'
    });
    await Notification.create({
      recipient: testUser._id, type: 'comment', title: 'Nouveau commentaire',
      message: `${commenter.firstName} ${commenter.lastName} a commenté sur votre examen "${exam.title}"`,
      metadata: { examId: exam._id, slug: exam.slug, commentId: exam._id }, read: false
    });
    const notifications = await Notification.find({ recipient: testUser._id, title: 'Nouveau commentaire' });
    expect(notifications.length).toBeGreaterThan(0);
  });
});
