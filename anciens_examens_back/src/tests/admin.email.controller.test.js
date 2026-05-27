const request = require('supertest');
const app = require('../../app');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
require('dotenv').config();

// Mock des middlewares d'authentification
jest.mock('../middlewares/auth.middleware', () => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token d\'accès requis' });
    }
    
    req.user = {
      _id: '69f4d518d02b482f34524afd',
      email: 'admin@univ-thies.sn',
      role: 'admin',
      status: 'active'
    };
    next();
  };
});

jest.mock('../middlewares/admin.middleware', () => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token d\'accès requis' });
    }
    
    req.user = {
      _id: '69f4d518d02b482f34524afd',
      email: 'admin@univ-thies.sn',
      role: 'admin',
      status: 'active'
    };
    next();
  };
});

describe('Admin Email Controller', () => {
  let adminToken;

  beforeAll(async () => {
    // Générer un token admin pour les tests
    adminToken = jwt.sign(
      { userId: '69f4d518d02b482f34524afd' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/admin/emails/test-webhook', () => {
    it('devrait simuler un webhook avec succès', async () => {
      // Note: Ce test nécessite un token admin valide
      // Vous devrez adapter selon votre système d'authentification
      
      const response = await request(app)
        .post('/api/admin/emails/test-webhook')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Email reçu et stocké');
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .post('/api/admin/emails/test-webhook')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/admin/emails/webhook', () => {
    it('devrait recevoir un webhook Resend sans authentification', async () => {
      const webhookData = {
        from: 'test@example.com',
        to: 'onboarding@anciensexamensuidt.app',
        subject: 'Test webhook',
        text: 'Test message',
        html: '<p>Test message</p>'
      };

      const response = await request(app)
        .post('/api/admin/emails/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.message).toBe('Email reçu et stocké');
    });

    it('devrait gérer différents formats de données Resend', async () => {
      const webhookData = {
        email: {
          from: 'sender@example.com',
          to: 'onboarding@anciensexamensuidt.app',
          subject: 'Email via email object',
          text: 'Content via email object'
        }
      };

      const response = await request(app)
        .post('/api/admin/emails/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.message).toBe('Email reçu et stocké');
    });

    it('devrait gérer les données manquantes avec des valeurs par défaut', async () => {
      const webhookData = {};

      const response = await request(app)
        .post('/api/admin/emails/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.message).toBe('Email reçu et stocké');
    });
  });

  describe('GET /api/admin/emails/received', () => {
    it('devrait retourner les emails reçus avec authentification', async () => {
      const response = await request(app)
        .get('/api/admin/emails/received')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('emails');
      expect(Array.isArray(response.body.emails)).toBe(true);
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .get('/api/admin/emails/received')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/admin/emails/history', () => {
    it('devrait retourner l\'historique des emails envoyés', async () => {
      const response = await request(app)
        .get('/api/admin/emails/history?page=1&limit=20')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('emails');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('receivedEmails');
      expect(Array.isArray(response.body.emails)).toBe(true);
      expect(Array.isArray(response.body.receivedEmails)).toBe(true);
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .get('/api/admin/emails/history')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('devrait gérer les paramètres de pagination par défaut', async () => {
      const response = await request(app)
        .get('/api/admin/emails/history')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(20);
    });
  });
});
