/**
 * Client Redis centralisé pour le cache des métadonnées IA
 */

const crypto = require('crypto');

// Désactiver Redis dans l'environnement de test
const isTestEnv = process.env.NODE_ENV === 'test';

let createClient = null;
try {
    const redisModule = require('redis');
    createClient = redisModule.createClient;
} catch (e) {
    if (!isTestEnv) {
        console.warn('[Redis] Module redis non installé - fonctionnalités de cache désactivées');
    }
}

let redisClient = null;

const getRedisClient = async () => {
    if (isTestEnv) {
        return null; // Désactiver Redis pendant les tests
    }
    if (!createClient) {
        throw new Error('Module Redis non installé');
    }
    if (!redisClient) {
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        redisClient.on('error', (err) => {
            console.warn('[Redis] Erreur de connexion:', err.message);
        });

        redisClient.on('connect', () => {
            console.log('[Redis] Connecté');
        });

        try {
            await redisClient.connect();
        } catch (err) {
            console.warn('[Redis] Échec de connexion, fonctionnalités de cache désactivées:', err.message);
            redisClient = null;
        }
    }
    return redisClient;
};

const cacheExamMetadata = async (examSlug, metadata) => {
    try {
        const client = await getRedisClient();
        if (!client) return false;

        const key = `exam:${examSlug}:ai_metadata`;
        const value = JSON.stringify(metadata);
        await client.setEx(key, 3600, value); // 1 heure TTL
        return true;
    } catch (err) {
        console.warn('[Redis] Erreur cache metadata:', err.message);
        return false;
    }
};

const getCachedExamMetadata = async (examSlug) => {
    try {
        const client = await getRedisClient();
        if (!client) return null;

        const key = `exam:${examSlug}:ai_metadata`;
        const value = await client.get(key);
        return value ? JSON.parse(value) : null;
    } catch (err) {
        console.warn('[Redis] Erreur récupération metadata:', err.message);
        return null;
    }
};

const isAvailable = () => !!redisClient;

// ============================================================
// CACHE DES DÉTAILS D'EXAMEN
// ============================================================

const cacheExamDetails = async (examSlug, examData) => {
    try {
        const client = await getRedisClient();
        if (!client) return false;
        const key = `exam:${examSlug}:details`;
        await client.setEx(key, 1800, JSON.stringify(examData)); // 30 min TTL
        return true;
    } catch (err) {
        console.warn('[Redis] Erreur cache exam details:', err.message);
        return false;
    }
};

const getCachedExamDetails = async (examSlug) => {
    try {
        const client = await getRedisClient();
        if (!client) return null;
        const key = `exam:${examSlug}:details`;
        const value = await client.get(key);
        return value ? JSON.parse(value) : null;
    } catch (err) {
        console.warn('[Redis] Erreur récupération exam details:', err.message);
        return null;
    }
};

const invalidateExamDetailsCache = async (examSlug) => {
    try {
        const client = await getRedisClient();
        if (!client) return false;
        await client.del(`exam:${examSlug}:details`);
        return true;
    } catch (err) {
        console.warn('[Redis] Erreur invalidation exam details:', err.message);
        return false;
    }
};

// ============================================================
// CACHE DES RÉSULTATS DE RECHERCHE
// filtrage des valeurs undefined/null avant le hash
// ============================================================

const generateSearchHash = (params) => {
    const filteredParams = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
        .sort()
        .reduce((acc, key) => {
            acc[key] = params[key];
            return acc;
        }, {});
    return crypto.createHash('md5').update(JSON.stringify(filteredParams)).digest('hex');
};

const cacheSearchResults = async (params, results) => {
    try {
        const client = await getRedisClient();
        if (!client) return false;
        const key = `search:${generateSearchHash(params)}`;
        await client.setEx(key, 600, JSON.stringify(results)); // 10 min TTL
        return true;
    } catch (err) {
        console.warn('[Redis] Erreur cache search:', err.message);
        return false;
    }
};

const getCachedSearchResults = async (params) => {
    try {
        const client = await getRedisClient();
        if (!client) return null;
        const key = `search:${generateSearchHash(params)}`;
        const value = await client.get(key);
        return value ? JSON.parse(value) : null;
    } catch (err) {
        console.warn('[Redis] Erreur récupération search:', err.message);
        return null;
    }
};

// SCAN pour ne pas bloquer Redis en production
const invalidateAllSearchCache = async () => {
    try {
        const client = await getRedisClient();
        if (!client) return false;
        let cursor = 0;
        do {
            const result = await client.scan(cursor, { MATCH: 'search:*', COUNT: 100 });
            cursor = result.cursor;
            if (result.keys.length > 0) {
                await client.del(result.keys);
            }
        } while (cursor !== 0);
        return true;
    } catch (err) {
        console.warn('[Redis] Erreur invalidation search cache:', err.message);
        return false;
    }
};

