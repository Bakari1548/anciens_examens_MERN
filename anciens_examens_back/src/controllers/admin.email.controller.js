const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail');
const adminEmailTemplate = require('../templates/adminEmailTemplate');
const { addEmailToHistory, getEmailHistory } = require('../utils/emailHistory');
const fs = require('fs');
const path = require('path');

const RECEIVED_EMAILS_FILE = path.join(__dirname, '../../data/receivedEmails.json');

/**
 * Initialiser le fichier des emails reçus
 */
const initReceivedEmailsFile = () => {
  const dataDir = path.dirname(RECEIVED_EMAILS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(RECEIVED_EMAILS_FILE)) {
    fs.writeFileSync(RECEIVED_EMAILS_FILE, JSON.stringify([], null, 2));
  }
};

/**
 * Endpoint de test pour simuler un webhook Resend
 */
exports.testWebhook = async (req, res) => {
  try {
    const testEmail = {
      from: 'test@example.com',
      to: 'onboarding@anciensexamensuidt.app',
      subject: 'Test webhook - ' + new Date().toISOString(),
      text: 'Ceci est un email de test pour le webhook Resend.',
      html: '<p>Ceci est un email de test pour le webhook Resend.</p>',
      receivedAt: new Date().toISOString()
    };
    
    // Simuler le webhook
    req.body = testEmail;
    await exports.receiveEmailWebhook(req, res);
  } catch (error) {
    console.error('Erreur test webhook:', error);
    res.status(500).json({ message: 'Erreur lors du test webhook', error: error.message });
  }
};

/**
 * Webhook pour recevoir les emails via Resend
 */
exports.receiveEmailWebhook = async (req, res) => {
  try {
    console.log('Webhook reçu - Body:', JSON.stringify(req.body, null, 2));
    console.log('Webhook reçu - Headers:', JSON.stringify(req.headers, null, 2));
    
    const emailData = req.body;
    
    initReceivedEmailsFile();
    
    const receivedEmails = JSON.parse(fs.readFileSync(RECEIVED_EMAILS_FILE, 'utf8'));
    
    const newEmail = {
      id: Date.now().toString(),
      from: emailData.from || emailData.email?.from || emailData.payload?.from || emailData.data?.from || 'Unknown',
      to: emailData.to || emailData.email?.to || emailData.payload?.to || emailData.data?.to || 'Unknown',
      subject: emailData.subject || emailData.email?.subject || emailData.payload?.subject || emailData.data?.subject || 'Sans sujet',
      text: emailData.text || emailData.email?.text || emailData.payload?.text || emailData.data?.text || '',
      html: emailData.html || emailData.email?.html || emailData.payload?.html || emailData.data?.html || '',
      receivedAt: new Date().toISOString(),
      raw: emailData
    };
    
    console.log('Email parsé:', newEmail);
    
    receivedEmails.unshift(newEmail);
    
    // Garder seulement les 100 derniers emails
    if (receivedEmails.length > 100) {
      receivedEmails.splice(100);
    }
    
    fs.writeFileSync(RECEIVED_EMAILS_FILE, JSON.stringify(receivedEmails, null, 2));
    
    console.log('Email sauvegardé, total:', receivedEmails.length);
    
    res.status(200).json({ message: 'Email reçu et stocké' });
  } catch (error) {
    console.error('Erreur webhook email:', error);
    res.status(500).json({ message: 'Erreur lors du traitement du webhook', error: error.message });
  }
};

/**
 * Envoyer un email à des utilisateurs spécifiques
 */
