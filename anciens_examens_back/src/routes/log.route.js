const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const {
  createLog,
  getLogs,
  getLogStats,
  deleteOldLogs,
  exportLogs
} = require('../controllers/log.controller');

// Créer un log (accessible uniquement par le système ou admin)
router.post('/', authMiddleware, createLog);

// Récupérer tous les logs (admin uniquement)
router.get('/', authMiddleware, getLogs);

// Récupérer les statistiques des logs (admin uniquement)
router.get('/stats', authMiddleware, getLogStats);

// Exporter les logs (admin uniquement)
router.get('/export', authMiddleware, exportLogs);

// Supprimer les logs anciens (admin uniquement)
router.delete('/cleanup', authMiddleware, deleteOldLogs);

module.exports = router;