// ============================================================
// CACHE DES STATISTIQUES (VUES / TÉLÉCHARGEMENTS)
// pas de double écriture — Redis est le seul point d'entrée,
//              flushStatsToMongoDB synchronise ensuite
// SCAN au lieu de KEYS dans flushStatsToMongoDB
// parseInt pour la comparaison string→number
// bulkWrite au lieu d'updates individuels
// ============================================================

const incrementViewInCache = async (examSlug) => {
    try {
        const client = await getRedisClient();
        if (!client) return false;
        const key = `stats:${examSlug}`;
        await client.hIncrBy(key, 'views', 1);
        await client.expire(key, 300); // 5 min TTL
        return true;
    } catch (err) {
        console.warn('[Redis] Erreur increment view:', err.message);
        return false;
    }
};

const incrementDownloadInCache = async (examSlug) => {
    try {
        const client = await getRedisClient();
        if (!client) return false;
        const key = `stats:${examSlug}`;
        await client.hIncrBy(key, 'downloads', 1);
        await client.expire(key, 300); // 5 min TTL
        return true;
    } catch (err) {
        console.warn('[Redis] Erreur increment download:', err.message);
        return false;
    }
};

/**
 * Synchronise les stats Redis vers MongoDB.
 * @param {import('mongoose').Model} Exam - Le modèle Mongoose Exam
 *        (passé en paramètre pour éviter les dépendances circulaires)
 */
const flushStatsToMongoDB = async (Exam) => {
    try {
        const client = await getRedisClient();
        if (!client) return;

        // FIX Bug 2 : utiliser SCAN (non-bloquant) au lieu de KEYS
        const allKeys = [];
        let cursor = 0;
        do {
            const result = await client.scan(cursor, { MATCH: 'stats:*', COUNT: 100 });
            cursor = result.cursor;
            allKeys.push(...result.keys);
        } while (cursor !== 0);

        if (allKeys.length === 0) return;

        const bulkOps = [];
        for (const key of allKeys) {
            const stats = await client.hGetAll(key);
            const examSlug = key.replace('stats:', '');
            // FIX Bug 4 : parseInt pour éviter la comparaison string > 0
            const views = parseInt(stats.views, 10) || 0;
            const downloads = parseInt(stats.downloads, 10) || 0;

            if (views > 0 || downloads > 0) {
                const inc = {};
                if (views > 0) inc.views = views;
                if (downloads > 0) inc.downloads = downloads;
                // FIX Bug 9 : accumuler en bulkWrite
                bulkOps.push({
                    updateOne: {
                        filter: { slug: examSlug },
                        update: { $inc: inc }
                    }
                });
            }
        }

        // un seul appel MongoDB au lieu de N appels individuels
        if (bulkOps.length > 0) {
            await Exam.bulkWrite(bulkOps);
        }

        // Supprimer toutes les clés traitées en une seule commande
        if (allKeys.length > 0) {
            await client.del(allKeys);
        }
    } catch (err) {
        console.error('[Redis] Erreur flush stats:', err);
    }
};

// ============================================================
// CACHE DES FAVORIS UTILISATEUR
// ============================================================

const cacheUserFavorites = async (userId, favorites) => {
    try {
        const client = await getRedisClient();
        if (!client) return false;
        await client.setEx(`favorites:${userId}`, 3600, JSON.stringify(favorites)); // 1 h TTL
        return true;
    } catch (err) {
        console.warn('[Redis] Erreur cache favorites:', err.message);
        return false;
    }
};

const getCachedUserFavorites = async (userId) => {
    try {
        const client = await getRedisClient();
        if (!client) return null;
        const value = await client.get(`favorites:${userId}`);
        return value ? JSON.parse(value) : null;
    } catch (err) {
        console.warn('[Redis] Erreur récupération favorites:', err.message);
        return null;
    }
};

const invalidateUserFavoritesCache = async (userId) => {
    try {
        const client = await getRedisClient();
        if (!client) return false;
        await client.del(`favorites:${userId}`);
        return true;
    } catch (err) {
        console.warn('[Redis] Erreur invalidation favorites:', err.message);
        return false;
    }
};

// ============================================================
// CACHE DES COMMENTAIRES
// ============================================================

const cacheExamComments = async (examSlug, comments) => {
    try {
        const client = await getRedisClient();
        if (!client) return false;
        await client.setEx(`comments:${examSlug}`, 600, JSON.stringify(comments)); // 10 min TTL
        return true;
    } catch (err) {
        console.warn('[Redis] Erreur cache comments:', err.message);
        return false;
    }
};