exports.sendEmailToUsers = async (req, res) => {
  try {
    const { userIds, subject, message } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Aucun utilisateur spécifié' });
    }

    if (!subject || !message) {
      return res.status(400).json({ message: 'Le sujet et le message sont requis' });
    }

    // Récupérer les emails des utilisateurs
    const users = await User.find({ _id: { $in: userIds } }).select('email firstName lastName');
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur trouvé' });
    }

    // Envoyer les emails
    const emailPromises = users.map(user => {
      const html = adminEmailTemplate({
        subject,
        message,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email
      });

      return sendEmail(user.email, subject, html);
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;
    
    // Sauvegarder dans l'historique JSON
    addEmailToHistory({
      subject,
      message,
      recipientType: 'specific',
      recipientCount: users.length,
      recipientIds: userIds,
      sender: req.user ? req.user._id : null,
      senderName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Admin',
      status: failed === 0 ? 'sent' : successful === 0 ? 'failed' : 'partial',
      successfulCount: successful,
      failedCount: failed
    });
    
    res.status(200).json({
      message: 'Emails envoyés avec succès',
      total: results.length,
      successful,
      failed
    });
  } catch (error) {
    console.error('Erreur envoi email aux utilisateurs:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi des emails', error: error.message });
  }
};

/**
 * Envoyer un email à tous les utilisateurs
 */
exports.sendEmailToAll = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Le sujet et le message sont requis' });
    }

    // Récupérer tous les utilisateurs actifs
    const users = await User.find({ status: 'active' }).select('email firstName lastName');
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur actif trouvé' });
    }

    // Envoyer les emails
    const emailPromises = users.map(user => {
      const html = adminEmailTemplate({
        subject,
        message,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email
      });

      return sendEmail(user.email, subject, html);
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    // Sauvegarder dans l'historique JSON
    addEmailToHistory({
      subject,
      message,
      recipientType: 'all',
      recipientCount: users.length,
      sender: req.user ? req.user._id : null,
      senderName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Admin',
      status: failed === 0 ? 'sent' : successful === 0 ? 'failed' : 'partial',
      successfulCount: successful,
      failedCount: failed
    });

    res.status(200).json({
      message: 'Emails envoyés avec succès',
      total: results.length,
      successful,
      failed
    });
  } catch (error) {
    console.error('Erreur envoi email à tous:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi des emails', error: error.message });
  }
};

/**
 * Envoyer un email à des utilisateurs par rôle
 */
exports.sendEmailByRole = async (req, res) => {
  try {
    const { role, subject, message } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Le rôle est requis' });
    }

    if (!subject || !message) {
      return res.status(400).json({ message: 'Le sujet et le message sont requis' });
    }

    // Récupérer les utilisateurs par rôle
    const users = await User.find({ role, status: 'active' }).select('email firstName lastName');
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur trouvé pour ce rôle' });
    }

    // Envoyer les emails
    const emailPromises = users.map(user => {
      const html = adminEmailTemplate({
        subject,
        message,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email
      });

      return sendEmail(user.email, subject, html);
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    // Sauvegarder dans l'historique JSON
    addEmailToHistory({
      subject,
      message,
      recipientType: 'role',
      recipientCount: users.length,
      recipientRole: role,
      sender: req.user ? req.user._id : null,
      senderName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Admin',
      status: failed === 0 ? 'sent' : successful === 0 ? 'failed' : 'partial',
      successfulCount: successful,
      failedCount: failed
    });

    res.status(200).json({
      message: 'Emails envoyés avec succès',
      total: results.length,
      successful,
      failed
    });
  } catch (error) {
    console.error('Erreur envoi email par rôle:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi des emails', error: error.message });
  }
};

/**
 * Récupérer les emails reçus
 */
exports.getReceivedEmails = async (req, res) => {
  try {
    initReceivedEmailsFile();
    
    const receivedEmails = JSON.parse(fs.readFileSync(RECEIVED_EMAILS_FILE, 'utf8'));
    
    res.status(200).json({ emails: receivedEmails });
  } catch (error) {
    console.error('Erreur récupération emails reçus:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des emails reçus', error: error.message });
  }
};

/**
 * Récupérer l'historique des emails envoyés
 */
exports.getEmailHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const history = getEmailHistory(parseInt(page), parseInt(limit));
    
    // Récupérer aussi les emails reçus
    initReceivedEmailsFile();
    const receivedEmails = JSON.parse(fs.readFileSync(RECEIVED_EMAILS_FILE, 'utf8'));
    
    res.status(200).json({
      ...history,
      receivedEmails: receivedEmails.slice(0, 20) // Limiter à 20 emails reçus
    });
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique', error: error.message });
  }
};
