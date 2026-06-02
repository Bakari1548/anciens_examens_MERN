const Exam = require('../models/Exam');
const ufrData = require('../data/ufrData');
const { createLog } = require('../utils/logger');
const gemini = require('../utils/geminiClient');
const redis = require('../utils/redisClient');

const NIVEAUX_VALID = ['L1','L2','L3','L4','M1','M2','D1','D2','D3','D4','D5','D6','PCEM1','PCEM2','DCEM1','DCEM2','DCEM3','DCEM4','LP','ING1','ING2','ING3','DUT1','DUT2'];
const SEMESTRES_VALID = ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12'];
const TYPES_EXAMEN = ['Examen Final', 'Session de Rattrapage', 'Devoir', 'TD/TP'];

// Rate limiter en mémoire pour le chat (par utilisateur, par heure)
const chatRateLimit = new Map();
const CHAT_LIMIT_PER_HOUR = 20;

const getUfrContext = () => {
    const ufrs = Object.keys(ufrData);
    const filieres = [];
    for (const ufr of ufrs) {
        const f = Object.keys(ufrData[ufr]?.filieres || {});
        filieres.push(...f);
    }
    return {
        ufrs,
        filieres: [...new Set(filieres)],
        niveaux: NIVEAUX_VALID,
        semestres: SEMESTRES_VALID,
        typesExamen: TYPES_EXAMEN
    };
};

/**
 * @desc Analyse un fichier d'examen et retourne métadonnées + extraction d'exercices
 * @route POST /api/ai/analyze-exam
 * @access Private
 */
const analyzeExamFile = async (req, res) => {
    try {
        if (!gemini.isAvailable()) {
            return res.status(503).json({ message: 'Service IA non configuré (GEMINI_API_KEY manquante)' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Fichier requis' });
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ message: 'Type de fichier non supporté' });
        }

        const result = await gemini.analyzeExam({
            buffer: req.file.buffer,
            mimeType: req.file.mimetype,
            context: getUfrContext()
        });

        if (!result) {
            return res.status(502).json({ message: 'L\'IA n\'a pas pu analyser ce fichier' });
        }

        await createLog({
            level: 'info',
            action: 'AI_ANALYZE_EXAM',
            message: `Analyse IA d'un examen (${req.file.originalname})`,
            req,
            user: req.user,
            metadata: { fileName: req.file.originalname, exercisesCount: result.aiExtraction?.exercises?.length || 0 }
        });

        res.status(200).json({
            success: true,
            metadata: result.metadata,
            aiExtraction: result.aiExtraction
        });
    } catch (error) {
        console.error('Erreur analyzeExamFile:', error);
        await createLog({ level: 'error', action: 'AI_ANALYZE_FAILED', message: `Échec analyse IA: ${error.message}`, req, user: req.user });
        res.status(500).json({ message: 'Erreur lors de l\'analyse IA', error: error.message });
    }
};

/**
 * @desc Vérifie si un examen est un doublon en comparant les exercices à ceux des examens existants
 * @route POST /api/ai/check-duplicate
 * @access Private
 *
 * Body : { ufr, filiere, matiere, aiExtraction: { exercises, globalSummary } }
 */
const checkDuplicate = async (req, res) => {
    try {
        if (!gemini.isAvailable()) {
            return res.status(503).json({ message: 'Service IA non configuré' });
        }

        const { ufr, filiere, matiere, aiExtraction } = req.body;

        if (!aiExtraction || !Array.isArray(aiExtraction.exercises) || aiExtraction.exercises.length === 0) {
            return res.status(400).json({ message: 'aiExtraction.exercises requis' });
        }

        // Étape 1 : filtre MongoDB rapide (ufr + filiere + matiere, status approved)
        // On élargit en ne filtrant pas sur l'année pour détecter les réutilisations.
        const query = { status: 'approved' };
        if (ufr) query.ufr = ufr;
        if (filiere) query.filiere = filiere;
        if (matiere) query.matiere = new RegExp(`^${matiere.trim()}`, 'i');

        const candidates = await Exam.find(query)
            .select('_id slug title ufr filiere matiere anneeExamen typeExamen aiExtraction')
            .limit(5)
            .lean();

        // Filtrer ceux qui ont une extraction IA exploitable
        const usableCandidates = candidates.filter(
            c => c.aiExtraction && Array.isArray(c.aiExtraction.exercises) && c.aiExtraction.exercises.length > 0
        );

        if (usableCandidates.length === 0) {
            return res.status(200).json({
                isDuplicate: false,
                matches: [],
                checkedCount: candidates.length,
                message: candidates.length === 0
                    ? 'Aucun examen similaire trouvé'
                    : 'Examens trouvés mais sans extraction IA disponible'
            });
        }

        // Étape 2 : comparaison IA exercice par exercice
        const comparison = await gemini.compareExams(
            aiExtraction,
            usableCandidates.map(c => ({
                examId: c._id,
                slug: c.slug,
                title: c.title,
                aiExtraction: c.aiExtraction
            }))
        );

        // Enrichir les matches avec les infos des examens
        const matches = (comparison.matches || []).map(m => {
            const candidate = usableCandidates.find(c => String(c._id) === String(m.examId));
            return {
                ...m,
                slug: candidate?.slug,
                title: candidate?.title,
                ufr: candidate?.ufr,
                filiere: candidate?.filiere,
                matiere: candidate?.matiere,
                anneeExamen: candidate?.anneeExamen,
                typeExamen: candidate?.typeExamen
            };
        });

        // Filtrer les doublons réels (verdict exact ou partial avec >= 0.5)
        const significantMatches = matches.filter(
            m => m.verdict === 'exact' || (m.verdict === 'partial' && (m.globalSimilarity || 0) >= 0.5)
        );

        await createLog({
            level: 'info',
            action: 'AI_CHECK_DUPLICATE',
            message: `Vérification doublon: ${significantMatches.length}/${usableCandidates.length} matches`,
            req,
            user: req.user,
            metadata: { ufr, filiere, matiere, candidatesCount: usableCandidates.length }
        });

        res.status(200).json({
            isDuplicate: significantMatches.length > 0,
            matches: significantMatches,
            allMatches: matches,
            checkedCount: usableCandidates.length
        });
    } catch (error) {
        console.error('Erreur checkDuplicate:', error);
        await createLog({ level: 'error', action: 'AI_CHECK_DUPLICATE_FAILED', message: error.message, req, user: req.user });
        res.status(500).json({ message: 'Erreur lors de la vérification', error: error.message });
    }
};

