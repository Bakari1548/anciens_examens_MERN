/**
 * Client Google Gemini centralisé pour les fonctionnalités IA :
 * - Analyse d'examen (auto-remplissage du formulaire)
 * - Extraction des exercices (cache BDD pour la détection de doublons)
 * - Comparaison d'examens (détection de doublons)
 * - Chat tuteur pédagogique
 */

let GoogleGenerativeAI = null;
try {
    const module = require('@google/generative-ai');
    GoogleGenerativeAI = module.GoogleGenerativeAI || module;
} catch (e) {
    console.warn('[geminiClient] @google/generative-ai non installé - fonctionnalités IA désactivées');
}

require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// Retry avec délai exponentiel pour erreurs 429
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (err.status === 429 && i < maxRetries - 1) {
                const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
                console.warn(`[Gemini] Rate limit (429), retry dans ${delay}ms (tentative ${i + 1}/${maxRetries})`);
                await sleep(delay);
            } else {
                throw err;
            }
        }
    }
};

let genAI = null;
const getClient = () => {
    if (!GoogleGenerativeAI) {
        throw new Error('SDK Google Generative AI non installé');
    }
    if (!API_KEY) {
        throw new Error('GEMINI_API_KEY manquante dans les variables d\'environnement');
    }
    if (!genAI) {
        genAI = new GoogleGenerativeAI(API_KEY);
    }
    return genAI;
};

/**
 * Télécharge un fichier depuis une URL et retourne ses bytes en base64.
 * Utilisé pour transmettre les fichiers Cloudinary à Gemini Vision.
 */
const fetchFileAsBase64 = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Échec téléchargement fichier: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.toString('base64');
};

/**
 * Construit une partie inlineData pour Gemini à partir d'un buffer ou d'une URL.
 */
const buildFilePart = async ({ buffer, mimeType, url }) => {
    let data;
    if (buffer) {
        data = Buffer.isBuffer(buffer) ? buffer.toString('base64') : buffer;
    } else if (url) {
        data = await fetchFileAsBase64(url);
    } else {
        throw new Error('buildFilePart: buffer ou url requis');
    }
    return {
        inlineData: {
            mimeType: mimeType || 'application/pdf',
            data
        }
    };
};

/**
 * Extrait un objet JSON depuis la réponse texte de Gemini.
 * Gemini renvoie parfois le JSON entouré de ```json ... ```.
 */
const extractJSON = (text) => {
    if (!text) return null;
    const cleaned = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*$/g, '')
        .trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (match) {
            try { return JSON.parse(match[0]); } catch { /* ignore */ }
        }
        return null;
    }
};

const generateContent = async ({ parts, systemInstruction, temperature = 0.2, responseMimeType }) => {
    return retryWithBackoff(async () => {
        const client = getClient();
        const model = client.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction,
            generationConfig: {
                temperature,
                ...(responseMimeType ? { responseMimeType } : {})
            }
        });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts }]
        });
        return result.response.text();
    }, 3); // 3 retries
};

/**
 * Feature #1 : analyse un fichier d'examen et retourne les métadonnées + exercices extraits.
 *
 * @param {Object} options
 * @param {Buffer|string} options.buffer - Buffer du fichier (ou base64 string)
 * @param {string} options.mimeType - MIME type du fichier
 * @param {string} [options.url] - alternative au buffer (URL Cloudinary)
 * @param {Object} options.context - { ufrs: [...], niveaux: [...], semestres: [...], typesExamen: [...] }
 * @returns {Promise<{ metadata: Object, aiExtraction: Object } | null>}
 */
