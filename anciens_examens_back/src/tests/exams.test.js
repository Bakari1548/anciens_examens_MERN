const request = require('supertest');
const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Mock des dépendances externes
jest.mock('../utils/sendEmail');

// Mock du middleware upload
jest.mock('../config/cloudinary', () => ({
  cloudinary: {
    uploader: {
      upload: jest.fn().mockResolvedValue({
        path: 'http://cloudinary.com/test.pdf',
        public_id: 'exams/test-exam',
        size: 1024,
        mimetype: 'application/pdf',
        originalname: 'test.pdf'
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    }
  },
  upload: {
    single: jest.fn(() => (req, res, next) => {
      req.file = {
        path: 'http://cloudinary.com/test.pdf',
        public_id: 'exams/test-exam',
        size: 1024,
        mimetype: 'application/pdf',
        originalname: 'test.pdf'
      };
      next();
    })
  }
}));

// Mock du middleware d'authentification
jest.mock('../middlewares/auth.middleware', () => {
  const jwt = require('jsonwebtoken');
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { _id: decoded.userId };
        next();
      } catch (error) {
        res.status(401).json({ message: 'Token invalide' });
      }
    } else {
      res.status(401).json({ message: 'Token manquant' });
    }
  };
});

const app = require('../../app');

describe('Exam Controller Tests', () => {
  let userToken;
  let adminToken;
  let testUser;
  let testAdmin;
  let testExam;

  beforeAll(async () => {
    // Créer un utilisateur de test
    testUser = await User.create({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@univ-thies.sn',
      password: 'password123',
      ufr: 'UFR Sciences',
      filiere: 'Informatique',
      role: 'user',
      status: 'active'
    });

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
    userToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    adminToken = jwt.sign({ userId: testAdmin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  });

  describe('GET /api/exams - getAllExams', () => {
    beforeEach(async () => {
      // Créer des examens de test
      await Exam.create([
        {
          title: 'Examen Mathématiques',
          slug: 'examen-mathematiques-abc12',
          ufr: 'UFR Sciences',
          filiere: 'Mathématiques',
          matiere: 'Algèbre',
          year: 2023,
          author: {
            _id: testUser._id,
            firstName: testUser.firstName,
            lastName: testUser.lastName
          },
          filePath: 'http://cloudinary.com/file1.pdf',
          originalName: 'maths.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          status: 'approved'
        },
        {
          title: 'Examen Physique',
          slug: 'examen-physique-def34',
          ufr: 'UFR Sciences',
          filiere: 'Physique',
          matiere: 'Mécanique',
          year: 2024,
          author: {
            _id: testUser._id,
            firstName: testUser.firstName,
            lastName: testUser.lastName
          },
          filePath: 'http://cloudinary.com/file2.pdf',
          originalName: 'physique.pdf',
          fileSize: 2048,
          mimeType: 'application/pdf',
          status: 'pending'
        }
      ]);
    });

    it('devrait récupérer tous les examens avec pagination', async () => {
      const response = await request(app)
        .get('/api/exams?page=1&limit=10')
        .expect(200);

      expect(response.body.message).toBe('Examens récupérés avec succès');
      expect(response.body.exams).toBeDefined();
      expect(response.body.exams.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('devrait filtrer par filière', async () => {
      const response = await request(app)
        .get('/api/exams?filiere=Mathématiques')
        .expect(200);

      expect(response.body.exams).toBeDefined();
      expect(response.body.exams.every(exam => exam.filiere === 'Mathématiques')).toBe(true);
    });

    it('devrait filtrer par année', async () => {
      const response = await request(app)
        .get('/api/exams?year=2023')
        .expect(200);

      expect(response.body.exams).toBeDefined();
      expect(response.body.exams.every(exam => exam.year === 2023)).toBe(true);
    });

    it('devrait rechercher par texte', async () => {
      const response = await request(app)
        .get('/api/exams?search=Mathématiques')
        .expect(200);

      expect(response.body.exams).toBeDefined();
      expect(response.body.exams.length).toBeGreaterThan(0);
    });

    it('devrait trier par date de création', async () => {
      const response = await request(app)
        .get('/api/exams?sortBy=createdAt&sortOrder=desc')
        .expect(200);

      expect(response.body.exams).toBeDefined();
      const exams = response.body.exams;
      for (let i = 0; i < exams.length - 1; i++) {
        expect(new Date(exams[i].createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(exams[i + 1].createdAt).getTime()
        );
      }
    });
  });

  describe('GET /api/exams/:slug - getExamBySlug', () => {
    beforeEach(async () => {
      testExam = await Exam.create({
        title: 'Examen Test',
        slug: 'examen-test-xyz78',
        ufr: 'UFR Test',
        filiere: 'Test',
        matiere: 'Test',
        year: 2024,
        author: {
          _id: testUser._id,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        },
        filePath: 'http://cloudinary.com/test.pdf',
        originalName: 'test.pdf',
        fileSize: 512,
        mimeType: 'application/pdf',
        status: 'approved'
      });
    });

    it('devrait récupérer un examen par slug', async () => {
      const response = await request(app)
        .get(`/api/exams/${testExam.slug}`)
        .expect(200);

      expect(response.body.message).toBe('Examen récupéré avec succès');
      expect(response.body.exam).toBeDefined();
      expect(response.body.exam.slug).toBe(testExam.slug);
    });

    it('devrait retourner 404 si l\'examen n\'existe pas', async () => {
      const response = await request(app)
        .get('/api/exams/slug-inexistant')
        .expect(404);

      expect(response.body.message).toBe('Examen non trouvé');
    });
  });

  describe('GET /api/exams/user/:page/:limit - getUserExams', () => {
    beforeEach(async () => {
      await Exam.create([
        {
          title: 'Examen User 1',
          slug: 'examen-user-1-abc12',
          ufr: 'UFR Test',
          filiere: 'Test',
          matiere: 'Test',
          year: 2024,
          author: {
            _id: testUser._id,
            firstName: testUser.firstName,
            lastName: testUser.lastName
          },
          filePath: 'http://cloudinary.com/user1.pdf',
          originalName: 'user1.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          status: 'approved'
        },
        {
          title: 'Examen User 2',
          slug: 'examen-user-2-def34',
          ufr: 'UFR Test',
          filiere: 'Test',
          matiere: 'Test',
          year: 2024,
          author: {
            _id: testAdmin._id,
            firstName: testAdmin.firstName,
            lastName: testAdmin.lastName
          },
          filePath: 'http://cloudinary.com/user2.pdf',
          originalName: 'user2.pdf',
          fileSize: 2048,
          mimeType: 'application/pdf',
          status: 'approved'
        }
      ]);
    });

    it('devrait récupérer les examens de l\'utilisateur connecté', async () => {
      const response = await request(app)
        .get('/api/exams/user/1/10')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).toBe('Examens récupérés avec succès');
      expect(response.body.exams).toBeDefined();
      expect(response.body.exams.every(exam => exam.author._id.toString() === testUser._id.toString())).toBe(true);
    });

    it('devrait retourner 401 sans token', async () => {
      const response = await request(app)
        .get('/api/exams/user/1/10')
        .expect(401);
    });
  });

  describe('POST /api/exams - postExam', () => {
    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .post('/api/exams')
        .send({
          title: 'Examen Test',
          ufr: 'UFR Test',
          filiere: 'Test',
          matiere: 'Test',
          year: 2024
        })
        .expect(401);
    });
  });

  describe('PUT /api/exams/:slug - updateExam', () => {
    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .put('/api/exams/test-slug')
        .send({ title: 'Test' })
        .expect(401);
    });
  });

  describe('DELETE /api/exams/:slug - deleteExam', () => {
    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .delete('/api/exams/test-slug')
        .expect(401);
    });
  });
});
