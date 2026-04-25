const express = require('express');
const router = express.Router();
const { 
    getStats,
    getAnalytics,
    getReports,
    resolveReport,
    banUser,
    unbanUser,
    approveExam,
    rejectExam,
    sendGlobalNotification,
    sendNotificationToUsers,
    getAuditLogs,
    getSystemLogs,
    createBackup,
    getBackups,
    restoreBackup,
    generateReport,
    getReportsList,
    downloadReport,
    getSettings,
    updateSettings
} = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

// Routes protégées par admin middleware
router.get('/stats', authMiddleware, adminMiddleware, getStats);
router.get('/analytics', authMiddleware, adminMiddleware, getAnalytics);

// Modération et signalements
router.get('/reports', authMiddleware, adminMiddleware, getReports);
router.get('/reports/:id', authMiddleware, adminMiddleware, getReports);
router.patch('/reports/:id/resolve', authMiddleware, adminMiddleware, resolveReport);

// Gestion utilisateurs (admin)
router.post('/users/:id/ban', authMiddleware, adminMiddleware, banUser);
router.post('/users/:id/unban', authMiddleware, adminMiddleware, unbanUser);

// Gestion examens (admin)
router.patch('/exams/:id/approve', authMiddleware, adminMiddleware, approveExam);
router.patch('/exams/:id/reject', authMiddleware, adminMiddleware, rejectExam);

// Notifications
router.post('/notifications/global', authMiddleware, adminMiddleware, sendGlobalNotification);
router.post('/notifications/targeted', authMiddleware, adminMiddleware, sendNotificationToUsers);
router.get('/notifications', authMiddleware, adminMiddleware, getSettings);

// Système et maintenance
router.get('/audit-logs', authMiddleware, adminMiddleware, getAuditLogs);
router.get('/system-logs', authMiddleware, adminMiddleware, getSystemLogs);
router.post('/backup/create', authMiddleware, adminMiddleware, createBackup);
router.get('/backup/list', authMiddleware, adminMiddleware, getBackups);
router.post('/backup/restore/:id', authMiddleware, adminMiddleware, restoreBackup);

// Paramètres et configuration
router.get('/settings', authMiddleware, adminMiddleware, getSettings);
router.put('/settings', authMiddleware, adminMiddleware, updateSettings);
router.get('/reports/generate/:type', authMiddleware, adminMiddleware, generateReport);
router.get('/reports/list', authMiddleware, adminMiddleware, getReportsList);
router.get('/reports/download/:id', authMiddleware, adminMiddleware, downloadReport);

module.exports = router;
