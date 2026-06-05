/**
 * Client Redis centralisé pour le cache des métadonnées IA
 */

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

module.exports = {
    getRedisClient,
    cacheExamMetadata,
    getCachedExamMetadata,
    isAvailable
};