/**
 * @desc Préparer le cache Redis avec les métadonnées IA d'un examen
 * @route POST /api/ai/prepare/:slug
 * @access Private
 */
const prepareChatCache = async (req, res) => {
    try {
        const { slug } = req.params;

        const exam = await Exam.findOne({ slug }).select('aiExtraction').lean();
        if (!exam) {
            return res.status(404).json({ message: 'Examen non trouvé' });
        }

        // Vérifier si les métadonnées IA existent
        if (!exam.aiExtraction || !exam.aiExtraction.exercises || exam.aiExtraction.exercises.length === 0) {
            return res.status(404).json({ message: 'Aucune métadonnée IA disponible pour cet examen' });
        }

        // Stocker les métadonnées dans Redis (1 heure TTL)
        const metadata = {
            exercises: exam.aiExtraction.exercises,
            globalSummary: exam.aiExtraction.globalSummary || '',
            matiere: exam.matiere,
            typeExamen: exam.typeExamen,
            niveau: exam.niveau,
            semestre: exam.semestre,
            filiere: exam.filiere
        };

        const cached = await redis.cacheExamMetadata(slug, metadata);
        if (!cached) {
            return res.status(503).json({ message: 'Cache non disponible' });
        }

        res.json({ success: true, message: 'Cache préparé avec succès' });
    } catch (error) {
        console.error('[AI Prepare] Erreur:', error);
        res.status(500).json({ message: 'Erreur lors de la préparation du cache' });
    }
};

/**
 * @desc Chatbot tuteur pédagogique sur un examen
 * @route POST /api/ai/chat/:slug
 * @access Private
 *
 * Body : { message, history: [{ role: 'user'|'assistant', content: '...' }] }
 */
const chatWithExam = async (req, res) => {
    try {
        if (!gemini.isAvailable()) {
            return res.status(503).json({ message: 'Service IA non configuré' });
        }

        const { slug } = req.params;
        const { message, history = [] } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ message: 'Message requis' });
        }
        if (message.length > 2000) {
            return res.status(400).json({ message: 'Message trop long (max 2000 caractères)' });
        }

        // Rate limit
        const userId = String(req.user._id);
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;
        const userCalls = (chatRateLimit.get(userId) || []).filter(t => t > oneHourAgo);
        if (userCalls.length >= CHAT_LIMIT_PER_HOUR) {
            return res.status(429).json({
                message: `Limite atteinte (${CHAT_LIMIT_PER_HOUR} messages/heure). Réessayez plus tard.`
            });
        }

        const exam = await Exam.findOne({ slug }).select('-comments -likes -views').lean();
        if (!exam) {
            return res.status(404).json({ message: 'Examen non trouvé' });
        }

        // Essayer de récupérer les métadonnées depuis Redis
        const cachedMetadata = await redis.getCachedExamMetadata(slug);

        // Si pas de cache et premier message, charger les fichiers
        let fileParts = [];
        if (!cachedMetadata && history.length === 0 && exam.files && exam.files.length > 0) {
            const firstFile = exam.files[0];
            try {
                fileParts = [await gemini.buildFilePart({
                    url: firstFile.url,
                    mimeType: firstFile.mimeType
                })];
            } catch (err) {
                console.warn('[AI Chat] Échec chargement fichier examen:', err.message);
            }
        }

        // Construire l'historique au format Gemini
        const geminiHistory = history.map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content || '' }]
        }));

        // Utiliser les métadonnées du cache si disponibles, sinon l'examen complet
        const examContext = cachedMetadata || exam;

        const reply = await gemini.chatWithExam({
            fileParts,
            exam: examContext,
            history: geminiHistory,
            message
        });

        // Enregistrer l'appel pour le rate limiter
        userCalls.push(now);
        chatRateLimit.set(userId, userCalls);

        await createLog({
            level: 'info',
            action: 'AI_CHAT',
            message: `Chat IA sur examen ${slug}`,
            req,
            user: req.user,
            metadata: { slug, messageLength: message.length, historyLength: history.length }
        });

        res.status(200).json({ reply });
    } catch (error) {
        console.error('Erreur chatWithExam:', error);
        await createLog({ level: 'error', action: 'AI_CHAT_FAILED', message: error.message, req, user: req.user });
        res.status(500).json({ message: 'Erreur lors de la discussion IA', error: error.message });
    }
};

module.exports = {
    analyzeExamFile,
    checkDuplicate,
    prepareChatCache,
    chatWithExam
};
