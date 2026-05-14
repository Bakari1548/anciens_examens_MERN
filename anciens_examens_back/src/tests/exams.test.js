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
    array: jest.fn(() => (req, res, next) => {
      req.files = [
        {
          path: 'http://cloudinary.com/test.pdf',
          public_id: 'exams/test-exam',
          size: 1024,
          mimetype: 'application/pdf',
          originalname: 'test.pdf'
        }
      ];
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

// Mock du middleware admin - autorise toutes les requêtes avec token pour les tests
jest.mock('../middlewares/admin.middleware', () => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      // Pour les tests, on autorise toutes les requêtes avec token
      next();
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
          title: 'Examen Mathématiques L1 S1',
          slug: 'examen-mathematiques-abc12',
          ufr: 'UFR Sciences Économiques et Sociales',
          filiere: 'Sciences Économiques et Gestion',
          niveau: 'L1',
          semestre: 'S1',
          typeExamen: 'Examen Final',
          matiere: 'Algèbre',
          anneeExamen: '2023-2024',
          author: {
            _id: testUser._id,
            firstName: testUser.firstName,
            lastName: testUser.lastName
          },
          files: [{
            url: 'http://cloudinary.com/file1.pdf',
            publicId: 'exams/maths-1',
            size: 1024,
            mimeType: 'application/pdf',
            originalName: 'maths.pdf'
          }],
          status: 'approved'
        },
        {
          title: 'Examen Physique L1 S1',
          slug: 'examen-physique-def34',
          ufr: 'UFR Sciences et Technologies',
          filiere: 'Physique',
          niveau: 'L1',
          semestre: 'S1',
          typeExamen: 'TD/TP',
          matiere: 'Mécanique',
          anneeExamen: '2023-2024',
          author: {
            _id: testUser._id,
            firstName: testUser.firstName,
            lastName: testUser.lastName
          },
          files: [{
            url: 'http://cloudinary.com/file2.pdf',
            publicId: 'exams/physique-1',
            size: 2048,
            mimeType: 'application/pdf',
            originalName: 'physique.pdf'
          }],
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
        .get('/api/exams?filiere=Sciences Économiques et Gestion')
        .expect(200);

      expect(response.body.exams).toBeDefined();
      expect(response.body.exams.every(exam => exam.filiere === 'Sciences Économiques et Gestion')).toBe(true);
    });

    it('devrait filtrer par année', async () => {
      const response = await request(app)
        .get('/api/exams?anneeExamen=2023-2024')
        .expect(200);

      expect(response.body.exams).toBeDefined();
      expect(response.body.exams.every(exam => exam.anneeExamen === '2023-2024')).toBe(true);
    });

    it('devrait filtrer par niveau', async () => {
      const response = await request(app)
        .get('/api/exams?niveau=L1')
        .expect(200);

      expect(response.body.exams).toBeDefined();
      expect(response.body.exams.every(exam => exam.niveau === 'L1')).toBe(true);
    });

    it('devrait filtrer par semestre', async () => {
      const response = await request(app)
        .get('/api/exams?semestre=S1')
        .expect(200);

      expect(response.body.exams).toBeDefined();
      expect(response.body.exams.every(exam => exam.semestre === 'S1')).toBe(true);
    });

    it('devrait filtrer par typeExamen', async () => {
      const response = await request(app)
        .get('/api/exams?typeExamen=Examen Final')
        .expect(200);

      expect(response.body.exams).toBeDefined();
      expect(response.body.exams.every(exam => exam.typeExamen === 'Examen Final')).toBe(true);
    });

    it('devrait filtrer par UFR', async () => {
      const response = await request(app)
        .get('/api/exams?ufr=UFR Sciences Économiques et Sociales')
        .expect(200);

      expect(response.body.exams).toBeDefined();
      expect(response.body.exams.every(exam => exam.ufr === 'UFR Sciences Économiques et Sociales')).toBe(true);
    });

    it('devrait filtrer par matière', async () => {
      const response = await request(app)
        .get('/api/exams?matiere=Algèbre')
        .expect(200);

      expect(response.body.exams).toBeDefined();
      expect(response.body.exams.every(exam => exam.matiere === 'Algèbre')).toBe(true);
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
        title: 'Examen Test M1 S7',
        slug: 'examen-test-xyz78',
        ufr: 'UFR Sciences Économiques et Sociales',
        filiere: 'Sciences Économiques et Gestion',
        niveau: 'M1',
        semestre: 'S7',
        typeExamen: 'Devoir',
        matiere: 'Test',
        anneeExamen: '2024-2025',
        author: {
          _id: testUser._id,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        },
        files: [{
          url: 'http://cloudinary.com/test.pdf',
          publicId: 'exams/test-1',
          size: 512,
          mimeType: 'application/pdf',
          originalName: 'test.pdf'
        }],
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
          title: 'Examen User 1 L3 S5',
          slug: 'examen-user-1-abc12',
          ufr: 'UFR Sciences Économiques et Sociales',
          filiere: 'Sciences Économiques et Gestion',
          niveau: 'L3',
          semestre: 'S5',
          typeExamen: 'Session de Rattrapage',
          matiere: 'Test',
          anneeExamen: '2024-2025',
          author: {
            _id: testUser._id,
            firstName: testUser.firstName,
            lastName: testUser.lastName
          },
          files: [{
            url: 'http://cloudinary.com/user1.pdf',
            publicId: 'exams/user1-1',
            size: 1024,
            mimeType: 'application/pdf',
            originalName: 'user1.pdf'
          }],
          status: 'approved'
        },
        {
          title: 'Examen User 2 M2 S10',
          slug: 'examen-user-2-def34',
          ufr: 'UFR Sciences et Technologies',
          filiere: 'Informatique',
          niveau: 'M2',
          semestre: 'S10',
          typeExamen: 'TD/TP',
          matiere: 'Test',
          anneeExamen: '2024-2025',
          author: {
            _id: testAdmin._id,
            firstName: testAdmin.firstName,
            lastName: testAdmin.lastName
          },
          files: [{
            url: 'http://cloudinary.com/user2.pdf',
            publicId: 'exams/user2-1',
            size: 2048,
            mimeType: 'application/pdf',
            originalName: 'user2.pdf'
          }],
          status: 'approved'
        }
      ]);
    });

    it('devrait récupérer les examens de l\'utilisateur connecté', async () => {
      const response = await request(app)
        .get('/api/exams/user')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).toBe('Examens récupérés avec succès');
      expect(response.body.exams).toBeDefined();
      expect(response.body.exams.every(exam => exam.author._id.toString() === testUser._id.toString())).toBe(true);
    });

    it('devrait retourner 401 sans token', async () => {
      const response = await request(app)
        .get('/api/exams/user')
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

  describe('Exam Model - Validation des niveaux académiques', () => {
    it('devrait accepter tous les niveaux académiques valides', async () => {
      const validLevels = ['L1', 'L2', 'L3', 'L4', 'M1', 'M2', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 
                         'PCEM1', 'PCEM2', 'DCEM1', 'DCEM2', 'DCEM3', 'DCEM4', 'LP', 'ING1', 'ING2', 'ING3', 'DUT1', 'DUT2'];

      for (const level of validLevels) {
        const exam = new Exam({
          title: 'Test',
          slug: `test-${level}`,
          ufr: 'UFR Test',
          filiere: 'Test',
          niveau: level,
          semestre: 'S1',
          typeExamen: 'Examen Final',
          matiere: 'Test',
          author: {
            _id: testUser._id,
            firstName: testUser.firstName,
            lastName: testUser.lastName
          },
          files: [{
            url: 'http://test.com/file.pdf',
            publicId: 'test',
            size: 1024,
            mimeType: 'application/pdf',
            originalName: 'file.pdf'
          }]
        });

        const validationError = exam.validateSync();
        expect(validationError).toBeUndefined();
      }
    });

    it('devrait rejeter les niveaux académiques invalides', async () => {
      const invalidLevels = ['L5', 'M3', 'D7', 'INVALID'];

      for (const level of invalidLevels) {
        const exam = new Exam({
          title: 'Test',
          slug: `test-${level}`,
          ufr: 'UFR Test',
          filiere: 'Test',
          niveau: level,
          semestre: 'S1',
          typeExamen: 'Examen Final',
          matiere: 'Test',
          author: {
            _id: testUser._id,
            firstName: testUser.firstName,
            lastName: testUser.lastName
          },
          files: [{
            url: 'http://test.com/file.pdf',
            publicId: 'test',
            size: 1024,
            mimeType: 'application/pdf',
            originalName: 'file.pdf'
          }]
        });

        const validationError = exam.validateSync();
        expect(validationError).toBeDefined();
        expect(validationError.errors.niveau).toBeDefined();
      }
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
    it('devrait supprimer un examen avec plusieurs fichiers', async () => {
      // Créer un examen avec plusieurs fichiers
      const testExam = await Exam.create({
        _id: new mongoose.Types.ObjectId(),
        title: 'Examen Multi-fichiers Test',
        slug: 'examen-multi-fichiers-test',
        ufr: 'UFR Sciences et Technologies',
        filiere: 'Informatique',
        niveau: 'L1',
        semestre: 'S1',
        typeExamen: 'Examen Final',
        matiere: 'Test',
        author: {
          _id: testUser._id,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        },
        files: [
          {
            url: 'http://cloudinary.com/file1.pdf',
            publicId: 'exams/test-1',
            size: 1024,
            mimeType: 'application/pdf',
            originalName: 'file1.pdf'
          },
          {
            url: 'http://cloudinary.com/file2.pdf',
            publicId: 'exams/test-2',
            size: 2048,
            mimeType: 'application/pdf',
            originalName: 'file2.pdf'
          }
        ],
        status: 'approved'
      });

      const response = await request(app)
        .delete(`/api/exams/${testExam.slug}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Examen supprimé avec succès');
      
      // Vérifier que l'examen est supprimé
      const deletedExam = await Exam.findByIdAndDelete(testExam._id);
      expect(deletedExam).toBeNull();
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .delete('/api/exams/test-slug')
        .expect(401);
    });
  });

  describe('POST /api/exams/:slug/like - likeExam', () => {
    beforeEach(async () => {
      testExam = await Exam.create({
        title: 'Examen Like Test',
        slug: 'examen-like-test',
        ufr: 'UFR Sciences et Technologies',
        filiere: 'Informatique',
        niveau: 'L1',
        semestre: 'S1',
        typeExamen: 'Examen Final',
        matiere: 'Test',
        author: {
          _id: testUser._id,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        },
        files: [{
          url: 'http://cloudinary.com/test.pdf',
          publicId: 'exams/test',
          size: 1024,
          mimeType: 'application/pdf',
          originalName: 'test.pdf'
        }],
        status: 'approved',
        likes: [],
        likesCount: 0
      });
    });

    it('devrait liker un examen', async () => {
      const response = await request(app)
        .post(`/api/exams/${testExam.slug}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).toBe('Examen liké avec succès');
      expect(response.body.isLiked).toBe(true);
      expect(response.body.likesCount).toBe(1);

      // Vérifier dans la base de données
      const updatedExam = await Exam.findOne({ slug: testExam.slug });
      expect(updatedExam.likesCount).toBe(1);
      expect(updatedExam.likes.some(like => like.user.toString() === testUser._id.toString())).toBe(true);
    });

    it('devrait retourner 400 si déjà liké', async () => {
      // Liker une première fois
      await request(app)
        .post(`/api/exams/${testExam.slug}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Essayer de liker une deuxième fois
      const response = await request(app)
        .post(`/api/exams/${testExam.slug}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.message).toBe('Vous avez déjà liké cet examen');
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .post(`/api/exams/${testExam.slug}/like`)
        .expect(401);
    });

    it('devrait retourner 404 si l\'examen n\'existe pas', async () => {
      const response = await request(app)
        .post('/api/exams/slug-inexistant/like')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.message).toBe('Examen non trouvé');
    });
  });

  describe('DELETE /api/exams/:slug/like - unlikeExam', () => {
    beforeEach(async () => {
      testExam = await Exam.create({
        title: 'Examen Unlike Test',
        slug: 'examen-unlike-test',
        ufr: 'UFR Sciences et Technologies',
        filiere: 'Informatique',
        niveau: 'L1',
        semestre: 'S1',
        typeExamen: 'Examen Final',
        matiere: 'Test',
        author: {
          _id: testUser._id,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        },
        files: [{
          url: 'http://cloudinary.com/test.pdf',
          publicId: 'exams/test',
          size: 1024,
          mimeType: 'application/pdf',
          originalName: 'test.pdf'
        }],
        status: 'approved',
        likes: [{ user: testUser._id }],
        likesCount: 1
      });
    });

    it('devrait retirer un like', async () => {
      const response = await request(app)
        .delete(`/api/exams/${testExam.slug}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).toBe('Like retiré avec succès');
      expect(response.body.isLiked).toBe(false);
      expect(response.body.likesCount).toBe(0);

      // Vérifier dans la base de données
      const updatedExam = await Exam.findOne({ slug: testExam.slug });
      expect(updatedExam.likesCount).toBe(0);
      expect(updatedExam.likes.some(like => like.user.toString() === testUser._id.toString())).toBe(false);
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .delete(`/api/exams/${testExam.slug}/like`)
        .expect(401);
    });

    it('devrait retourner 404 si l\'examen n\'existe pas', async () => {
      const response = await request(app)
        .delete('/api/exams/slug-inexistant/like')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.message).toBe('Examen non trouvé');
    });
  });

  describe('GET /api/exams/:slug/like/status - getLikeStatus', () => {
    beforeEach(async () => {
      testExam = await Exam.create({
        title: 'Examen Like Status Test',
        slug: 'examen-like-status-test',
        ufr: 'UFR Sciences et Technologies',
        filiere: 'Informatique',
        niveau: 'L1',
        semestre: 'S1',
        typeExamen: 'Examen Final',
        matiere: 'Test',
        author: {
          _id: testUser._id,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        },
        files: [{
          url: 'http://cloudinary.com/test.pdf',
          publicId: 'exams/test',
          size: 1024,
          mimeType: 'application/pdf',
          originalName: 'test.pdf'
        }],
        status: 'approved',
        likes: [{ user: testUser._id }],
        likesCount: 1
      });
    });

    it('devrait retourner le statut du like (true)', async () => {
      const response = await request(app)
        .get(`/api/exams/${testExam.slug}/like/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.isLiked).toBe(true);
      expect(response.body.likesCount).toBe(1);
    });

    it('devrait retourner le statut du like (false)', async () => {
      // Créer un examen sans like de l'utilisateur
      const examWithoutLike = await Exam.create({
        title: 'Examen No Like Test',
        slug: 'examen-no-like-test',
        ufr: 'UFR Sciences et Technologies',
        filiere: 'Informatique',
        niveau: 'L1',
        semestre: 'S1',
        typeExamen: 'Examen Final',
        matiere: 'Test',
        author: {
          _id: testAdmin._id,
          firstName: testAdmin.firstName,
          lastName: testAdmin.lastName
        },
        files: [{
          url: 'http://cloudinary.com/test.pdf',
          publicId: 'exams/test2',
          size: 1024,
          mimeType: 'application/pdf',
          originalName: 'test2.pdf'
        }],
        status: 'approved',
        likes: [],
        likesCount: 0
      });

      const response = await request(app)
        .get(`/api/exams/${examWithoutLike.slug}/like/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.isLiked).toBe(false);
      expect(response.body.likesCount).toBe(0);
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .get(`/api/exams/${testExam.slug}/like/status`)
        .expect(401);
    });

    it('devrait retourner 404 si l\'examen n\'existe pas', async () => {
      const response = await request(app)
        .get('/api/exams/slug-inexistant/like/status')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.message).toBe('Examen non trouvé');
    });
  });

  describe('POST /api/exams/:slug/comments - addComment', () => {
    beforeEach(async () => {
      testExam = await Exam.create({
        title: 'Examen Comment Test',
        slug: 'examen-comment-test',
        ufr: 'UFR Sciences et Technologies',
        filiere: 'Informatique',
        niveau: 'L1',
        semestre: 'S1',
        typeExamen: 'Examen Final',
        matiere: 'Test',
        author: {
          _id: testUser._id,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        },
        files: [{
          url: 'http://cloudinary.com/test.pdf',
          publicId: 'exams/test',
          size: 1024,
          mimeType: 'application/pdf',
          originalName: 'test.pdf'
        }],
        status: 'approved',
        comments: [],
        commentsCount: 0
      });
    });

    it('devrait ajouter un commentaire', async () => {
      const commentContent = 'Ceci est un commentaire de test';
      
      const response = await request(app)
        .post(`/api/exams/${testExam.slug}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: commentContent })
        .expect(201);

      expect(response.body.message).toBe('Commentaire ajouté avec succès');
      expect(response.body.comment).toBeDefined();
      expect(response.body.comment.content).toBe(commentContent);
      expect(response.body.commentsCount).toBe(1);

      // Vérifier dans la base de données
      const updatedExam = await Exam.findOne({ slug: testExam.slug });
      expect(updatedExam.commentsCount).toBe(1);
      expect(updatedExam.comments[0].content).toBe(commentContent);
    });

    it('devrait retourner 400 si le commentaire est vide', async () => {
      const response = await request(app)
        .post(`/api/exams/${testExam.slug}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: '' })
        .expect(400);

      expect(response.body.message).toBe('Le contenu du commentaire est requis');
    });

    it('devrait retourner 400 si le commentaire dépasse 500 caractères', async () => {
      const longComment = 'a'.repeat(501);
      
      const response = await request(app)
        .post(`/api/exams/${testExam.slug}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: longComment })
        .expect(400);

      expect(response.body.message).toBe('Le commentaire ne peut pas dépasser 500 caractères');
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .post(`/api/exams/${testExam.slug}/comments`)
        .send({ content: 'Test commentaire' })
        .expect(401);
    });

    it('devrait retourner 404 si l\'examen n\'existe pas', async () => {
      const response = await request(app)
        .post('/api/exams/slug-inexistant/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Test' })
        .expect(404);

      expect(response.body.message).toBe('Examen non trouvé');
    });
  });

  describe('GET /api/exams/:slug/comments - getComments', () => {
    beforeEach(async () => {
      testExam = await Exam.create({
        title: 'Examen Get Comments Test',
        slug: 'examen-get-comments-test',
        ufr: 'UFR Sciences et Technologies',
        filiere: 'Informatique',
        niveau: 'L1',
        semestre: 'S1',
        typeExamen: 'Examen Final',
        matiere: 'Test',
        author: {
          _id: testUser._id,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        },
        files: [{
          url: 'http://cloudinary.com/test.pdf',
          publicId: 'exams/test',
          size: 1024,
          mimeType: 'application/pdf',
          originalName: 'test.pdf'
        }],
        status: 'approved',
        comments: [
          { user: testUser._id, content: 'Premier commentaire', createdAt: new Date() },
          { user: testAdmin._id, content: 'Deuxième commentaire', createdAt: new Date() }
        ],
        commentsCount: 2
      });
    });

    it('devrait récupérer les commentaires d\'un examen (public)', async () => {
      const response = await request(app)
        .get(`/api/exams/${testExam.slug}/comments`)
        .expect(200);

      expect(response.body.message).toBe('Commentaires récupérés avec succès');
      expect(response.body.comments).toBeDefined();
      expect(response.body.comments.length).toBe(2);
      expect(response.body.commentsCount).toBe(2);
    });

    it('devrait retourner un tableau vide si pas de commentaires', async () => {
      const examWithoutComments = await Exam.create({
        title: 'Examen No Comments',
        slug: 'examen-no-comments',
        ufr: 'UFR Sciences et Technologies',
        filiere: 'Informatique',
        niveau: 'L1',
        semestre: 'S1',
        typeExamen: 'Examen Final',
        matiere: 'Test',
        author: {
          _id: testUser._id,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        },
        files: [{
          url: 'http://cloudinary.com/test.pdf',
          publicId: 'exams/test3',
          size: 1024,
          mimeType: 'application/pdf',
          originalName: 'test3.pdf'
        }],
        status: 'approved',
        comments: [],
        commentsCount: 0
      });

      const response = await request(app)
        .get(`/api/exams/${examWithoutComments.slug}/comments`)
        .expect(200);

      expect(response.body.comments).toHaveLength(0);
      expect(response.body.commentsCount).toBe(0);
    });

    it('devrait retourner 404 si l\'examen n\'existe pas', async () => {
      const response = await request(app)
        .get('/api/exams/slug-inexistant/comments')
        .expect(404);

      expect(response.body.message).toBe('Examen non trouvé');
    });
  });

  describe('DELETE /api/exams/:slug/comments/:commentId - deleteComment', () => {
    beforeEach(async () => {
      testExam = await Exam.create({
        title: 'Examen Delete Comment Test',
        slug: 'examen-delete-comment-test',
        ufr: 'UFR Sciences et Technologies',
        filiere: 'Informatique',
        niveau: 'L1',
        semestre: 'S1',
        typeExamen: 'Examen Final',
        matiere: 'Test',
        author: {
          _id: testUser._id,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        },
        files: [{
          url: 'http://cloudinary.com/test.pdf',
          publicId: 'exams/test',
          size: 1024,
          mimeType: 'application/pdf',
          originalName: 'test.pdf'
        }],
        status: 'approved',
        comments: [
          { user: testUser._id, content: 'Commentaire à supprimer', createdAt: new Date() }
        ],
        commentsCount: 1
      });
    });

    it('devrait supprimer son propre commentaire', async () => {
      const commentId = testExam.comments[0]._id;
      
      const response = await request(app)
        .delete(`/api/exams/${testExam.slug}/comments/${commentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).toBe('Commentaire supprimé avec succès');
      expect(response.body.commentsCount).toBe(0);

      // Vérifier dans la base de données
      const updatedExam = await Exam.findOne({ slug: testExam.slug });
      expect(updatedExam.commentsCount).toBe(0);
      expect(updatedExam.comments).toHaveLength(0);
    });

    it('devrait permettre à l\'auteur de l\'examen de supprimer un commentaire', async () => {
      // Créer un commentaire par admin
      const examWithAdminComment = await Exam.create({
        title: 'Examen Admin Comment Test',
        slug: 'examen-admin-comment-test',
        ufr: 'UFR Sciences et Technologies',
        filiere: 'Informatique',
        niveau: 'L1',
        semestre: 'S1',
        typeExamen: 'Examen Final',
        matiere: 'Test',
        author: {
          _id: testUser._id,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        },
        files: [{
          url: 'http://cloudinary.com/test.pdf',
          publicId: 'exams/test',
          size: 1024,
          mimeType: 'application/pdf',
          originalName: 'test.pdf'
        }],
        status: 'approved',
        comments: [
          { user: testAdmin._id, content: 'Commentaire de l\'admin', createdAt: new Date() }
        ],
        commentsCount: 1
      });

      const commentId = examWithAdminComment.comments[0]._id;
      
      // L'auteur de l'examen (testUser) supprime le commentaire de l'admin
      const response = await request(app)
        .delete(`/api/exams/${examWithAdminComment.slug}/comments/${commentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).toBe('Commentaire supprimé avec succès');
    });

    it('devrait retourner 403 si l\'utilisateur n\'a pas la permission', async () => {
      // Créer un examen par testUser
      const commentId = testExam.comments[0]._id;
      
      // L'admin tente de supprimer le commentaire (n'est ni l'auteur du commentaire ni de l'examen)
      const response = await request(app)
        .delete(`/api/exams/${testExam.slug}/comments/${commentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(response.body.message).toBe('Vous n\'avez pas la permission de supprimer ce commentaire');
    });

    it('devrait retourner 401 sans authentification', async () => {
      const commentId = testExam.comments[0]._id;
      
      const response = await request(app)
        .delete(`/api/exams/${testExam.slug}/comments/${commentId}`)
        .expect(401);
    });

    it('devrait retourner 404 si le commentaire n\'existe pas', async () => {
      const fakeCommentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/exams/${testExam.slug}/comments/${fakeCommentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.message).toBe('Commentaire non trouvé');
    });

    it('devrait retourner 404 si l\'examen n\'existe pas', async () => {
      const commentId = testExam.comments[0]._id;
      
      const response = await request(app)
        .delete(`/api/exams/slug-inexistant/comments/${commentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.message).toBe('Examen non trouvé');
    });
  });
});
