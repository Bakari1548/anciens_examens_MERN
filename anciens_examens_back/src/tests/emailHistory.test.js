const fs = require('fs');
const path = require('path');
const os = require('os');
const { addEmailToHistory, getEmailHistory } = require('../utils/emailHistory');

describe('EmailHistory Utils', () => {
  let tempHistoryFile;
  
  beforeEach(() => {
    // Créer un fichier temporaire pour les tests
    tempHistoryFile = path.join(os.tmpdir(), `emailHistory-${Date.now()}.json`);
    fs.writeFileSync(tempHistoryFile, '[]');
  });

  afterEach(() => {
    // Nettoyer le fichier temporaire
    if (fs.existsSync(tempHistoryFile)) {
      fs.unlinkSync(tempHistoryFile);
    }
  });

  describe('addEmailToHistory', () => {
    it('devrait ajouter un email à l\'historique', () => {
      const emailData = {
        subject: 'Test Subject',
        message: 'Test Message',
        recipientType: 'specific',
        recipientCount: 5
      };

      const result = addEmailToHistory(emailData, tempHistoryFile);

      expect(result).not.toBeNull();
      expect(result.subject).toBe('Test Subject');
      
      const fileContent = fs.readFileSync(tempHistoryFile, 'utf8');
      const history = JSON.parse(fileContent);
      
      expect(history).toHaveLength(1);
      expect(history[0].subject).toBe('Test Subject');
      expect(history[0]).toHaveProperty('id');
      expect(history[0]).toHaveProperty('sentAt');
    });

    it('devrait créer le fichier d\'historique s\'il n\'existe pas', () => {
      const newTempFile = path.join(os.tmpdir(), `new-emailHistory-${Date.now()}.json`);
      
      // Supprimer le fichier temporaire s'il existe
      if (fs.existsSync(newTempFile)) {
        fs.unlinkSync(newTempFile);
      }

      addEmailToHistory({
        subject: 'Test',
        message: 'Test message',
        recipientType: 'all',
        recipientCount: 10
      }, newTempFile);

      expect(fs.existsSync(newTempFile)).toBe(true);
      
      // Nettoyer
      if (fs.existsSync(newTempFile)) {
        fs.unlinkSync(newTempFile);
      }
    });

    it('devrait gérer les erreurs de lecture/écriture', () => {
      // Tester avec un fichier JSON invalide
      const invalidFile = path.join(os.tmpdir(), `invalid-emailHistory-${Date.now()}.json`);
      fs.writeFileSync(invalidFile, 'invalid json content');

      const result = addEmailToHistory({ subject: 'Test', message: 'Test' }, invalidFile);
      expect(result).toBeNull();
      
      // Nettoyer
      if (fs.existsSync(invalidFile)) {
        fs.unlinkSync(invalidFile);
      }
    });
  });

  describe('getEmailHistory', () => {
    it('devrait retourner l\'historique avec pagination', () => {
      const mockEmails = Array.from({ length: 50 }, (_, i) => ({
        id: i.toString(),
        subject: `Email ${i}`,
        message: `Message ${i}`,
        sentAt: new Date().toISOString()
      }));

      fs.writeFileSync(tempHistoryFile, JSON.stringify(mockEmails, null, 2));

      const result = getEmailHistory(1, 20, tempHistoryFile);

      expect(result.emails).toHaveLength(20);
      expect(result.pagination.total).toBe(50);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('devrait créer le fichier s\'il n\'existe pas', () => {
      const newTempFile = path.join(os.tmpdir(), `new-emailHistory-${Date.now()}.json`);
      
      // Supprimer le fichier temporaire s'il existe
      if (fs.existsSync(newTempFile)) {
        fs.unlinkSync(newTempFile);
      }

      const result = getEmailHistory(1, 20, newTempFile);

      expect(fs.existsSync(newTempFile)).toBe(true);
      expect(result.emails).toEqual([]);
      expect(result.pagination.total).toBe(0);
      
      // Nettoyer
      if (fs.existsSync(newTempFile)) {
        fs.unlinkSync(newTempFile);
      }
    });

    it('devrait gérer les erreurs de lecture', () => {
      // Tester avec un fichier JSON invalide
      const invalidFile = path.join(os.tmpdir(), `invalid-emailHistory-${Date.now()}.json`);
      fs.writeFileSync(invalidFile, 'invalid json content');

      const result = getEmailHistory(1, 20, invalidFile);

      expect(result.emails).toEqual([]);
      expect(result.pagination.total).toBe(0);
      
      // Nettoyer
      if (fs.existsSync(invalidFile)) {
        fs.unlinkSync(invalidFile);
      }
    });
  });
});
