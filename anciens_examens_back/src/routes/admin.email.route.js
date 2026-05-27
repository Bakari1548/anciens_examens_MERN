const express = require('express');
const router = express.Router();
const {
  sendEmailToUsers,
  sendEmailToAll,
  sendEmailByRole,
  getEmailHistory
} = require('../controllers/admin.email.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

// Toutes les routes nécessitent une authentification admin
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route   POST /api/admin/emails/send
 * @desc    Envoyer un email à des utilisateurs spécifiques
 * @access  Admin
 */
router.post('/send', sendEmailToUsers);

/**
 * @route   POST /api/admin/emails/send-all
 * @desc    Envoyer un email à tous les utilisateurs
 * @access  Admin
 */
router.post('/send-all', sendEmailToAll);

/**
 * @route   POST /api/admin/emails/send-by-role
 * @desc    Envoyer un email à des utilisateurs par rôle
 * @access  Admin
 */
router.post('/send-by-role', sendEmailByRole);

/**
 * @route   GET /api/admin/emails/history
 * @desc    Récupérer l'historique des emails envoyés
 * @access  Admin
 */
router.get('/history', getEmailHistory);

module.exports = router;
