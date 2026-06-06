const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Récupérer les emails reçus via Resend
 * @param {number} limit - Nombre d'emails à récupérer (max 100)
 * @returns {Promise<Array>} Liste des emails reçus
 */
const getReceivedEmails = async (limit = 20) => {
  try {
    // Resend API pour récupérer les emails reçus
    // Note: Resend n'a pas d'API publique directe pour récupérer les emails reçus
    // Vous devez utiliser les webhooks ou l'API des domaines
    
    // Alternative: Utiliser l'API des domaines pour vérifier l'activité
    const response = await resend.domains.list();
    
    // Pour l'instant, retourner un tableau vide car Resend n'expose pas directement
    // les emails reçus via leur API publique
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des emails reçus:', error);
    return [];
  }
};

/**
 * Récupérer les emails reçus via webhooks stockés
 * Cette fonction suppose que les webhooks Resend sont stockés quelque part
 * @returns {Promise<Array>} Liste des emails reçus
 */
const getReceivedEmailsFromWebhooks = async () => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const WEBHOOK_FILE = path.join(__dirname, '../data/receivedEmails.json');
    
    if (!fs.existsSync(WEBHOOK_FILE)) {
      return [];
    }
    
    const emails = JSON.parse(fs.readFileSync(WEBHOOK_FILE, 'utf8'));
    return emails.slice(0, 50); // Limiter à 50 emails
  } catch (error) {
    console.error('Erreur lors de la récupération des webhooks:', error);
    return [];
  }
};

module.exports = {
  getReceivedEmails,
  getReceivedEmailsFromWebhooks
};
