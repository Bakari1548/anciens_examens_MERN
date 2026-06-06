const fs = require('fs');
const path = require('path');

const HISTORY_FILE = path.join(__dirname, '../data/emailHistory.json');

/**
 * Initialiser le fichier d'historique s'il n'existe pas
 */
const initHistoryFile = (customPath = null) => {
  const filePath = customPath || HISTORY_FILE;
  const dataDir = path.dirname(filePath);
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Ajouter un envoi d'email à l'historique
 */
const addEmailToHistory = (emailData, customPath = null) => {
  initHistoryFile(customPath);
  
  try {
    const filePath = customPath || HISTORY_FILE;
    const history = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const newEntry = {
      id: Date.now().toString(),
      ...emailData,
      sentAt: new Date().toISOString()
    };
    
    history.unshift(newEntry); // Ajouter au début
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
    
    return newEntry;
  } catch (error) {
    console.error('Erreur lors de l\'ajout à l\'historique:', error);
    return null;
  }
};

/**
 * Récupérer l'historique des emails
 */
const getEmailHistory = (page = 1, limit = 20, customPath = null) => {
  initHistoryFile(customPath);
  
  try {
    const filePath = customPath || HISTORY_FILE;
    const history = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const total = history.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedHistory = history.slice(startIndex, endIndex);
    
    return {
      emails: paginatedHistory,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  } catch (error) {
    console.error('Erreur lors de la lecture de l\'historique:', error);
    return {
      emails: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    };
  }
};

module.exports = {
  addEmailToHistory,
  getEmailHistory,
  HISTORY_FILE
};
