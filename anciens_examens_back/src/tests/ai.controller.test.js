require('dotenv').config();
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-key';

const request = require('supertest');
const mongoose = require('mongoose');

// Mock du SDK Gemini AVANT d'importer l'app
const mockGenerateContent = jest.fn();
const mockSendMessage = jest.fn();
const mockStartChat = jest.fn(() => ({ sendMessage: mockSendMessage }));

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn(() => ({
                generateContent: mockGenerateContent,
                startChat: mockStartChat
            }))
        }))
    };
});

// Mock fetch global pour buildFilePart depuis URL
global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
}));

// Mock du middleware d'authentification
jest.mock('../middlewares/auth.middleware', () => {
    return (req, res, next) => {
        const auth = req.headers['authorization'];
        if (!auth) return res.status(401).json({ message: 'Token requis' });
        req.user = {
            _id: new (require('mongoose').Types.ObjectId)(),
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            role: 'user'
        };
        next();
    };
});

const app = require('../../app');
const Exam = require('../models/Exam');

const validJsonResponse = (obj) => ({
    response: { text: () => JSON.stringify(obj) }
});

describe('AI Controller', () => {
    beforeEach(() => {
        mockGenerateContent.mockReset();
        mockSendMessage.mockReset();
        mockStartChat.mockClear();
        global.fetch.mockClear();
    });

    // NB : POST /api/ai/analyze-exam n'est pas testé ici car multer + supertest
    // présentent un bug de hang sur les requêtes multipart. La logique est triviale
    // (appel gemini.analyzeExam + nettoyage enum) et peut être testée manuellement.

    // ============== Feature #2 : check-duplicate ==============
    describe('POST /api/ai/check-duplicate', () => {
        const baseExtraction = {
            globalSummary: 'Examen sur les arbres binaires',
            exercises: [
                { number: 'Exercice 1', title: 'Arbre', statement: 'Implémenter un arbre binaire', keywords: ['arbre'] }
            ]
        };

        it('retourne aucun doublon si la BDD est vide', async () => {
            const res = await request(app)
                .post('/api/ai/check-duplicate')
                .set('Authorization', 'Bearer fake-token')
                .send({
                    ufr: 'UFR Sciences et Techniques',
                    filiere: 'Informatique',
                    matiere: 'Algorithmique',
                    aiExtraction: baseExtraction
                });

            expect(res.status).toBe(200);
            expect(res.body.isDuplicate).toBe(false);
            expect(res.body.matches).toEqual([]);
        });

        it('retourne 400 si aiExtraction.exercises manquant', async () => {
            const res = await request(app)
                .post('/api/ai/check-duplicate')
                .set('Authorization', 'Bearer fake-token')
                .send({ ufr: 'X', filiere: 'Y', matiere: 'Z' });

            expect(res.status).toBe(400);
        });

        it('détecte un doublon quand l\'IA retourne un match exact', async () => {
            // Insérer un examen avec extraction IA en BDD
            const existing = await Exam.create({
                title: 'Examen Final Algorithmique',
                slug: 'examen-final-algorithmique-abc123',
                ufr: 'UFR Sciences et Techniques',
                filiere: 'Informatique',
                niveau: 'L2',
                semestre: 'S3',
                typeExamen: 'Examen Final',
                matiere: 'Algorithmique',
                status: 'approved',
                author: { _id: new mongoose.Types.ObjectId(), firstName: 'A', lastName: 'B' },
                files: [{ url: 'https://example.com/f.pdf', originalName: 'f.pdf', size: 100, mimeType: 'application/pdf' }],
                aiExtraction: {
                    globalSummary: 'Examen sur les arbres binaires',
                    exercises: [
                        { number: 'Exercice 1', title: 'Arbre', statement: 'Arbre binaire', keywords: ['arbre'] }
                    ]
                }
            });

            mockGenerateContent.mockResolvedValueOnce(validJsonResponse({
                matches: [
                    {
                        examId: String(existing._id),
                        matchedExercises: [{ newExNumber: 'Exercice 1', existingExNumber: 'Exercice 1', similarity: 0.95 }],
                        globalSimilarity: 0.9,
                        verdict: 'exact'
                    }
                ]
            }));

            const res = await request(app)
                .post('/api/ai/check-duplicate')
                .set('Authorization', 'Bearer fake-token')
                .send({
                    ufr: 'UFR Sciences et Techniques',
                    filiere: 'Informatique',
                    matiere: 'Algorithmique',
                    aiExtraction: baseExtraction
                });

            expect(res.status).toBe(200);
            expect(res.body.isDuplicate).toBe(true);
            expect(res.body.matches).toHaveLength(1);
            expect(res.body.matches[0].verdict).toBe('exact');
            expect(res.body.matches[0].slug).toBe('examen-final-algorithmique-abc123');
        });

        it('ne retourne pas de doublon si verdict = different', async () => {
            const existing = await Exam.create({
                title: 'Autre Examen',
                slug: 'autre-examen-xyz789',
                ufr: 'UFR Sciences et Techniques',
                filiere: 'Informatique',
                niveau: 'L2',
                semestre: 'S3',
                typeExamen: 'Examen Final',
                matiere: 'Algorithmique',
                status: 'approved',
                author: { _id: new mongoose.Types.ObjectId(), firstName: 'A', lastName: 'B' },
                files: [{ url: 'https://example.com/f.pdf', originalName: 'f.pdf', size: 100, mimeType: 'application/pdf' }],
                aiExtraction: {
                    exercises: [{ number: 'Ex 1', statement: 'Tout autre chose', keywords: ['x'] }]
                }
            });

            mockGenerateContent.mockResolvedValueOnce(validJsonResponse({
                matches: [
                    {
                        examId: String(existing._id),
                        matchedExercises: [],
                        globalSimilarity: 0.1,
                        verdict: 'different'
                    }
                ]
            }));

            const res = await request(app)
                .post('/api/ai/check-duplicate')
                .set('Authorization', 'Bearer fake-token')
                .send({
                    ufr: 'UFR Sciences et Techniques',
                    filiere: 'Informatique',
                    matiere: 'Algorithmique',
                    aiExtraction: baseExtraction
                });

            expect(res.status).toBe(200);
            expect(res.body.isDuplicate).toBe(false);
            expect(res.body.matches).toEqual([]);
            // allMatches contient toujours le résultat brut
            expect(res.body.allMatches).toHaveLength(1);
        });
    });

    // ============== Feature #3 : chat ==============
    describe('POST /api/ai/chat/:slug', () => {
        let testExam;

        beforeEach(async () => {
            testExam = await Exam.create({
                title: 'Test Chat Examen',
                slug: 'test-chat-examen-aaa111',
                ufr: 'UFR Sciences et Techniques',
                filiere: 'Informatique',
                niveau: 'L2',
                semestre: 'S3',
                typeExamen: 'Examen Final',
                matiere: 'Algorithmique',
                status: 'approved',
                author: { _id: new mongoose.Types.ObjectId(), firstName: 'A', lastName: 'B' },
                files: [{ url: 'https://example.com/f.pdf', originalName: 'f.pdf', size: 100, mimeType: 'application/pdf' }]
            });
        });

        it('répond à un message de l\'utilisateur', async () => {
            mockSendMessage.mockResolvedValueOnce({
                response: { text: () => 'Voici un indice pour le premier exercice...' }
            });

            const res = await request(app)
                .post(`/api/ai/chat/${testExam.slug}`)
                .set('Authorization', 'Bearer fake-token')
                .send({ message: 'Comment faire l\'exercice 1 ?', history: [] });

            expect(res.status).toBe(200);
            expect(res.body.reply).toContain('indice');
            expect(mockStartChat).toHaveBeenCalled();
        });

        it('retourne 400 si le message est vide', async () => {
            const res = await request(app)
                .post(`/api/ai/chat/${testExam.slug}`)
                .set('Authorization', 'Bearer fake-token')
                .send({ message: '' });
            expect(res.status).toBe(400);
        });

        it('retourne 400 si le message est trop long', async () => {
            const longMsg = 'a'.repeat(2001);
            const res = await request(app)
                .post(`/api/ai/chat/${testExam.slug}`)
                .set('Authorization', 'Bearer fake-token')
                .send({ message: longMsg });
            expect(res.status).toBe(400);
        });

        it('retourne 404 si l\'examen n\'existe pas', async () => {
            mockSendMessage.mockResolvedValueOnce({ response: { text: () => 'ok' } });
            const res = await request(app)
                .post('/api/ai/chat/inexistant-slug-zzz')
                .set('Authorization', 'Bearer fake-token')
                .send({ message: 'Salut' });
            expect(res.status).toBe(404);
        });

        it('retourne 401 sans authentification', async () => {
            const res = await request(app)
                .post(`/api/ai/chat/${testExam.slug}`)
                .send({ message: 'test' });
            expect(res.status).toBe(401);
        });

        it('utilise l\'historique passé dans la requête', async () => {
            mockSendMessage.mockResolvedValueOnce({
                response: { text: () => 'Suite de la conversation' }
            });

            await request(app)
                .post(`/api/ai/chat/${testExam.slug}`)
                .set('Authorization', 'Bearer fake-token')
                .send({
                    message: 'Et l\'exercice 2 ?',
                    history: [
                        { role: 'user', content: 'Bonjour' },
                        { role: 'assistant', content: 'Salut, comment puis-je aider ?' }
                    ]
                });

            const startChatCall = mockStartChat.mock.calls[0][0];
            expect(startChatCall.history).toHaveLength(2);
            expect(startChatCall.history[1].role).toBe('model');
        });
    });
});
