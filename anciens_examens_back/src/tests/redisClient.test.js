/**
 * Tests unitaires pour src/utils/redisClient.js
 *
 * Stratégie :
 *  - Fonctions pures (generateSearchHash, generateDuplicateHash) → testées directement.
 *  - Fonctions dépendant du client Redis → NODE_ENV temporairement overridé +
 *    jest.resetModules() + jest.doMock('redis') pour injecter un faux client.
 */

// ============================================================
// 1. FONCTIONS PURES — pas de Redis nécessaire
// ============================================================

describe('generateSearchHash — Bug 5 : filtrage des paramètres undefined/null/vide', () => {
    const { generateSearchHash } = require('../utils/redisClient');

    test('produit le même hash si une clé est undefined', () => {
        const withUndef  = { page: 1, limit: 12, filiere: undefined };
        const withoutKey = { page: 1, limit: 12 };
        expect(generateSearchHash(withUndef)).toBe(generateSearchHash(withoutKey));
    });

    test('produit le même hash si une clé est null', () => {
        const withNull   = { page: 1, filiere: null };
        const withoutKey = { page: 1 };
        expect(generateSearchHash(withNull)).toBe(generateSearchHash(withoutKey));
    });

    test('produit le même hash si une clé est une chaîne vide', () => {
        const withEmpty  = { page: 1, search: '' };
        const withoutKey = { page: 1 };
        expect(generateSearchHash(withEmpty)).toBe(generateSearchHash(withoutKey));
    });

    test('hash stable indépendamment de l\'ordre des clés', () => {
        const p1 = { page: 1, limit: 12, filiere: 'info' };
        const p2 = { filiere: 'info', limit: 12, page: 1 };
        expect(generateSearchHash(p1)).toBe(generateSearchHash(p2));
    });

    test('hash différent pour des paramètres différents', () => {
        const p1 = { page: 1, filiere: 'info' };
        const p2 = { page: 2, filiere: 'info' };
        expect(generateSearchHash(p1)).not.toBe(generateSearchHash(p2));
    });

    test('plusieurs clés undefined ne changent pas le hash', () => {
        const full   = { page: 1, filiere: undefined, ufr: null, search: '' };
        const minimal = { page: 1 };
        expect(generateSearchHash(full)).toBe(generateSearchHash(minimal));
    });
});

describe('generateDuplicateHash — Bug 6 : tri des exercices avant le hash', () => {
    const { generateDuplicateHash } = require('../utils/redisClient');

    const exA = { text: 'Exercice A', points: 5 };
    const exB = { text: 'Exercice B', points: 10 };
    const ids  = ['id1', 'id2', 'id3'];

    test('hash stable quel que soit l\'ordre des exercices', () => {
        const h1 = generateDuplicateHash({ exercises: [exA, exB] }, ids);
        const h2 = generateDuplicateHash({ exercises: [exB, exA] }, ids);
        expect(h1).toBe(h2);
    });

    test('hash stable quel que soit l\'ordre des candidats', () => {
        const h1 = generateDuplicateHash({ exercises: [exA] }, ['id1', 'id2']);
        const h2 = generateDuplicateHash({ exercises: [exA] }, ['id2', 'id1']);
        expect(h1).toBe(h2);
    });

    test('hash différent pour des exercices différents', () => {
        const h1 = generateDuplicateHash({ exercises: [exA] }, ids);
        const h2 = generateDuplicateHash({ exercises: [exB] }, ids);
        expect(h1).not.toBe(h2);
    });

    test('hash différent pour des candidats différents', () => {
        const h1 = generateDuplicateHash({ exercises: [exA] }, ['id1']);
        const h2 = generateDuplicateHash({ exercises: [exA] }, ['id2']);
        expect(h1).not.toBe(h2);
    });

    test('gère un tableau d\'exercices vide', () => {
        const hash = generateDuplicateHash({ exercises: [] }, ids);
        expect(typeof hash).toBe('string');
        expect(hash).toMatch(/^[a-f0-9]+:[a-f0-9]+$/);
    });

    test('gère exercises absent de l\'extraction', () => {
        const hash = generateDuplicateHash({}, ids);
        expect(typeof hash).toBe('string');
    });
});

// ============================================================
// 2. FONCTIONS REDIS — client injecté via jest.doMock
// ============================================================

/**
 * Fabrique un faux client Redis dont on peut contrôler les réponses.
 */
