const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Mock des dépendances externes
jest.mock('../utils/sendEmail');

// Mock du middleware d'authentification
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

// Mock du middleware admin
jest.mock('../middlewares/admin.middleware', () => (req, res, next) => {
  next();
});

const app = require('../../app');

describe('User Controller Tests', () => {
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

    // Générer les tokens
    adminToken = jwt.sign({ userId: testAdmin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  });

  // Tests pour l'inscription d'un utilisateur
  describe('POST /api/users/register - register', () => {
    // Test de création d'un nouvel utilisateur
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const userData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Sciences',
        filiere: 'Informatique'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('Incription reussie !');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBe(userData.firstName);
    });

    // Test de validation des champs manquants
    it('devrait retourner 400 si des champs sont manquants', async () => {
      const userData = {
        firstName: 'Jean',
        email: 'jean@univ-thies.sn'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Tous les champs sont requis');
    });

    // Test de validation de l'email existant
    it('devrait retourner 400 si l\'email existe déjà', async () => {
      // D'abord créer un utilisateur
      await User.create({
        firstName: 'Existing',
        lastName: 'User',
        email: 'existing@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Test',
        filiere: 'Test'
      });

      const userData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'existing@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Sciences',
        filiere: 'Informatique'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Cet email est déjà utilisé');
    });

    // Test de hashage du mot de passe
    it('devrait hasher le mot de passe', async () => {
      const userData = {
        firstName: 'Pierre',
        lastName: 'Martin',
        email: 'pierre.martin@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Test',
        filiere: 'Test'
      };

      await request(app)
        .post('/api/users/register')
        .send(userData);

      const user = await User.findOne({ email: userData.email });
      expect(user.password).not.toBe(userData.password);
      const isMatch = await bcrypt.compare(userData.password, user.password);
      expect(isMatch).toBe(true);
    });
  });

  describe('POST /api/users/login - login', () => {
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'Marie',
        lastName: 'Curie',
        email: 'marie.curie@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Sciences',
        filiere: 'Physique',
        role: 'user',
        status: 'active'
      });
    });

    // Test de connexion d'un utilisateur
    it('devrait connecter un utilisateur avec succès', async () => {
      const loginData = {
        email: 'marie.curie@univ-thies.sn',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Utilisateur connectee avec succès !');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
    });

    // Test de validation des champs manquants
    it('devrait retourner 400 si des champs sont manquants', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'test@univ-thies.sn' })
        .expect(400);

      expect(response.body.message).toBe('Tous les champs sont requis');
    });

    // Test de validation de l'email incorrect
    it('devrait retourner 401 si l\'email est incorrect', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'wrong@univ-thies.sn',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.message).toBe('Email incorrect');
    });

    // Test de validation du mot de passe incorrect
    it('devrait retourner 401 si le mot de passe est incorrect', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'marie.curie@univ-thies.sn',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.message).toBe('mot de passe incorrect');
    });
  });

  describe('GET /api/users/profile - getProfile', () => {
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'Albert',
        lastName: 'Einstein',
        email: 'albert.einstein@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Sciences',
        filiere: 'Physique',
        role: 'user',
        status: 'active'
      });

      userToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    });

    // Test de récupération du profil de l'utilisateur connecté
    it('devrait récupérer le profil de l\'utilisateur connecté', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).toBe('Profil de l\'utilisateur');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
    });

    // Test de validation sans token
    it('devrait retourner 401 sans token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);
    });
  });

  describe('PUT /api/users/change-password - changePassword', () => {
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'Isaac',
        lastName: 'Newton',
        email: 'isaac.newton@univ-thies.sn',
        password: 'oldpassword123',
        ufr: 'UFR Sciences',
        filiere: 'Physique',
        role: 'user',
        status: 'active'
      });

      userToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    });

    // Test de changement de mot de passe
    it('devrait changer le mot de passe avec succès', async () => {
      const passwordData = {
        oldPassword: 'oldpassword123',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.message).toBe('Mot de passe modifié avec succès');

      // Vérifier que le mot de passe a été changé
      const user = await User.findById(testUser._id);
      const isMatch = await bcrypt.compare(passwordData.newPassword, user.password);
      expect(isMatch).toBe(true);
    });

    // Test de validation de l'ancien mot de passe incorrect
    it('devrait retourner 401 si l\'ancien mot de passe est incorrect', async () => {
      const passwordData = {
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData)
        .expect(401);

      expect(response.body.message).toBe('Mot de passe incorrect');
    });

    // Test de validation sans token
    it('devrait retourner 401 sans token', async () => {
      const response = await request(app)
        .put('/api/users/change-password')
        .send({
          oldPassword: 'oldpassword123',
          newPassword: 'newpassword123'
        })
        .expect(401);
    });
  });

  describe('POST /api/users/forgot-password - forgotPassword', () => {
    it('devrait retourner 401 si l\'email n\'existe pas', async () => {
      const response = await request(app)
        .post('/api/users/forgot-password')
        .send({ email: 'wrong@univ-thies.sn' })
        .expect(401);

      expect(response.body.message).toBe('Email incorrect');
    });
  });

  describe('POST /api/users/reset-password/:token - resetPassword', () => {
    // Test de réinitialisation du mot de passe
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'Galileo',
        lastName: 'Galilei',
        email: 'galileo.galilei@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Sciences',
        filiere: 'Astronomie',
        role: 'user',
        status: 'active',
        passwordResetToken: jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET),
        passwordResetExpires: Date.now() + 3600000
      });
    });

    // Test de réinitialisation du mot de passe
    it('devrait réinitialiser le mot de passe avec succès', async () => {
      const response = await request(app)
        .post(`/api/users/reset-password/${testUser.passwordResetToken}`)
        .send({ password: 'newpassword123' })
        .expect(200);

      expect(response.body.message).toBe('Mot de passe réinitialisé');

      // Vérifier que le mot de passe a été changé
      const user = await User.findById(testUser._id);
      const isMatch = await bcrypt.compare('newpassword123', user.password);
      expect(isMatch).toBe(true);
    });

    // Test de validation du token invalide
    it('devrait retourner 401 si le token est invalide', async () => {
      const response = await request(app)
        .post('/api/users/reset-password/invalidtoken')
        .send({ password: 'newpassword123' })
        .expect(401);

      expect(response.body.message).toBe('Token incorrect');
    });
  });

  describe('GET /api/users/all/:page/:limit - getAllUsers', () => {
    // Test de récupération de tous les utilisateurs
    beforeEach(async () => {
      await User.create([
        {
          firstName: 'User1',
          lastName: 'Test',
          email: 'user1@univ-thies.sn',
          password: 'password123',
          ufr: 'UFR Test',
          filiere: 'Test',
          role: 'user',
          status: 'active'
        },
        {
          firstName: 'User2',
          lastName: 'Test',
          email: 'user2@univ-thies.sn',
          password: 'password123',
          ufr: 'UFR Test',
          filiere: 'Test',
          role: 'user',
          status: 'inactive'
        },
        {
          firstName: 'Admin2',
          lastName: 'Test',
          email: 'admin2@univ-thies.sn',
          password: 'password123',
          ufr: 'UFR Admin',
          filiere: 'Admin',
          role: 'admin',
          status: 'active'
        }
      ]);
    });

    // Test de récupération de tous les utilisateurs avec pagination
    it('devrait récupérer tous les utilisateurs avec pagination', async () => {
      const response = await request(app)
        .get('/api/users/all/1/10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toBeDefined();
      expect(response.body.total).toBeDefined();
      expect(response.body.totalPages).toBeDefined();
      expect(response.body.currentPage).toBe(1);
      expect(response.body.limit).toBe(10);
    });

    // Test de filtrage par rôle
    it('devrait filtrer par rôle', async () => {
      const response = await request(app)
        .get('/api/users/all/1/10?role=user')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toBeDefined();
      expect(response.body.users.every(user => user.role === 'user')).toBe(true);
    });

    // Test de filtrage par statut
    it('devrait filtrer par statut', async () => {
      const response = await request(app)
        .get('/api/users/all/1/10?status=active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toBeDefined();
      expect(response.body.users.every(user => user.status === 'active')).toBe(true);
    });

    // Test de recherche par texte
    it('devrait rechercher par texte', async () => {
      const response = await request(app)
        .get('/api/users/all/1/10?search=User1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toBeDefined();
      expect(response.body.users.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/users/update/:id - updateUser', () => {
    // Test de mise à jour d'un utilisateur
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'User',
        lastName: 'ToUpdate',
        email: 'user.update@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Test',
        filiere: 'Test',
        role: 'user',
        status: 'active'
      });
    });

    // Test de mise à jour d'un utilisateur
    it('devrait mettre à jour un utilisateur', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated@univ-thies.sn',
        role: 'admin',
        status: 'active'
      };

      const response = await request(app)
        .put(`/api/users/update/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Utilisateur mis à jour');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.firstName).toBe(updateData.firstName);
    });
  });

  describe('DELETE /api/users/delete/:id - deleteUser', () => {
    // Test de suppression d'un utilisateur
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'User',
        lastName: 'ToDelete',
        email: 'user.delete@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Test',
        filiere: 'Test',
        role: 'user',
        status: 'active'
      });
    });

    // Test de suppression d'un utilisateur
    it('devrait supprimer un utilisateur', async () => {
      const response = await request(app)
        .delete(`/api/users/delete/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Utilisateur supprimé');

      // Vérifier que l'utilisateur est supprimé
      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser).toBeNull();
    });
  });

  describe('GET /api/users/get/:id - getUserById', () => {
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'User',
        lastName: 'ById',
        email: 'user.byid@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Test',
        filiere: 'Test',
        role: 'user',
        status: 'active'
      });
    });

    // Test de récupération d'un utilisateur par ID
    it('devrait récupérer un utilisateur par ID', async () => {
      const response = await request(app)
        .get(`/api/users/get/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Utilisateur recuperé');
      expect(response.body.user).toBeDefined();
      expect(response.body.user._id).toBe(testUser._id.toString());
    });
  });

  describe('PUT /api/users/activate/:id - activateUser', () => {
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'User',
        lastName: 'ToActivate',
        email: 'user.activate@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Test',
        filiere: 'Test',
        role: 'user',
        status: 'inactive'
      });
    });

    // Test d'activation d'un utilisateur
    it('devrait activer un utilisateur', async () => {
      const response = await request(app)
        .put(`/api/users/activate/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Utilisateur activé');

      // Vérifier que le statut a été changé
      const user = await User.findById(testUser._id);
      expect(user.status).toBe('active');
    });
  });

  describe('PUT /api/users/desactivate/:id - desactivateUser', () => {
    // 
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'User',
        lastName: 'ToDesactivate',
        email: 'user.desactivate@univ-thies.sn',
        password: 'password123',
        ufr: 'UFR Test',
        filiere: 'Test',
        role: 'user',
        status: 'active'
      });
    });

    // Test de désactivation d'un utilisateur
    it('devrait désactiver un utilisateur', async () => {
      const response = await request(app)
        .put(`/api/users/desactivate/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Utilisateur désactivé');

      // Vérifier que le statut a été changé
      const user = await User.findById(testUser._id);
      expect(user.status).toBe('inactive');
    });
  });

});
