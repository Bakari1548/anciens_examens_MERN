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

describe('Favorites System Tests', () => {
  let userToken, testUser, testExam;

  beforeEach(async () => {
    testUser = await User.create({
      firstName: 'User',
      lastName: 'Test',
      email: 'user@univ-thies.sn',
      password: 'password123',
      role: 'user',
      status: 'active',
      ufr: 'UFR Test',
      filiere: 'Informatique'
    });
    
    testExam = await Exam.create({
      title: 'Test Exam',
      slug: 'test-exam',
      ufr: 'UFR Test',
      filiere: 'Informatique',
      niveau: 'L3',
      semestre: 'S6',
      typeExamen: 'Examen Final',
      matiere: 'Math',
      author: { _id: testUser._id, firstName: testUser.firstName, lastName: testUser.lastName },
      files: [],
      status: 'approved'
    });
    
    userToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  });

  test('Devrait ajouter un examen aux favoris', async () => {
    const response = await request(app)
      .post(`/api/exams/${testExam.slug}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Examen ajouté aux favoris');

    const user = await User.findById(testUser._id);
    expect(user.favorites).toContainEqual(testExam._id);
  });

  test('Devrait créer une notification lors de l\'ajout aux favoris', async () => {
    const user = await User.findById(testUser._id);
    const initialNotificationCount = await Notification.countDocuments({ recipient: user._id });

    await request(app)
      .post(`/api/exams/${testExam.slug}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);

    const finalNotificationCount = await Notification.countDocuments({ recipient: user._id });
    expect(finalNotificationCount).toBeGreaterThan(initialNotificationCount);

    const notification = await Notification.findOne({ recipient: user._id, type: 'success' });
    expect(notification).not.toBeNull();
    expect(notification.title).toBe('Favori ajouté');
    expect(notification.message).toContain(testExam.title);
  });

  test('Ne devrait pas ajouter le même examen deux fois aux favoris', async () => {
    // Ajouter une première fois
    await request(app)
      .post(`/api/exams/${testExam.slug}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);

    const userAfterFirstAdd = await User.findById(testUser._id);
    const favoritesCountAfterFirstAdd = userAfterFirstAdd.favorites.length;

    // Essayer d'ajouter une deuxième fois
    const response = await request(app)
      .post(`/api/exams/${testExam.slug}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);

    const userAfterSecondAdd = await User.findById(testUser._id);
    const favoritesCountAfterSecondAdd = userAfterSecondAdd.favorites.length;

    expect(response.status).toBe(200);
    expect(favoritesCountAfterSecondAdd).toBe(favoritesCountAfterFirstAdd);
  });

  test('Devrait retirer un examen des favoris', async () => {
    // D'abord ajouter aux favoris
    await request(app)
      .post(`/api/exams/${testExam.slug}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);

    // Puis retirer
    const response = await request(app)
      .delete(`/api/exams/${testExam.slug}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Examen retiré des favoris');

    const user = await User.findById(testUser._id);
    expect(user.favorites).not.toContainEqual(testExam._id);
  });

  test('Devrait créer une notification lors du retrait des favoris', async () => {
    // D'abord ajouter aux favoris
    await request(app)
      .post(`/api/exams/${testExam.slug}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);

    const user = await User.findById(testUser._id);
    const initialNotificationCount = await Notification.countDocuments({ recipient: user._id });

    // Puis retirer
    await request(app)
      .delete(`/api/exams/${testExam.slug}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);

    const finalNotificationCount = await Notification.countDocuments({ recipient: user._id });
    expect(finalNotificationCount).toBeGreaterThan(initialNotificationCount);

    const notification = await Notification.findOne({ 
      recipient: user._id, 
      type: 'success',
      title: 'Favori retiré'
    });
    expect(notification).not.toBeNull();
    expect(notification.message).toContain(testExam.title);
  });

  test('Devrait retourner le statut de favori correct', async () => {
    // Test quand l'examen n'est pas dans les favoris
    let response = await request(app)
      .get(`/api/exams/${testExam.slug}/favorite/status`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.isFavorite).toBe(false);

    // Ajouter aux favoris
    await request(app)
      .post(`/api/exams/${testExam.slug}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);

    // Test quand l'examen est dans les favoris
    response = await request(app)
      .get(`/api/exams/${testExam.slug}/favorite/status`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.isFavorite).toBe(true);
  });

  test('Devrait retourner 404 si l\'examen n\'existe pas', async () => {
    const response = await request(app)
      .post('/api/exams/non-existent-exam/favorite')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Examen non trouvé');
  });

  test('Devrait retourner 401 si l\'utilisateur n\'est pas authentifié', async () => {
    const response = await request(app)
      .post(`/api/exams/${testExam.slug}/favorite`);

    expect(response.status).toBe(401);
  });

  test('Devrait récupérer la liste des favoris avec pagination', async () => {
    // Créer plusieurs examens et les ajouter aux favoris
    for (let i = 0; i < 3; i++) {
      const exam = await Exam.create({
        title: `Test Exam ${i}`,
        slug: `test-exam-${i}`,
        ufr: 'UFR Test',
        filiere: 'Informatique',
        niveau: 'L3',
        semestre: 'S6',
        typeExamen: 'Examen Final',
        matiere: 'Math',
        author: { _id: testUser._id, firstName: testUser.firstName, lastName: testUser.lastName },
        files: [],
        status: 'approved'
      });

      await User.findByIdAndUpdate(testUser._id, {
        $push: { favorites: exam._id }
      });
    }

    const response = await request(app)
      .get('/api/exams/favorites')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.exams).toBeDefined();
    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination.total).toBeGreaterThan(0);
  });

  test('Devrait gérer le cas où l\'utilisateur n\'a aucun favori', async () => {
    // Nettoyer les favoris
    await User.findByIdAndUpdate(testUser._id, { favorites: [] });

    const response = await request(app)
      .get('/api/exams/favorites')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.exams).toEqual([]);
    expect(response.body.pagination.total).toBe(0);
  });
});
