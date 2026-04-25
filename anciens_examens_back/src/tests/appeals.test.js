const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Mock des dépendances externes
jest.mock('../utils/sendEmail');

// Mock du middleware d'authentification
let testAdminForMock;
jest.mock('../middlewares/auth.middleware', () => {
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = user;
          next();
        } else {
          res.status(401).json({ message: 'Utilisateur non trouvé' });
        }
      } catch (error) {
        res.status(401).json({ message: 'Token invalide' });
      }
    } else {
      res.status(401).json({ message: 'Token manquant' });
    }
  };
});

// Mock du middleware admin - utiliser une variable globale pour stocker l'admin
global.mockAdmin = null;
jest.mock('../middlewares/admin.middleware', () => (req, res, next) => {
  if (global.mockAdmin || (req.user && req.user.role === 'admin')) {
    if (global.mockAdmin && !req.user) {
      req.user = global.mockAdmin;
    }
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé. Rôle admin requis.' });
  }
});

const app = require('../../app');

describe('Appeal Controller Tests', () => {
  let userToken;
  let adminToken;
  let testUser;
  let testAdmin;

  beforeAll(async () => {
    // Créer un admin de test
    testAdmin = await User.create({
      firstName: 'Admin',
      lastName: 'Test',
      email: 'admin@univ-thies.sn',
      password: 'admin123',
      ufr: 'UFR Admin',
      filiere: 'Administration',
      role: 'admin',
      status: 'active'
    });

    // Définir l'admin mocké pour le middleware
    global.mockAdmin = testAdmin;

    // Générer les tokens
    adminToken = jwt.sign({ userId: testAdmin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  });

  describe('POST /api/users/appeal - submitAppeal', () => {
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'User',
        lastName: 'Test',
        email: 'user@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Test',
        filiere: 'Test',
        role: 'user',
        status: 'inactive'
      });

      userToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    });

    // Test de validation du message manquant
    it('devrait retourner 400 si le message est manquant', async () => {
      const response = await request(app)
        .post('/api/users/appeal')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Le message de la demande est requis');
    });

    // Test de validation pour un compte actif
    it('devrait retourner 400 si le compte est actif', async () => {
      await User.findByIdAndUpdate(testUser._id, { status: 'active' });

      const appealData = {
        message: 'Je demande la réactivation de mon compte.'
      };

      const response = await request(app)
        .post('/api/users/appeal')
        .set('Authorization', `Bearer ${userToken}`)
        .send(appealData)
        .expect(400);

      expect(response.body.message).toBe('Votre compte est actif, vous ne pouvez pas soumettre de demande');
    });

    // Test de validation sans token
    it('devrait retourner 401 sans token', async () => {
      const response = await request(app)
        .post('/api/users/appeal')
        .send({ message: 'Test message' })
        .expect(401);
    });
  });

  describe('GET /api/users/appeals - getAllAppeals', () => {
    beforeEach(async () => {
      // Créer des utilisateurs avec des demandes
      await User.create([
        {
          firstName: 'User1',
          lastName: 'Test',
          email: 'user1@univ-thies.sn',
          password: 'password123',
          ufr: 'UFR Test',
          filiere: 'Test',
          role: 'user',
          status: 'inactive',
          appeal: {
            message: 'Demande de User1',
            status: 'pending',
            submittedAt: new Date()
          }
        },
        {
          firstName: 'User2',
          lastName: 'Test',
          email: 'user2@univ-thies.sn',
          password: 'password123',
          ufr: 'UFR Test',
          filiere: 'Test',
          role: 'user',
          status: 'banned',
          appeal: {
            message: 'Demande de User2',
            status: 'approved',
            submittedAt: new Date(),
            reviewedAt: new Date(),
            reviewedBy: testAdmin._id,
            reviewMessage: 'Compte réactivé'
          }
        },
        {
          firstName: 'User3',
          lastName: 'Test',
          email: 'user3@univ-thies.sn',
          password: 'password123',
          ufr: 'UFR Test',
          filiere: 'Test',
          role: 'user',
          status: 'active'
        }
      ]);
    });

    // Test de récupération de toutes les demandes
    it('devrait récupérer toutes les demandes', async () => {
      const response = await request(app)
        .get('/api/users/appeals')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Demandes récupérées avec succès');
      expect(response.body.appeals).toBeDefined();
      expect(response.body.appeals.length).toBe(2);
      expect(response.body.appeals.every(user => user.appeal !== undefined)).toBe(true);
    });

  });

  describe('PUT /api/users/appeals/:id/approve - approveAppeal', () => {
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'User',
        lastName: 'ToApprove',
        email: 'user.approve@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Test',
        filiere: 'Test',
        role: 'user',
        status: 'inactive',
        appeal: {
          message: 'Je demande la réactivation de mon compte.',
          status: 'pending',
          submittedAt: new Date()
        }
      });
    });

    // Test d'approbation d'une demande
    it('devrait approuver une demande et réactiver le compte', async () => {
      const response = await request(app)
        .put(`/api/users/appeals/${testUser._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reviewMessage: 'Test' });
      
      console.log('Response body:', response.body);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Demande approuvée et compte réactivé');
    });

    it('devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/users/appeals/${fakeId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reviewMessage: 'Test' })
        .expect(404);

      expect(response.body.message).toBe('Utilisateur non trouvé');
    });
  });


  describe('PUT /api/users/appeals/:id/reject - rejectAppeal', () => {
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'User',
        lastName: 'ToReject',
        email: 'user.reject@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Test',
        filiere: 'Test',
        role: 'user',
        status: 'inactive',
        appeal: {
          message: 'Je demande la réactivation de mon compte.',
          status: 'pending',
          submittedAt: new Date()
        }
      });
    });

    // Test de rejet d'une demande
    it('devrait rejeter une demande', async () => {
      const response = await request(app)
        .put(`/api/users/appeals/${testUser._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reviewMessage: 'Test' })
        .expect(200);

      expect(response.body.message).toBe('Demande rejetée');
    });

    it('devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/users/appeals/${fakeId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reviewMessage: 'Test' })
        .expect(404);

      expect(response.body.message).toBe('Utilisateur non trouvé');
    });
  });


  afterAll(async () => {
    // Nettoyer les données de test
    await User.deleteMany({});
    await mongoose.connection.close();
  });
});
