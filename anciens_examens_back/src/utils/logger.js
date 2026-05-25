const Log = require('../models/Log');

// Durées de rétention par niveau (en millisecondes)
const RETENTION_BY_LEVEL = {
  info: 7 * 24 * 60 * 60 * 1000,     // 7 jours
  warning: 30 * 24 * 60 * 60 * 1000, // 30 jours
  error: 90 * 24 * 60 * 60 * 1000    // 90 jours
};

// Limites de taille
const MAX_METADATA_SIZE = 1024;      // 1 KB
const MAX_USER_AGENT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 500;

// Actions de routine à ne PAS persister en base (console seulement)
const SKIP_DB_ACTIONS = new Set([
  // Ajoutez ici les actions trop verbeuses si besoin
]);

/**
 * Extrait l'adresse IP de la requête
 */
const getClientIp = (req) => {
  if (!req) return 'localhost';
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'localhost'
  );
};

/**
 * Tronque les metadata si elles dépassent la taille maximale
 */
const truncateMetadata = (metadata) => {
  try {
    const serialized = JSON.stringify(metadata);
    if (serialized.length <= MAX_METADATA_SIZE) {
      return metadata;
    }
    return {
      _truncated: true,
      _originalSize: serialized.length,
      preview: serialized.substring(0, MAX_METADATA_SIZE - 100)
    };
  } catch {
    return { _error: 'metadata non sérialisable' };
  }
};

/**
 * Crée une entrée de log
 * @param {Object} options - Options du log
 * @param {string} options.level - 'info' | 'warning' | 'error'
 * @param {string} options.action - Code d'action (ex: 'LOGIN', 'EXAM_UPLOAD')
 * @param {string} options.message - Description lisible du log
 * @param {Object} [options.req] - Requête Express (pour extraire IP, user-agent)
 * @param {Object} [options.user] - Utilisateur Mongoose (firstName, lastName, _id)
 * @param {string} [options.userName] - Nom override si pas de user
 * @param {Object} [options.metadata] - Données supplémentaires (objet libre)
 */
const createLog = async ({ level = 'info', action, message, req, user, userName, metadata = {} } = {}) => {
  try {
    // Skip DB persistence pour certaines actions verbeuses (console seulement)
    if (SKIP_DB_ACTIONS.has(action)) {
      console.log(`[${level.toUpperCase()}] ${action}: ${message}`);
      return;
    }

    let displayName = userName || 'System';
    let userId = null;

    if (user) {
      displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Utilisateur';
      userId = user._id || user.id || null;
    }

    const ip = getClientIp(req);
    const userAgent = req?.headers?.['user-agent']
      ? String(req.headers['user-agent']).substring(0, MAX_USER_AGENT_LENGTH)
      : null;

    // Calculer la date d'expiration selon le niveau
    const retentionMs = RETENTION_BY_LEVEL[level] || RETENTION_BY_LEVEL.info;
    const expiresAt = new Date(Date.now() + retentionMs);

    // Tronquer message et metadata pour borner la taille
    const truncatedMessage = String(message || '').substring(0, MAX_MESSAGE_LENGTH);
    const truncatedMetadata = truncateMetadata(metadata);

    await Log.create({
      level,
      action,
      user: displayName,
      userId,
      message: truncatedMessage,
      ip,
      userAgent,
      metadata: truncatedMetadata,
      expiresAt
    });
  } catch (error) {
    // On évite de casser le flux applicatif si le log échoue
    console.error('[Logger] Erreur lors de la création du log:', error.message);
  }
};

module.exports = { createLog, getClientIp };
