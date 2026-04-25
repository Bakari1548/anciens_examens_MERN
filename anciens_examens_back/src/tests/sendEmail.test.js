const sendEmail = require('../utils/sendEmail');
const nodemailer = require('nodemailer');

// Mock de nodemailer
jest.mock('nodemailer');

describe('sendEmail Utility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait envoyer un email avec succès', async () => {
    // Mock du transporter et de sendMail
    const mockSendMail = jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
      response: '250 OK'
    });

    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail
    });

    const emailOptions = {
      email: 'test@univ-thies.sn',
      subject: 'Test Subject',
      message: 'Test message content'
    };

    const result = await sendEmail(emailOptions);

    // Vérifier que createTransport a été appelé avec les bonnes options
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Vérifier que sendMail a été appelé avec les bonnes options
    expect(mockSendMail).toHaveBeenCalledWith({
      from: `Support <${process.env.EMAIL_FROM}>`,
      to: emailOptions.email,
      subject: emailOptions.subject,
      text: emailOptions.message
    });

    // Vérifier le résultat
    expect(result).toBeDefined();
    expect(result.messageId).toBe('test-message-id');
  });

  it('devrait rejeter si l\'envoi échoue', async () => {
    // Mock du transporter qui échoue
    const mockSendMail = jest.fn().mockRejectedValue(new Error('SMTP error'));

    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail
    });

    const emailOptions = {
      email: 'test@univ-thies.sn',
      subject: 'Test Subject',
      message: 'Test message content'
    };

    await expect(sendEmail(emailOptions)).rejects.toThrow("L'envoi de l'email a échoué.");
  });

  it('devrait rejeter si createTransport échoue', async () => {
    // Mock de createTransport qui échoue
    nodemailer.createTransport.mockImplementation(() => {
      throw new Error('Transport error');
    });

    const emailOptions = {
      email: 'test@univ-thies.sn',
      subject: 'Test Subject',
      message: 'Test message content'
    };

    await expect(sendEmail(emailOptions)).rejects.toThrow("L'envoi de l'email a échoué.");
  });
});