function buildMockClient(overrides = {}) {
    return {
        setEx:    jest.fn().mockResolvedValue('OK'),
        get:      jest.fn().mockResolvedValue(null),
        del:      jest.fn().mockResolvedValue(1),
        hIncrBy:  jest.fn().mockResolvedValue(1),
        expire:   jest.fn().mockResolvedValue(1),
        hGetAll:  jest.fn().mockResolvedValue({}),
        set:      jest.fn().mockResolvedValue('OK'),
        incr:     jest.fn().mockResolvedValue(1),
        scan:     jest.fn().mockResolvedValue({ cursor: 0, keys: [] }),
        on:       jest.fn(),
        connect:  jest.fn().mockResolvedValue(),
        ...overrides,
    };
}

/**
 * Charge redisClient.js avec un faux client Redis injecté.
 * Nécessite jest.resetModules() au préalable.
 */
function loadModuleWithMock(mockClient) {
    jest.doMock('redis', () => ({ createClient: () => mockClient }));
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development'; // contourner isTestEnv = true
    const mod = require('../utils/redisClient');
    process.env.NODE_ENV = origEnv;
    return mod;
}

// ---- checkRateLimit (Bug 3 : race condition) ---------------------------

describe('checkRateLimit — Bug 3 : pattern atomique SET NX EX + INCR', () => {
    let checkRateLimit;
    let mockClient;

    beforeEach(() => {
        jest.resetModules();
        mockClient = buildMockClient();
        ({ checkRateLimit } = loadModuleWithMock(mockClient));
    });

    afterEach(() => {
        jest.dontMock('redis');
    });

    test('initialise la clé avec SET NX EX avant INCR (atomique)', async () => {
        mockClient.incr.mockResolvedValueOnce(1);
        await checkRateLimit('user1', '/api/exams', 10, 60);

        // SET doit être appelé AVANT INCR
        const setOrder  = mockClient.set.mock.invocationCallOrder[0];
        const incrOrder = mockClient.incr.mock.invocationCallOrder[0];
        expect(setOrder).toBeLessThan(incrOrder);

        // SET doit utiliser NX + EX
        expect(mockClient.set).toHaveBeenCalledWith(
            'ratelimit:user1:/api/exams',
            0,
            { NX: true, EX: 60 }
        );
    });

    test('retourne allowed:true quand sous la limite', async () => {
        mockClient.incr.mockResolvedValueOnce(3);
        const result = await checkRateLimit('user1', '/api/exams', 5, 60);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(2);
    });

    test('retourne allowed:false quand la limite est dépassée', async () => {
        mockClient.incr.mockResolvedValueOnce(6);
        const result = await checkRateLimit('user1', '/api/exams', 5, 60);
        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
    });

    test('retourne allowed:true si Redis est indisponible (dégradation gracieuse)', async () => {
        mockClient.set.mockRejectedValueOnce(new Error('Redis down'));
        const result = await checkRateLimit('user1', '/api/exams', 5, 60);
        expect(result.allowed).toBe(true);
    });
});

// ---- flushStatsToMongoDB (Bugs 1, 2, 4, 9) ---------------------------

