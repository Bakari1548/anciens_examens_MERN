const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Log = require('../models/Log');
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

const app = require('../../app');
const { createLog } = require('../utils/logger');

describe('Logs Tests', () => {
  let adminToken;
  let testAdmin;

  beforeEach(async () => {
    testAdmin = await User.create({
      firstName: 'Admin',
      lastName: 'Logs',
      email: 'admin.logs@univ-thies.sn',
      password: 'admin12345',
      ufr: 'UFR Admin',
      filiere: 'Administration',
      role: 'admin',
      status: 'active'
    });

    adminToken = jwt.sign({ userId: testAdmin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  });

  describe('Logger utility - createLog()', () => {
    it('devrait créer un log avec les informations minimales', async () => {
      await createLog({
        level: 'info',
        action: 'TEST_ACTION',
        message: 'Test de création de log'
      });

      const logs = await Log.find({ action: 'TEST_ACTION' });
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toBe('Test de création de log');
      expect(logs[0].user).toBe('System');
    });

    it('devrait extraire le nom et l\'ID de l\'utilisateur depuis l\'objet user', async () => {
      await createLog({
        level: 'info',
        action: 'TEST_USER',
        message: 'Test avec utilisateur',
        user: testAdmin
      });

      const log = await Log.findOne({ action: 'TEST_USER' });
      expect(log.user).toBe(`${testAdmin.firstName} ${testAdmin.lastName}`);
      expect(log.userId.toString()).toBe(testAdmin._id.toString());
    });

    it('devrait extraire l\'IP et le user-agent depuis req', async () => {
      const fakeReq = {
        headers: {
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Mozilla/5.0 Test'
        }
      };

      await createLog({
        level: 'warning',
        action: 'TEST_REQ',
        message: 'Test avec requête',
        req: fakeReq
      });

      const log = await Log.findOne({ action: 'TEST_REQ' });
      expect(log.ip).toBe('192.168.1.100');
      expect(log.userAgent).toBe('Mozilla/5.0 Test');
    });

    it('devrait stocker les metadata', async () => {
      await createLog({
        level: 'error',
        action: 'TEST_META',
        message: 'Test metadata',
        metadata: { examId: '123', count: 5 }
      });

      const log = await Log.findOne({ action: 'TEST_META' });
      expect(log.metadata.examId).toBe('123');
      expect(log.metadata.count).toBe(5);
    });

    it('ne devrait pas faire crasher l\'application en cas d\'erreur', async () => {
      // Appel sans action (champ requis) - doit échouer silencieusement
      await expect(
        createLog({ level: 'info', message: 'Pas d\'action' })
      ).resolves.not.toThrow();
    });
  });

  describe('GET /api/logs', () => {
    beforeEach(async () => {
      // Créer quelques logs de test
      await Log.create([
        { level: 'info', action: 'LOGIN', message: 'Connexion test', user: 'John Doe' },
        { level: 'warning', action: 'FAILED_LOGIN', message: 'Échec connexion', user: 'Unknown' },
        { level: 'error', action: 'SYSTEM_ERROR', message: 'Erreur système', user: 'System' }
      ]);
    });

    it('devrait récupérer tous les logs avec pagination', async () => {
      const res = await request(app)
        .get('/api/logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs).toBeDefined();
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(3);
    });

    it('devrait filtrer les logs par niveau', async () => {
      const res = await request(app)
        .get('/api/logs?level=error')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs.every(l => l.level === 'error')).toBe(true);
    });

    it('devrait filtrer les logs par action', async () => {
      const res = await request(app)
        .get('/api/logs?action=LOGIN')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs.every(l => l.action === 'LOGIN')).toBe(true);
    });

    it('devrait rechercher dans les messages', async () => {
      const res = await request(app)
        .get('/api/logs?search=Échec')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs.length).toBeGreaterThan(0);
    });

    it('devrait refuser l\'accès sans authentification', async () => {
      const res = await request(app).get('/api/logs');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/logs/stats', () => {
    beforeEach(async () => {
      await Log.create([
        { level: 'info', action: 'A', message: 'msg1' },
        { level: 'info', action: 'B', message: 'msg2' },
        { level: 'warning', action: 'C', message: 'msg3' },
        { level: 'error', action: 'D', message: 'msg4' }
      ]);
    });

    it('devrait retourner les statistiques des logs', async () => {
      const res = await request(app)
        .get('/api/logs/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.total).toBeGreaterThanOrEqual(4);
      expect(res.body.stats.info).toBeGreaterThanOrEqual(2);
      expect(res.body.stats.warning).toBeGreaterThanOrEqual(1);
      expect(res.body.stats.error).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/logs/export', () => {
    it('devrait exporter les logs en CSV', async () => {
      await Log.create({ level: 'info', action: 'EXPORT_TEST', message: 'Test export' });

      const res = await request(app)
        .get('/api/logs/export')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Timestamp,Level,Action');
      expect(res.text).toContain('EXPORT_TEST');
    });
  });

  describe('DELETE /api/logs/cleanup', () => {
    it('devrait supprimer les logs plus anciens que N jours', async () => {
      // Créer un log ancien (60 jours)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 60);
      await Log.create({
        level: 'info',
        action: 'OLD_LOG',
        message: 'Vieux log',
        timestamp: oldDate
      });

      // Créer un log récent
      await Log.create({
        level: 'info',
        action: 'NEW_LOG',
        message: 'Nouveau log'
      });

      const res = await request(app)
        .delete('/api/logs/cleanup?days=30')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.deleted).toBeGreaterThanOrEqual(1);

      // Vérifier que le log récent est toujours là
      const newLog = await Log.findOne({ action: 'NEW_LOG' });
      expect(newLog).not.toBeNull();
    });
  });

  describe('Intégration logs avec actions utilisateur', () => {
    it('devrait créer un log lors d\'une inscription réussie', async () => {
      await request(app)
        .post('/api/users/register')
        .send({
          firstName: 'Log',
          lastName: 'Test',
          email: 'log.test@univ-thies.sn',
          password: 'password123',
          ufr: 'UFR Sciences',
          filiere: 'Informatique'
        });

      const log = await Log.findOne({ action: 'REGISTER' });
      expect(log).not.toBeNull();
      expect(log.level).toBe('info');
    });

    it('devrait créer un log lors d\'une tentative de connexion échouée', async () => {
      await request(app)
        .post('/api/users/login')
        .send({
          email: 'inexistant@univ-thies.sn',
          password: 'wrong'
        });

      const log = await Log.findOne({ action: 'FAILED_LOGIN' });
      expect(log).not.toBeNull();
      expect(log.level).toBe('warning');
    });
  });
});
