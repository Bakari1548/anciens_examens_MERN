const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  sendNotification,
  sendGlobalNotification,
  sendTargetedNotification
} = require('../controllers/notification.controller');

// Routes utilisateur - notifications personnelles
router.get('/', authMiddleware, getUserNotifications);
router.patch('/:id/read', authMiddleware, markAsRead);
router.patch('/read-all', authMiddleware, markAllAsRead);
router.delete('/:id', authMiddleware, deleteNotification);
router.delete('/', authMiddleware, clearAllNotifications);

// Routes admin - envoyer des notifications
router.post('/send', adminMiddleware, sendNotification);
router.post('/global', adminMiddleware, sendGlobalNotification);
router.post('/targeted', adminMiddleware, sendTargetedNotification);

module.exports = router;
