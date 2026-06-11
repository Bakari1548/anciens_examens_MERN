const User = require('../models/User');
const Exam = require('../models/Exam');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const Log = require('../models/Log');
const sendEmail = require('../utils/sendEmail');
const { createLog } = require('../utils/logger');
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
require('dotenv').config();

// @desc    Obtenir les statistiques du dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalExams = await Exam.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const pendingExams = await Exam.countDocuments({ status: 'pending' });
        const approvedExams = await Exam.countDocuments({ status: 'approved' });
        const reports = await Report.countDocuments({ status: 'pending' });
        
        // Calculer les téléchargements réels depuis les examens
        const downloadsResult = await Exam.aggregate([
            {
                $group: {
                    _id: null,
                    totalDownloads: { $sum: '$downloadsCount' }
                }
            }
        ]);
        const totalDownloads = downloadsResult[0]?.totalDownloads || 0;

        // Calculer les vues réelles depuis les examens
        const viewsResult = await Exam.aggregate([
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$viewsCount' }
                }
            }
        ]);
        const totalViews = viewsResult[0]?.totalViews || 0;

        // === Stockage MongoDB ===
        let dbStorage = { usedBytes: 0, totalBytes: 0 };
        try {
            const dbStats = await mongoose.connection.db.stats();
            const usedBytes = (dbStats.dataSize || 0) + (dbStats.indexSize || 0);
            // Limite configurable via env (défaut: 512 MB = Atlas M0 free tier)
            const totalBytes = (parseFloat(process.env.DB_STORAGE_LIMIT_MB) || 512) * 1024 * 1024;
            dbStorage = { usedBytes, totalBytes };
        } catch (e) {
            console.error('[Stats] Erreur db.stats():', e.message);
        }

        // === Stockage Cloudinary ===
        let cloudinaryStorage = { usedBytes: 0, totalBytes: 0 };
        try {
            const usage = await cloudinary.api.usage();
            cloudinaryStorage = {
                usedBytes: usage?.storage?.usage || 0,
                totalBytes: usage?.storage?.limit || 0
            };
        } catch (e) {
            // Fallback : agréger les tailles de fichiers depuis la base si l'API échoue
            console.warn('[Stats] Cloudinary API unavailable, using DB aggregation as fallback');
            try {
                const cloudinaryFallback = await Exam.aggregate([
                    { $unwind: { path: '$files', preserveNullAndEmptyArrays: false } },
                    {
                        $group: {
                            _id: null,
                            usedBytes: { $sum: '$files.size' }
                        }
                    }
                ]);
                cloudinaryStorage = {
                    usedBytes: cloudinaryFallback[0]?.usedBytes || 0,
                    totalBytes: (parseFloat(process.env.CLOUDINARY_STORAGE_LIMIT_GB) || 25) * 1024 * 1024 * 1024
                };
            } catch (fallbackErr) {
                console.error('[Stats] Fallback aggregation also failed:', fallbackErr.message);
            }
        }

        res.json({
            totalUsers,
            totalExams,
            totalDownloads,
            totalViews,
            activeUsers,
            pendingExams,
            approvedExams,
            reports,
            storage: {
                database: dbStorage,
                cloudinary: cloudinaryStorage
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Obtenir les analytics détaillées
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        
        let startDate;
        const endDate = new Date();
        
        switch (period) {
            case '1d':
                startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            case 'all':
                startDate = new Date(0);
                break;
            default:
                startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        const daysDiff = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
        const dateGroupFormat = daysDiff > 60 ? '%Y-%m' : '%Y-%m-%d';

        const users = await User.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).countDocuments();

        const exams = await Exam.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).countDocuments();

        // Téléchargements réels sur la période
        const downloadsResult = await Exam.aggregate([
            { $group: { _id: null, total: { $sum: '$downloadsCount' } } }
        ]);
        const downloads = downloadsResult[0]?.total || 0;

        // === Données pour graphiques (granularité selon la période) ===
        const [userGrowthAgg, examGrowthAgg] = await Promise.all([
            User.aggregate([
                { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: { $dateToString: { format: dateGroupFormat, date: '$createdAt' } }, newUsers: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            Exam.aggregate([
                { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                { $group: {
                    _id: { $dateToString: { format: dateGroupFormat, date: '$createdAt' } },
                    newExams: { $sum: 1 },
                    approvedExams: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
                    downloads: { $sum: '$downloadsCount' }
                }},
                { $sort: { _id: 1 } }
            ])
        ]);
        const userGrowth = userGrowthAgg.map(d => ({ date: d._id, newUsers: d.newUsers }));
        const examStats = examGrowthAgg.map(d => ({ date: d._id, newExams: d.newExams, approvedExams: d.approvedExams, downloads: d.downloads || 0 }));

        // === Statistiques par UFR ===
        const [ufrUserAgg, ufrExamAgg] = await Promise.all([
            User.aggregate([
                { $match: { ufr: { $exists: true, $ne: '' } } },
                { $group: { _id: '$ufr', usersCount: { $sum: 1 } } }
            ]),
            Exam.aggregate([
                { $match: { ufr: { $exists: true, $ne: '' } } },
                { $group: { _id: '$ufr', examsCount: { $sum: 1 }, downloads: { $sum: '$downloadsCount' } } }
            ])
        ]);

        const ufrMap = {};
        ufrUserAgg.forEach(u => {
            if (u._id) ufrMap[u._id] = { ufr: u._id, users: u.usersCount, exams: 0, downloads: 0 };
        });
        ufrExamAgg.forEach(e => {
            if (!e._id) return;
            if (ufrMap[e._id]) {
                ufrMap[e._id].exams = e.examsCount;
                ufrMap[e._id].downloads = e.downloads;
            } else {
                ufrMap[e._id] = { ufr: e._id, users: 0, exams: e.examsCount, downloads: e.downloads };
            }
        });
        const ufrStats = Object.values(ufrMap).sort((a, b) => b.users - a.users);

        // === Top 5 examens par téléchargements ===
        const topExams = await Exam.find({ status: 'approved' })
            .sort({ viewsCount: -1 })
            .limit(5)
            .select('title ufr downloadsCount viewsCount averageRating slug');

        res.json({
            period,
            startDate,
            endDate,
            users,
            exams,
            downloads,
            userGrowth,
            examStats,
            ufrStats,
            topExams
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Obtenir les sessions de connexion récentes
// @route   GET /api/admin/sessions
// @access  Private/Admin
const getSessions = async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const sessions = await Log.find({ action: 'LOGIN' })
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .select('user userId ip userAgent timestamp message');
        res.json({ sessions, total: sessions.length });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Obtenir tous les signalements
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReports = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, type } = req.query;
        
        let filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;

        const reports = await Report.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('user', 'firstName lastName email')
            .populate('exam', 'title')
            .sort({ createdAt: -1 });

        const total = await Report.countDocuments(filter);

        res.json({
            reports,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Résoudre un signalement
// @route   PATCH /api/admin/reports/:id/resolve
// @access  Private/Admin
const resolveReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { resolution } = req.body;

        const report = await Report.findByIdAndUpdate(
            id,
            { 
                status: 'resolved',
                resolution,
                resolvedAt: new Date(),
                resolvedBy: req.user.id
            },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({
                message: 'Signalement non trouvé'
            });
        }

        await createLog({ level: 'info', action: 'REPORT_RESOLVED', message: `Signalement ${id} résolu`, req, user: req.user, metadata: { reportId: id, resolution } });
        res.json({
            message: 'Signalement résolu avec succès',
            report
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Bannir un utilisateur
// @route   POST /api/admin/users/:id/ban
// @access  Private/Admin
const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { duration, reason } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { 
                status: 'banned',
                banReason: reason,
                banDuration: duration,
                bannedAt: new Date()
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé'
            });
        }

        await createLog({ level: 'warning', action: 'USER_BANNED', message: `Utilisateur ${user.email} banni. Raison: ${reason}`, req, user: req.user, metadata: { targetUserId: id, duration, reason } });
        res.json({
            message: 'Utilisateur banni avec succès',
            user
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Débannir un utilisateur
// @route   POST /api/admin/users/:id/unban
// @access  Private/Admin
const unbanUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id,
            { 
                status: 'active',
                banReason: null,
                banDuration: null,
                bannedAt: null
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé'
            });
        }

        await createLog({ level: 'info', action: 'USER_UNBANNED', message: `Utilisateur ${user.email} débanni`, req, user: req.user, metadata: { targetUserId: id } });
        res.json({
            message: 'Utilisateur débanni avec succès',
            user
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Approuver un examen
// @route   PATCH /api/admin/exams/:id/approve
// @access  Private/Admin
const approveExam = async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await Exam.findByIdAndUpdate(
            id,
            { 
                status: 'approved',
                approvedAt: new Date(),
                approvedBy: req.user.id
            },
            { new: true }
        );

        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        }


        // Envoyer une notification à l'auteur de l'examen
        if (exam.author) {
            await Notification.create({
                recipient: exam.author._id || exam.author,
                type: 'success',
                title: 'Examen approuvé',
                message: `Votre examen "${exam.title}" a été approuvé.`,
                metadata: {
                    examId: exam._id,
                    slug: exam.slug,
                },
                read: false
            });
        }
        await createLog({ level: 'info', action: 'EXAM_APPROVED', message: `Examen approuvé: ${exam.title}`, req, user: req.user, metadata: { examId: exam._id, slug: exam.slug } });
        res.json({
            message: 'Examen approuvé avec succès',
            exam
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Rejeter un examen
// @route   PATCH /api/admin/exams/:id/reject
// @access  Private/Admin
const rejectExam = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const exam = await Exam.findByIdAndUpdate(
            id,
            { 
                status: 'rejected',
                rejectionReason: reason,
                rejectedAt: new Date(),
                rejectedBy: req.user.id
            },
            { new: true }
        );

        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        }

        // Envoyer une notification à l'auteur de l'examen
        if (exam.author) {
            await Notification.create({
                recipient: exam.author._id || exam.author,
                type: 'error',
                title: 'Examen rejeté',
                message: `Votre examen "${exam.title}" a été rejeté. Raison: ${reason}`,
                metadata: {
                    examId: exam._id,
                    slug: exam.slug,
                    reason: reason
                },
                read: false
            });
        }

        await createLog({ level: 'warning', action: 'EXAM_REJECTED', message: `Examen rejeté: ${exam.title}. Raison: ${reason}`, req, user: req.user, metadata: { examId: exam._id, slug: exam.slug, reason } });
        res.json({
            message: 'Examen rejeté avec succès',
            exam
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Envoyer une notification globale
// @route   POST /api/notifications/global
// @access  Private/Admin
const sendGlobalNotification = async (req, res) => {
    try {
        const { title, message, type } = req.body;

        // Simuler l'envoi de notification globale
        // En réalité, vous utiliseriez un service de notifications en temps réel
        console.log('Notification globale envoyée:', { title, message, type });

        res.json({
            message: 'Notification globale envoyée avec succès'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Envoyer une notification ciblée
// @route   POST /api/notifications/targeted
// @access  Private/Admin
const sendNotificationToUsers = async (req, res) => {
    try {
        const { userIds, title, message, type } = req.body;

        // Simuler l'envoi de notifications ciblées
        console.log('Notifications ciblées envoyées:', { userIds, title, message, type });

        res.json({
            message: 'Notifications ciblées envoyées avec succès',
            sentTo: userIds.length
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Obtenir les logs d'audit
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, action, userId, startDate, endDate } = req.query;
        
        let filter = {};
        if (action) filter.action = action;
        if (userId) filter.user = userId;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Simuler des logs d'audit
        const logs = [
            {
                _id: '1',
                action: 'USER_LOGIN',
                user: 'John Doe',
                timestamp: new Date(),
                ip: '192.168.1.1',
                details: 'Connexion réussie'
            },
            {
                _id: '2',
                action: 'EXAM_UPLOAD',
                user: 'Jane Smith',
                timestamp: new Date(),
                ip: '192.168.1.2',
                details: 'Upload examen mathématiques'
            }
        ];

        res.json({
            logs: logs.slice((page - 1) * limit, page * limit),
            total: logs.length,
            totalPages: Math.ceil(logs.length / limit),
            currentPage: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Obtenir les logs système
// @route   GET /api/admin/system-logs
// @access  Private/Admin
const getSystemLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, level, startDate, endDate } = req.query;
        
        // Simuler des logs système
        const logs = [
            {
                _id: '1',
                level: 'info',
                message: 'Serveur démarré',
                timestamp: new Date(),
                service: 'app'
            },
            {
                _id: '2',
                level: 'error',
                message: 'Connexion base de données échouée',
                timestamp: new Date(),
                service: 'database'
            }
        ];

        let filteredLogs = logs;
        if (level) {
            filteredLogs = logs.filter(log => log.level === level);
        }

        res.json({
            logs: filteredLogs.slice((page - 1) * limit, page * limit),
            total: filteredLogs.length,
            totalPages: Math.ceil(filteredLogs.length / limit),
            currentPage: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Créer une sauvegarde
// @route   POST /api/admin/backup/create
// @access  Private/Admin
const createBackup = async (req, res) => {
    try {
        const backup = {
            _id: Date.now().toString(),
            filename: `backup_${new Date().toISOString()}.zip`,
            size: Math.floor(Math.random() * 100000000) + 50000000,
            createdAt: new Date(),
            status: 'completed'
        };

        res.json({
            message: 'Sauvegarde créée avec succès',
            backup
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Lister les sauvegardes
// @route   GET /api/admin/backup/list
// @access  Private/Admin
const getBackups = async (req, res) => {
    try {
        // Simuler une liste de sauvegardes
        const backups = [
            {
                _id: '1',
                filename: 'backup_2024-01-15T10:30:00.000Z.zip',
                size: 75000000,
                createdAt: new Date('2024-01-15T10:30:00.000Z'),
                status: 'completed'
            },
            {
                _id: '2',
                filename: 'backup_2024-01-14T10:30:00.000Z.zip',
                size: 65000000,
                createdAt: new Date('2024-01-14T10:30:00.000Z'),
                status: 'completed'
            }
        ];

        res.json({
            backups
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Restaurer une sauvegarde
// @route   POST /api/admin/backup/restore/:id
// @access  Private/Admin
const restoreBackup = async (req, res) => {
    try {
        const { id } = req.params;

        res.json({
            message: 'Restauration de la sauvegarde initiée',
            backupId: id
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Générer un rapport
// @route   GET /api/admin/reports/generate/:type
// @access  Private/Admin
const generateReport = async (req, res) => {
    try {
        const { type } = req.params;

        const report = {
            _id: Date.now().toString(),
            type,
            generatedAt: new Date(),
            status: 'completed',
            downloadUrl: `/api/admin/reports/download/${Date.now().toString()}`
        };

        res.json({
            message: 'Rapport généré avec succès',
            report
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Lister les rapports
// @route   GET /api/admin/reports/list
// @access  Private/Admin
const getReportsList = async (req, res) => {
    try {
        const reports = [
            {
                _id: '1',
                type: 'users',
                generatedAt: new Date('2024-01-15T10:30:00.000Z'),
                status: 'completed'
            },
            {
                _id: '2',
                type: 'exams',
                generatedAt: new Date('2024-01-14T10:30:00.000Z'),
                status: 'completed'
            }
        ];

        res.json({
            reports
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Télécharger un rapport
// @route   GET /api/admin/reports/download/:id
// @access  Private/Admin
const downloadReport = async (req, res) => {
    try {
        const { id } = req.params;

        // Simuler le téléchargement d'un rapport
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report_${id}.pdf`);
        
        res.send('Contenu PDF du rapport');
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Obtenir les paramètres système
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
    try {
        const settings = {
            siteName: 'Anciens Examens',
            maxFileSize: 10485760, // 10MB
            allowedFileTypes: ['pdf'],
            maintenanceMode: false,
            emailNotifications: true
        };

        res.json(settings);
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Mettre à jour les paramètres système
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        const settings = req.body;

        res.json({
            message: 'Paramètres mis à jour avec succès',
            settings
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

module.exports = {
    getStats,
    getAnalytics,
    getSessions,
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
};
