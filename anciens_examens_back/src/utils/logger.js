const Log = require('../models/Log');

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
    let displayName = userName || 'System';
    let userId = null;

    if (user) {
      displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Utilisateur';
      userId = user._id || user.id || null;
    }

    const ip = getClientIp(req);
    const userAgent = req?.headers?.['user-agent'] || null;

    await Log.create({
      level,
      action,
      user: displayName,
      userId,
      message,
      ip,
      userAgent,
      metadata
    });
  } catch (error) {
    // On évite de casser le flux applicatif si le log échoue
    console.error('[Logger] Erreur lors de la création du log:', error.message);
  }
};

module.exports = { createLog, getClientIp };
