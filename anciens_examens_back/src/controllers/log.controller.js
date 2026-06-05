const Log = require('../models/Log');

// Créer un log
const createLog = async (req, res) => {
  try {
    const { level, action, user, userId, message, ip, userAgent, metadata } = req.body;

    const log = await Log.create({
      level,
      action,
      user,
      userId,
      message,
      ip,
      userAgent,
      metadata
    });

    res.status(201).json({
      message: 'Log créé avec succès',
      log
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Récupérer tous les logs avec filtres et pagination
const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, level, action, search } = req.query;

    // Construire le filtre
    const filter = {};

    if (level) {
      filter.level = level;
    }

    if (action) {
      filter.action = action;
    }

    if (search) {
      filter.$or = [
        { message: { $regex: search, $options: 'i' } },
        { user: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const logs = await Log.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Log.countDocuments(filter);

    res.status(200).json({
      message: 'Logs récupérés avec succès',
      logs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Récupérer les statistiques des logs
const getLogStats = async (req, res) => {
  try {
    const total = await Log.countDocuments();
    const info = await Log.countDocuments({ level: 'info' });
    const warning = await Log.countDocuments({ level: 'warning' });
    const error = await Log.countDocuments({ level: 'error' });

    res.status(200).json({
      message: 'Statistiques récupérées avec succès',
      stats: {
        total,
        info,
        warning,
        error
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Supprimer les logs anciens (cleanup)
const deleteOldLogs = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await Log.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    res.status(200).json({
      message: 'Logs anciens supprimés avec succès',
      deleted: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Exporter les logs en CSV
const exportLogs = async (req, res) => {
  try {
    const { level, action, startDate, endDate } = req.query;

    const filter = {};

    if (level) {
      filter.level = level;
    }

    if (action) {
      filter.action = action;
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    const logs = await Log.find(filter).sort({ timestamp: -1 });

    // Générer le CSV
    const headers = ['Timestamp', 'Level', 'Action', 'User', 'Message', 'IP'];
    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp.toISOString(),
        log.level,
        log.action,
        log.user,
        `"${log.message.replace(/"/g, '""')}"`,
        log.ip
      ].join(','))
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=logs.csv');
    res.send(csvRows.join('\n'));
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

module.exports = {
  createLog,
  getLogs,
  getLogStats,
  deleteOldLogs,
  exportLogs
};
