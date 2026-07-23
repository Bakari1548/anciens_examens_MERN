const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ExamRequest = require('../models/ExamRequest');
require('dotenv').config();

jest.mock('../middlewares/auth.middleware', () => {
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token invalide' });
    }
  };
});

jest.mock('../middlewares/admin.middleware', () => {
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé. Rôle admin requis.' });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token invalide' });
    }
  };
});

const app = require('../../app');

describe('Exam Request API', () => {
  let user;
  let admin;
  let userToken;
  let adminToken;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  });

  beforeEach(async () => {
    user = await User.create({
      firstName: 'User',
      lastName: 'Requester',
      email: 'user@univ-thies.sn',
      password: 'password123',
      ufr: 'UFR Sciences',
      filiere: 'Informatique',
      role: 'user',
      status: 'active'
    });

    admin = await User.create({
      firstName: 'Admin',
      lastName: 'Manager',
      email: 'admin@univ-thies.sn',
      password: 'password123',
      ufr: 'UFR Admin',
      filiere: 'IT',
      role: 'admin',
      status: 'active'
    });

    userToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    adminToken = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterEach(async () => {
    await ExamRequest.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a new exam request', async () => {
    const payload = {
      ufr: 'UFR Sciences',
      filiere: 'Informatique',
      niveau: 'L3',
      semestre: 'S5',
      matiere: 'Algorithmes',
      description: 'Besoin de sujets récents'
    };

    const response = await request(app)
      .post('/api/exam-requests')
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(201);

    expect(response.body.message).toBe('Demande enregistrée avec succès');
    expect(response.body.request.matiere).toBe(payload.matiere);
  });

  it('should reject invalid requests', async () => {
    const response = await request(app)
      .post('/api/exam-requests')
      .set('Authorization', `Bearer ${userToken}`)
      .send({})
      .expect(400);

    expect(response.body.message).toMatch('Les champs UFR');
  });

  it('should list user requests', async () => {
    await ExamRequest.create({
      requester: user._id,
      requesterName: 'User Requester',
      requesterEmail: user.email,
      ufr: 'UFR Sciences',
      filiere: 'Informatique',
      niveau: 'L3',
      semestre: 'S5',
      matiere: 'Algo'
    });

    const response = await request(app)
      .get('/api/exam-requests/my')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.requests).toHaveLength(1);
  });

  it('should allow admins to list requests', async () => {
    await ExamRequest.create({
      requester: user._id,
      requesterName: 'User Requester',
      requesterEmail: user.email,
      ufr: 'UFR Sciences',
      filiere: 'Informatique',
      niveau: 'L3',
      semestre: 'S5',
      matiere: 'Algo'
    });

    const response = await request(app)
      .get('/api/exam-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.requests.length).toBeGreaterThan(0);
  });

  it('should allow admins to update request status', async () => {
    const examRequest = await ExamRequest.create({
      requester: user._id,
      requesterName: 'User Requester',
      requesterEmail: user.email,
      ufr: 'UFR Sciences',
      filiere: 'Informatique',
      niveau: 'L3',
      semestre: 'S5',
      matiere: 'Algo'
    });

    const response = await request(app)
      .patch(`/api/exam-requests/${examRequest._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'in_progress', adminMessage: 'Nous cherchons ce sujet' })
      .expect(200);

    expect(response.body.request.status).toBe('in_progress');
    expect(response.body.request.adminMessage).toBe('Nous cherchons ce sujet');
  });

  it('should add a message to a request', async () => {
    const examRequest = await ExamRequest.create({
      requester: user._id,
      requesterName: 'User Requester',
      requesterEmail: user.email,
      ufr: 'UFR Sciences',
      filiere: 'Informatique',
      niveau: 'L3',
      semestre: 'S5',
      matiere: 'Algo',
      watchers: [user._id]
    });

    const response = await request(app)
      .post(`/api/exam-requests/${examRequest._id}/messages`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Avez-vous vérifié la bibliothèque ?' })
      .expect(201);

    expect(response.body.entry.content).toContain('bibliothèque');

    const updated = await ExamRequest.findById(examRequest._id);
    expect(updated.messages).toHaveLength(1);
  });

  it('should allow users to watch a request', async () => {
    const examRequest = await ExamRequest.create({
      requester: user._id,
      requesterName: 'User Requester',
      requesterEmail: user.email,
      ufr: 'UFR Sciences',
      filiere: 'Informatique',
      niveau: 'L3',
      semestre: 'S5',
      matiere: 'Algo'
    });

    const response = await request(app)
      .post(`/api/exam-requests/${examRequest._id}/watch`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.message).toContain('suivrez');

    const updated = await ExamRequest.findById(examRequest._id);
    expect(updated.watchers.map(String)).toContain(String(user._id));
  });
});