const analyzeExam = async ({ buffer, mimeType, url, context = {} }) => {
    const filePart = await buildFilePart({ buffer, mimeType, url });

    const niveauxValid = context.niveaux || ['L1','L2','L3','M1','M2','D1','D2','D3','PCEM1','PCEM2','DCEM1','DCEM2','DCEM3','DCEM4','LP','ING1','ING2','ING3','DUT1','DUT2'];
    const semestresValid = context.semestres || ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12'];
    const typesExamen = context.typesExamen || ['Examen Final', 'Session de Rattrapage', 'Devoir', 'TD/TP'];
    const ufrsList = (context.ufrs || []).slice(0, 30).join(' | ') || '(liste non fournie)';
    const filieresList = (context.filieres || []).slice(0, 100).join(' | ') || '(liste non fournie)';

    const systemInstruction = `Tu es un assistant qui analyse des sujets d'examen universitaires (Université de Thiès, Sénégal). Tu réponds STRICTEMENT en JSON valide, sans texte autour, sans markdown.`;

    const prompt = `Analyse ce sujet d'examen et extrais ses métadonnées ET ses exercices.

CONTRAINTES STRICTES :
- niveau ∈ [${niveauxValid.join(', ')}]
- semestre ∈ [${semestresValid.join(', ')}]
- typeExamen ∈ [${typesExamen.join(', ')}]
- ufr : choisis parmi cette liste si possible, sinon laisse vide → ${ufrsList}
- filiere : choisis parmi cette liste si possible, sinon laisse vide → ${filieresList}
- anneeExamen : format "YYYY-YYYY" si trouvé (ex: "2023-2024"), sinon vide
- matiere : nom de la matière (ex: "Algèbre Linéaire", "Programmation Java")
- description : 1 à 2 phrases résumant le contenu

Pour chaque exercice détecté :
- number : "Exercice 1", "Question 1", "Problème 1", etc.
- title : titre court de l'exercice si présent (sinon vide)
- statement : résumé de l'énoncé (max 400 caractères)
- keywords : 3 à 8 mots-clés représentatifs

Retourne EXACTEMENT ce format JSON (sans aucun texte autour) :
{
  "metadata": {
    "ufr": "",
    "filiere": "",
    "niveau": "",
    "semestre": "",
    "anneeExamen": "",
    "typeExamen": "",
    "matiere": "",
    "description": ""
  },
  "aiExtraction": {
    "globalSummary": "résumé global de l'examen en 2-3 phrases",
    "exercises": [
      { "number": "Exercice 1", "title": "", "statement": "...", "keywords": ["..."] }
    ]
  }
}`;

    const text = await generateContent({
        parts: [filePart, { text: prompt }],
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json'
    });

    const data = extractJSON(text);
    if (!data || !data.metadata) return null;

    // Garde-fous : nettoyer les valeurs hors enum
    if (!niveauxValid.includes(data.metadata.niveau)) data.metadata.niveau = '';
    if (!semestresValid.includes(data.metadata.semestre)) data.metadata.semestre = '';
    if (!typesExamen.includes(data.metadata.typeExamen)) data.metadata.typeExamen = '';

    if (!data.aiExtraction) data.aiExtraction = { exercises: [], globalSummary: '' };
    if (!Array.isArray(data.aiExtraction.exercises)) data.aiExtraction.exercises = [];

    return data;
};

/**
 * Feature #2 : compare les exercices d'un nouvel examen avec ceux d'examens candidats déjà en BDD.
 * @param {Object} newExtraction - { exercises, globalSummary }
 * @param {Array} candidates - [{ examId, slug, title, aiExtraction: { exercises, globalSummary } }]
 * @returns {Promise<{ matches: Array }>}
 */