describe('flushStatsToMongoDB — Bugs 1/2/4/9 : SCAN + parseInt + bulkWrite', () => {
    let flushStatsToMongoDB;
    let mockClient;
    let mockExam;

    beforeEach(() => {
        jest.resetModules();
        mockClient = buildMockClient({
            scan: jest.fn()
                .mockResolvedValueOnce({ cursor: 0, keys: ['stats:exam-a', 'stats:exam-b'] }),
            hGetAll: jest.fn()
                .mockResolvedValueOnce({ views: '5', downloads: '2' })   // exam-a
                .mockResolvedValueOnce({ views: '0', downloads: '3' }), // exam-b
        });
        mockExam = { bulkWrite: jest.fn().mockResolvedValue({}) };
        ({ flushStatsToMongoDB } = loadModuleWithMock(mockClient));
    });

    afterEach(() => {
        jest.dontMock('redis');
    });

    test('utilise SCAN et non KEYS (Bug 2)', async () => {
        await flushStatsToMongoDB(mockExam);
        expect(mockClient.scan).toHaveBeenCalled();
        // KEYS ne doit jamais être appelé (il n'existe pas dans notre mock)
        expect(mockClient.keys).toBeUndefined();
    });

    test('appelle bulkWrite une seule fois pour tous les slugs (Bug 9)', async () => {
        await flushStatsToMongoDB(mockExam);
        expect(mockExam.bulkWrite).toHaveBeenCalledTimes(1);
        const ops = mockExam.bulkWrite.mock.calls[0][0];
        expect(ops).toHaveLength(2); // exam-a et exam-b
    });

    test('utilise parseInt pour les valeurs de stats (Bug 4)', async () => {
        await flushStatsToMongoDB(mockExam);
        const ops = mockExam.bulkWrite.mock.calls[0][0];
        const opA = ops.find(o => o.updateOne.filter.slug === 'exam-a');
        expect(opA.updateOne.update.$inc.views).toBe(5);      // nombre, pas string
        expect(opA.updateOne.update.$inc.downloads).toBe(2);
    });

    test('n\'inclut pas les champs à 0 dans $inc', async () => {
        await flushStatsToMongoDB(mockExam);
        const ops = mockExam.bulkWrite.mock.calls[0][0];
        const opA = ops.find(o => o.updateOne.filter.slug === 'exam-a');
        const opB = ops.find(o => o.updateOne.filter.slug === 'exam-b');
        expect(opA.updateOne.update.$inc).not.toHaveProperty('views', 0);
        expect(opB.updateOne.update.$inc).not.toHaveProperty('views'); // views = 0
        expect(opB.updateOne.update.$inc.downloads).toBe(3);
    });

    test('supprime toutes les clés après le flush', async () => {
        await flushStatsToMongoDB(mockExam);
        expect(mockClient.del).toHaveBeenCalledWith(['stats:exam-a', 'stats:exam-b']);
    });

    test('ne fait rien si aucune clé stats n\'existe', async () => {
        jest.resetModules();
        const emptyClient = buildMockClient({
            scan: jest.fn().mockResolvedValue({ cursor: 0, keys: [] }),
        });
        jest.dontMock('redis');
        const { flushStatsToMongoDB: flush } = loadModuleWithMock(emptyClient);
        await flush(mockExam);
        expect(mockExam.bulkWrite).not.toHaveBeenCalled();
    });
});

// ---- cacheExamDetails / getCachedExamDetails (Bug général : fallback) ----

describe('cacheExamDetails / getCachedExamDetails', () => {
    let cacheExamDetails;
    let getCachedExamDetails;
    let invalidateExamDetailsCache;
    let mockClient;

    const fakeExam = { slug: 'test-exam', title: 'Mon Examen' };

    beforeEach(() => {
        jest.resetModules();
        mockClient = buildMockClient();
        ({ cacheExamDetails, getCachedExamDetails, invalidateExamDetailsCache } =
            loadModuleWithMock(mockClient));
    });

    afterEach(() => {
        jest.dontMock('redis');
    });

    test('cache l\'examen avec TTL 1800 s', async () => {
        await cacheExamDetails('test-exam', fakeExam);
        expect(mockClient.setEx).toHaveBeenCalledWith(
            'exam:test-exam:details',
            1800,
            JSON.stringify(fakeExam)
        );
    });

    test('retourne l\'examen depuis le cache', async () => {
        mockClient.get.mockResolvedValueOnce(JSON.stringify(fakeExam));
        const result = await getCachedExamDetails('test-exam');
        expect(result).toEqual(fakeExam);
    });

    test('retourne null si le cache est vide', async () => {
        mockClient.get.mockResolvedValueOnce(null);
        const result = await getCachedExamDetails('test-exam');
        expect(result).toBeNull();
    });

    test('supprime la clé lors de l\'invalidation', async () => {
        await invalidateExamDetailsCache('test-exam');
        expect(mockClient.del).toHaveBeenCalledWith('exam:test-exam:details');
    });
});

// ---- invalidateAllSearchCache (Bug 2 : SCAN) ----

describe('invalidateAllSearchCache — Bug 2 : SCAN au lieu de KEYS', () => {
    let invalidateAllSearchCache;
    let mockClient;

    beforeEach(() => {
        jest.resetModules();
        mockClient = buildMockClient({
            scan: jest.fn()
                .mockResolvedValueOnce({ cursor: 5,  keys: ['search:abc'] })
                .mockResolvedValueOnce({ cursor: 0,  keys: ['search:def', 'search:ghi'] }),
        });
        ({ invalidateAllSearchCache } = loadModuleWithMock(mockClient));
    });

    afterEach(() => {
        jest.dontMock('redis');
    });

    test('itère jusqu\'à cursor === 0 (pagination SCAN)', async () => {
        await invalidateAllSearchCache();
        expect(mockClient.scan).toHaveBeenCalledTimes(2);
    });

    test('supprime toutes les clés trouvées', async () => {
        await invalidateAllSearchCache();
        expect(mockClient.del).toHaveBeenCalledWith(['search:abc']);
        expect(mockClient.del).toHaveBeenCalledWith(['search:def', 'search:ghi']);
    });
});