const getCachedExamComments = async (examSlug) => {
    try {
        const client = await getRedisClient();
        if (!client) return null;
        const value = await client.get(`comments:${examSlug}`);
        return value ? JSON.parse(value) : null;
    } catch (err) {
        console.warn('[Redis] Erreur récupération comments:', err.message);
        return null;
    }
};

const invalidateExamCommentsCache = async (examSlug) => {
    try {
        const client = await getRedisClient();
        if (!client) return false;
        await client.del(`comments:${examSlug}`);
        return true;
    } catch (err) {
        console.warn('[Redis] Erreur invalidation comments:', err.message);
        return false;
    }
};

// ============================================================
// CACHE DES DONNÉES DE RÉFÉRENCE (UFR, filières, etc.)
// ============================================================

const cacheReferenceData = async (type, data) => {
    try {
        const client = await getRedisClient();
        if (!client) return false;
        await client.setEx(`reference:${type}`, 43200, JSON.stringify(data)); // 12 h TTL
        return true;
    } catch (err) {
        console.warn('[Redis] Erreur cache reference:', err.message);
        return false;
    }
};

const getCachedReferenceData = async (type) => {
    try {
        const client = await getRedisClient();
        if (!client) return null;
        const value = await client.get(`reference:${type}`);
        return value ? JSON.parse(value) : null;
    } catch (err) {
        console.warn('[Redis] Erreur récupération reference:', err.message);
        return null;
    }
};

// ============================================================
// RATE LIMITING
// pattern atomique SET NX EX + INCR
//   → élimine la race condition entre incr() et expire()
// ============================================================

const checkRateLimit = async (userId, endpoint, limit, windowSeconds) => {
    try {
        const client = await getRedisClient();
        if (!client) return { allowed: true };

        const key = `ratelimit:${userId}:${endpoint}`;

        // initialiser la clé atomiquement avec son expiry AVANT d'incrémenter
        // SET key 0 NX EX windowSeconds — ne fait rien si la clé existe déjà
        await client.set(key, 0, { NX: true, EX: windowSeconds });

        // INCR est toujours atomique côté Redis
        const current = await client.incr(key);

        return {
            allowed: current <= limit,
            remaining: Math.max(0, limit - current),
            reset: windowSeconds
        };
    } catch (err) {
        console.warn('[Redis] Erreur rate limit:', err.message);
        return { allowed: true };
    }
};

// ============================================================
// CACHE DE DÉTECTION DE DOUBLONS
// tri des exercices avant le hash
//   → même contenu dans un ordre différent = même hash
// ============================================================

const generateDuplicateHash = (newExtraction, candidateIds) => {
    // trier les exercices pour un hash stable indépendant de l'ordre
    const sortedExercises = [...(newExtraction.exercises || [])].sort((a, b) =>
        JSON.stringify(a).localeCompare(JSON.stringify(b))
    );
    const exerciseHash = crypto.createHash('md5')
        .update(JSON.stringify(sortedExercises))
        .digest('hex');
    const candidatesHash = crypto.createHash('md5')
        .update([...candidateIds].sort().join(','))
        .digest('hex');
    return `${exerciseHash}:${candidatesHash}`;
};

const cacheDuplicateResult = async (hash, result) => {
    try {
        const client = await getRedisClient();
        if (!client) return false;
        await client.setEx(`duplicate:${hash}`, 3600, JSON.stringify(result)); // 1 h TTL
        return true;
    } catch (err) {
        console.warn('[Redis] Erreur cache duplicate:', err.message);
        return false;
    }
};

const getCachedDuplicateResult = async (hash) => {
    try {
        const client = await getRedisClient();
        if (!client) return null;
        const value = await client.get(`duplicate:${hash}`);
        return value ? JSON.parse(value) : null;
    } catch (err) {
        console.warn('[Redis] Erreur récupération duplicate:', err.message);
        return null;
    }
};

module.exports = {
    getRedisClient,
    isAvailable,
    // Métadonnées IA
    cacheExamMetadata,
    getCachedExamMetadata,
    // Détails d'examen
    cacheExamDetails,
    getCachedExamDetails,
    invalidateExamDetailsCache,
    // Recherche
    generateSearchHash,
    cacheSearchResults,
    getCachedSearchResults,
    invalidateAllSearchCache,
    // Statistiques
    incrementViewInCache,
    incrementDownloadInCache,
    flushStatsToMongoDB,
    // Favoris
    cacheUserFavorites,
    getCachedUserFavorites,
    invalidateUserFavoritesCache,
    // Commentaires
    cacheExamComments,
    getCachedExamComments,
    invalidateExamCommentsCache,
    // Données de référence
    cacheReferenceData,
    getCachedReferenceData,
    // Rate limiting
    checkRateLimit,
    // Détection de doublons
    generateDuplicateHash,
    cacheDuplicateResult,
    getCachedDuplicateResult,
};