const compareExams = async (newExtraction, candidates) => {
    if (!candidates || candidates.length === 0) {
        return { matches: [] };
    }

    const systemInstruction = `Tu es un détecteur de doublons d'examens universitaires. Tu compares des exercices et tu réponds UNIQUEMENT en JSON valide, sans markdown.`;

    const newPayload = {
        globalSummary: newExtraction.globalSummary || '',
        exercises: (newExtraction.exercises || []).map(e => ({
            number: e.number,
            title: e.title || '',
            statement: e.statement || '',
            keywords: e.keywords || []
        }))
    };

    const candidatesPayload = candidates.map(c => ({
        examId: String(c.examId),
        title: c.title,
        globalSummary: c.aiExtraction?.globalSummary || '',
        exercises: (c.aiExtraction?.exercises || []).map(e => ({
            number: e.number,
            title: e.title || '',
            statement: e.statement || '',
            keywords: e.keywords || []
        }))
    }));

    const prompt = `Compare le NOUVEL examen aux EXAMENS EXISTANTS, exercice par exercice.

Deux exercices sont "similaires" si :
- même énoncé / même question (similarity ≥ 0.8 → identique)
- même thématique mais variantes numériques (similarity 0.5–0.8 → partiel)
- thématique différente → ignore

Pour chaque examen existant, retourne :
- matchedExercises : tableau des correspondances [{ newExNumber, existingExNumber, similarity (0..1) }]
- globalSimilarity : moyenne pondérée (0..1)
- verdict : "exact" (≥0.85), "partial" (0.4–0.85), "different" (<0.4)

NOUVEL EXAMEN:
${JSON.stringify(newPayload, null, 2)}

EXAMENS EXISTANTS:
${JSON.stringify(candidatesPayload, null, 2)}

Retourne UNIQUEMENT ce JSON :
{
  "matches": [
    {
      "examId": "...",
      "matchedExercises": [{ "newExNumber": "Exercice 1", "existingExNumber": "Exercice 1", "similarity": 0.92 }],
      "globalSimilarity": 0.85,
      "verdict": "exact"
    }
  ]
}`;

    const text = await generateContent({
        parts: [{ text: prompt }],
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json'
    });

    const data = extractJSON(text);
    if (!data || !Array.isArray(data.matches)) return { matches: [] };
    return data;
};

/**
 * Feature #3 : chatbot tuteur pédagogique sur un examen.
 * @param {Object} options
 * @param {Array} options.fileParts - parties inlineData des fichiers de l'examen
 * @param {Object} options.exam - métadonnées de l'examen
 * @param {Array} options.history - historique de conversation [{role, parts:[{text}]}]
 * @param {string} options.message - nouveau message utilisateur
 */
const chatWithExam = async ({ fileParts = [], exam, history = [], message }) => {
    const client = getClient();

    const systemInstruction = `Tu es un TUTEUR PÉDAGOGIQUE pour les étudiants de l'Université de Thiès.
Tu aides l'étudiant à comprendre cet examen :
- Matière : ${exam?.matiere || 'inconnue'}
- Type : ${exam?.typeExamen || ''}
- Niveau : ${exam?.niveau || ''} ${exam?.semestre || ''}
- Filière : ${exam?.filiere || ''}

RÈGLES IMPORTANTES :
1. Donne des INDICES et des EXPLICATIONS, pas des solutions complètes immédiates.
2. Si l'étudiant insiste pour avoir la réponse, donne-la mais EXPLIQUE chaque étape pédagogiquement.
3. Encourage la réflexion : pose des questions guidées avant de révéler la solution.
4. Utilise un français clair, accessible, avec exemples si pertinent.
5. Refuse poliment les questions hors-sujet (non liées à l'examen ou aux études).
6. Format Markdown : utilise **gras**, listes, et formules en LaTeX entre $ pour les maths.`;

    const model = client.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction,
        generationConfig: { temperature: 0.4 }
    });

    // Construire le contenu : si premier message, joindre les fichiers de l'examen
    const userParts = [...fileParts, { text: message }];

    const chat = model.startChat({
        history: history.map(h => ({
            role: h.role === 'assistant' ? 'model' : h.role,
            parts: Array.isArray(h.parts) ? h.parts : [{ text: h.parts || '' }]
        }))
    });

    const result = await retryWithBackoff(async () => {
        return await chat.sendMessage(userParts);
    }, 3);
    return result.response.text();
};

module.exports = {
    analyzeExam,
    compareExams,
    chatWithExam,
    buildFilePart,
    fetchFileAsBase64,
    extractJSON,
    isAvailable: () => !!API_KEY
};
