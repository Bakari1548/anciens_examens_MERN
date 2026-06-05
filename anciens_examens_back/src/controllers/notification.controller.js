const Notification = require('../models/Notification');
const User = require('../models/User');
const { createLog } = require('../utils/logger');

// @desc    Obtenir les notifications de l'utilisateur connecté
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const filter = { recipient: req.user._id };
    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('recipient', 'firstName lastName email');

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

    res.json({
      notifications,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Marquer une notification comme lue
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: 'Notification non trouvée'
      });
    }

    res.json({
      message: 'Notification marquée comme lue',
      notification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Marquer toutes les notifications comme lues
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      message: 'Toutes les notifications marquées comme lues',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Supprimer une notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        message: 'Notification non trouvée'
      });
    }

    await createLog({ 
      level: 'info', 
      action: 'NOTIFICATION_DELETED', 
      message: `Notification supprimée par ${req.user.email}`, 
      req, 
      user: req.user,
      metadata: { notificationId: notification._id }
    });

    res.json({
      message: 'Notification supprimée',
      notificationId: notification._id
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Supprimer toutes les notifications de l'utilisateur
// @route   DELETE /api/notifications
// @access  Private
const clearAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ recipient: req.user._id });

    await createLog({ 
      level: 'info', 
      action: 'NOTIFICATIONS_CLEARED', 
      message: `Toutes les notifications supprimées par ${req.user.email}`, 
      req, 
      user: req.user,
      metadata: { deletedCount: result.deletedCount }
    });

    res.json({
      message: 'Toutes les notifications supprimées',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Envoyer une notification à un utilisateur
// @route   POST /api/notifications/send
// @access  Private/Admin
const sendNotification = async (req, res) => {
  try {
    const { recipient: recipientId, type, title, message, metadata } = req.body;

    if (!recipientId || !title || !message) {
      return res.status(400).json({
        message: 'recipient, title et message sont requis'
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        message: 'Destinataire non trouvé'
      });
    }

    const notification = await Notification.create({
      recipient: recipient._id,
      type: type || 'system',
      title,
      message,
      metadata: metadata || null
    });

    await createLog({ 
      level: 'info', 
      action: 'NOTIFICATION_SENT', 
      message: `Notification envoyée à ${recipient.email}`, 
      req, 
      user: req.user,
      metadata: { notificationId: notification._id, recipient, type }
    });

    res.status(201).json({
      message: 'Notification envoyée avec succès',
      notification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Envoyer une notification globale à tous les utilisateurs
// @route   POST /api/notifications/global
// @access  Private/Admin
const sendGlobalNotification = async (req, res) => {
  try {
    const { type, title, message, metadata } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        message: 'title et message sont requis'
      });
    }

    const users = await User.find({ status: 'active' });
    
    const notifications = await Notification.insertMany(
      users.map(user => ({
        recipient: user._id,
        type: type || 'system',
        title,
        message,
        metadata: metadata || null
      }))
    );

    await createLog({ 
      level: 'info', 
      action: 'GLOBAL_NOTIFICATION_SENT', 
      message: `Notification globale envoyée à ${users.length} utilisateurs`, 
      req, 
      user: req.user,
      metadata: { notificationCount: notifications.length, type }
    });

    res.status(201).json({
      message: 'Notification globale envoyée avec succès',
      sentTo: users.length,
      notifications: notifications.length
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Envoyer une notification ciblée à plusieurs utilisateurs
// @route   POST /api/notifications/targeted
// @access  Private/Admin
const sendTargetedNotification = async (req, res) => {
  try {
    const { userIds, type, title, message, metadata } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        message: 'userIds est requis et doit être un tableau non vide'
      });
    }

    if (!title || !message) {
      return res.status(400).json({
        message: 'title et message sont requis'
      });
    }

    const users = await User.find({ _id: { $in: userIds }, status: 'active' });

    if (users.length === 0) {
      return res.status(404).json({
        message: 'Aucun utilisateur valide trouvé'
      });
    }

    const notifications = await Notification.insertMany(
      users.map(user => ({
        recipient: user._id,
        type: type || 'system',
        title,
        message,
        metadata: metadata || null
      }))
    );

    await createLog({ 
      level: 'info', 
      action: 'TARGETED_NOTIFICATION_SENT', 
      message: `Notification ciblée envoyée à ${users.length} utilisateurs`, 
      req, 
      user: req.user,
      metadata: { notificationCount: notifications.length, type, userIds }
    });

    res.status(201).json({
      message: 'Notifications ciblées envoyées avec succès',
      sentTo: users.length,
      notifications: notifications.length
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  sendNotification,
  sendGlobalNotification,
  sendTargetedNotification
};
