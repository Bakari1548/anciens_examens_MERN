const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const Exam = require('../models/Exam');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Mock des dépendances externes
jest.mock('../utils/sendEmail');
jest.mock('../utils/logger', () => ({
  createLog: jest.fn().mockResolvedValue(undefined)
}));

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

// Mock de Cloudinary
jest.mock('../config/cloudinary', () => ({
  cloudinary: {
    api: {
      usage: jest.fn()
    },
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn()
    }
  }
}));

const app = require('../../app');
const { cloudinary } = require('../config/cloudinary');

describe('Admin Controller Tests - Storage Stats', () => {
  const createAdminAndToken = async () => {
    const testAdmin = await User.create({
      firstName: 'Admin',
      lastName: 'Test',
      email: 'admin@univ-thies.sn',
      password: 'admin123',
      ufr: 'UFR Admin',
      filiere: 'Administration',
      role: 'admin',
      status: 'active'
    });
    const adminToken = jwt.sign({ userId: testAdmin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { testAdmin, adminToken };
  };

  const createTestExam = async (testAdmin) => {
    return await Exam.create({
      title: 'Examen Test',
      slug: 'examen-test',
      description: 'Description test',
      ufr: 'UFR Sciences',
      filiere: 'Informatique',
      niveau: 'L1',
      semestre: 'S1',
      typeExamen: 'Examen Final',
      matiere: 'Algorithmique',
      anneeExamen: '2024',
      author: {
        _id: testAdmin._id,
        firstName: testAdmin.firstName,
        lastName: testAdmin.lastName
      },
      status: 'approved',
      files: [
        {
          publicId: 'test/file1',
          url: 'https://example.com/file1.pdf',
          originalName: 'file1.pdf',
          size: 1024 * 1024, // 1 MB
          mimeType: 'application/pdf'
        },
        {
          publicId: 'test/file2',
          url: 'https://example.com/file2.pdf',
          originalName: 'file2.pdf',
          size: 2 * 1024 * 1024, // 2 MB
          mimeType: 'application/pdf'
        }
      ],
      downloadsCount: 10,
      viewsCount: 20
    });
  };

  describe('GET /api/admin/stats - getStats', () => {
    it('devrait retourner les statistiques avec storage database et cloudinary', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();
      await createTestExam(testAdmin);
      
      // Mock Cloudinary API success
      cloudinary.api.usage.mockResolvedValue({
        storage: {
          usage: 50 * 1024 * 1024, // 50 MB
          limit: 25 * 1024 * 1024 * 1024 // 25 GB
        }
      });

      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalExams');
      expect(response.body).toHaveProperty('totalDownloads');
      expect(response.body).toHaveProperty('totalViews');
      expect(response.body).toHaveProperty('storage');
      expect(response.body.storage).toHaveProperty('database');
      expect(response.body.storage).toHaveProperty('cloudinary');
      expect(response.body.storage.database).toHaveProperty('usedBytes');
      expect(response.body.storage.database).toHaveProperty('totalBytes');
      expect(response.body.storage.cloudinary).toHaveProperty('usedBytes');
      expect(response.body.storage.cloudinary).toHaveProperty('totalBytes');
    });

    it('devrait utiliser le fallback DB aggregation si Cloudinary API échoue', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();
      await createTestExam(testAdmin);
      
      // Mock Cloudinary API failure
      cloudinary.api.usage.mockRejectedValue(new Error('Cloudinary API error'));

      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.storage.cloudinary.usedBytes).toBeGreaterThan(0);
      expect(response.body.storage.cloudinary.usedBytes).toBe(3 * 1024 * 1024); // 3 MB (1 + 2)
      expect(response.body.storage.cloudinary.totalBytes).toBe(25 * 1024 * 1024 * 1024); // 25 GB default
    });

    it('devrait utiliser la limite DB_STORAGE_LIMIT_MB configurée', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();
      await createTestExam(testAdmin);
      
      process.env.DB_STORAGE_LIMIT_MB = '1024';
      
      cloudinary.api.usage.mockResolvedValue({
        storage: {
          usage: 50 * 1024 * 1024,
          limit: 25 * 1024 * 1024 * 1024
        }
      });

      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.storage.database.totalBytes).toBe(1024 * 1024 * 1024); // 1 GB
      
      // Reset env
      delete process.env.DB_STORAGE_LIMIT_MB;
    });

    it('devrait utiliser la limite CLOUDINARY_STORAGE_LIMIT_GB configurée', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();
      await createTestExam(testAdmin);
      
      process.env.CLOUDINARY_STORAGE_LIMIT_GB = '50';
      
      // Mock Cloudinary API failure to trigger fallback
      cloudinary.api.usage.mockRejectedValue(new Error('Cloudinary API error'));

      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.storage.cloudinary.totalBytes).toBe(50 * 1024 * 1024 * 1024); // 50 GB
      
      // Reset env
      delete process.env.CLOUDINARY_STORAGE_LIMIT_GB;
    });

    it('devrait retourner 0 si aucune donnée de stockage disponible', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();
      // Ne pas créer d'examen

      // Mock Cloudinary API failure
      cloudinary.api.usage.mockRejectedValue(new Error('Cloudinary API error'));

      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.storage.cloudinary.usedBytes).toBe(0);
    });

    it('devrait calculer correctement les vues et téléchargements', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();
      await createTestExam(testAdmin);
      
      cloudinary.api.usage.mockResolvedValue({
        storage: {
          usage: 50 * 1024 * 1024,
          limit: 25 * 1024 * 1024 * 1024
        }
      });

      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.totalViews).toBe(20);
      expect(response.body.totalDownloads).toBe(10);
    });

    it('devrait retourner approvedExams dans les statistiques', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();
      await createTestExam(testAdmin);

      cloudinary.api.usage.mockResolvedValue({
        storage: { usage: 0, limit: 25 * 1024 * 1024 * 1024 }
      });

      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('approvedExams');
      expect(response.body.approvedExams).toBe(1);
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .expect(401);

      expect(response.body.message).toBe('Token manquant');
    });
  });

  describe('GET /api/admin/analytics - getAnalytics', () => {
    it('devrait retourner la structure complète pour la période 7d', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();
      await createTestExam(testAdmin);

      const response = await request(app)
        .get('/api/admin/analytics?period=7d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('userGrowth');
      expect(response.body).toHaveProperty('examStats');
      expect(response.body).toHaveProperty('ufrStats');
      expect(response.body).toHaveProperty('topExams');
      expect(response.body).toHaveProperty('period', '7d');
      expect(Array.isArray(response.body.userGrowth)).toBe(true);
      expect(Array.isArray(response.body.examStats)).toBe(true);
    });

    it('devrait retourner les données userGrowth avec la bonne structure', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();

      const response = await request(app)
        .get('/api/admin/analytics?period=7d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.userGrowth.length > 0) {
        const entry = response.body.userGrowth[0];
        expect(entry).toHaveProperty('date');
        expect(entry).toHaveProperty('newUsers');
        expect(typeof entry.newUsers).toBe('number');
      }
    });

    it('devrait retourner examStats avec le champ downloads (nouveau)', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();
      await createTestExam(testAdmin);

      const response = await request(app)
        .get('/api/admin/analytics?period=7d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.examStats.length).toBeGreaterThan(0);
      const entry = response.body.examStats[0];
      expect(entry).toHaveProperty('date');
      expect(entry).toHaveProperty('newExams');
      expect(entry).toHaveProperty('approvedExams');
      expect(entry).toHaveProperty('downloads');
      expect(entry.downloads).toBe(10);
    });

    it('devrait grouper par jour (format YYYY-MM-DD) pour les périodes 7d et 30d', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();
      await createTestExam(testAdmin);

      for (const period of ['7d', '30d']) {
        const response = await request(app)
          .get(`/api/admin/analytics?period=${period}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        if (response.body.examStats.length > 0) {
          expect(response.body.examStats[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
        if (response.body.userGrowth.length > 0) {
          expect(response.body.userGrowth[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      }
    });

    it('devrait grouper par mois (format YYYY-MM) pour les périodes 90d et 1y', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();
      await createTestExam(testAdmin);

      for (const period of ['90d', '1y']) {
        const response = await request(app)
          .get(`/api/admin/analytics?period=${period}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        if (response.body.examStats.length > 0) {
          expect(response.body.examStats[0].date).toMatch(/^\d{4}-\d{2}$/);
        }
        if (response.body.userGrowth.length > 0) {
          expect(response.body.userGrowth[0].date).toMatch(/^\d{4}-\d{2}$/);
        }
      }
    });

    it('devrait gérer la période 90d sans erreur (était manquante)', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();

      const response = await request(app)
        .get('/api/admin/analytics?period=90d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.period).toBe('90d');
    });

    it('devrait gérer la période 1y sans erreur (était manquante)', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();

      const response = await request(app)
        .get('/api/admin/analytics?period=1y')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.period).toBe('1y');
    });

    it('devrait gérer la période all sans erreur', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();
      await createTestExam(testAdmin);

      const response = await request(app)
        .get('/api/admin/analytics?period=all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.period).toBe('all');
      expect(response.body.examStats.length).toBeGreaterThan(0);
    });

    it('devrait retourner des tableaux vides si aucune donnée dans la période', async () => {
      const { adminToken } = await createAdminAndToken();

      const response = await request(app)
        .get('/api/admin/analytics?period=1d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body.userGrowth)).toBe(true);
      expect(Array.isArray(response.body.examStats)).toBe(true);
    });

    it('devrait retourner ufrStats avec la bonne structure', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();
      await createTestExam(testAdmin);

      const response = await request(app)
        .get('/api/admin/analytics?period=7d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.ufrStats.length > 0) {
        const stat = response.body.ufrStats[0];
        expect(stat).toHaveProperty('ufr');
        expect(stat).toHaveProperty('users');
        expect(stat).toHaveProperty('exams');
        expect(stat).toHaveProperty('downloads');
      }
    });

    it('devrait retourner topExams triés par viewsCount décroissant', async () => {
      const { testAdmin, adminToken } = await createAdminAndToken();
      await createTestExam(testAdmin);

      const response = await request(app)
        .get('/api/admin/analytics?period=7d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.topExams.length).toBeGreaterThan(0);
      const exam = response.body.topExams[0];
      expect(exam).toHaveProperty('title');
      expect(exam).toHaveProperty('ufr');
      expect(exam).toHaveProperty('viewsCount');
      expect(exam).toHaveProperty('downloadsCount');

      if (response.body.topExams.length > 1) {
        expect(response.body.topExams[0].viewsCount)
          .toBeGreaterThanOrEqual(response.body.topExams[1].viewsCount);
      }
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .expect(401);

      expect(response.body.message).toBe('Token manquant');
    });
  });
});
