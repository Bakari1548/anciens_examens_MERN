// Mock de la méthode emails.send
const mockSend = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSend
    }
  }))
}));

const { sendEmail } = require('../utils/sendEmail');

describe('sendEmail Utility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Définir EMAIL_FROM pour les tests
    process.env.EMAIL_FROM = 'test@univ-thies.sn';
  });

  afterAll(() => {
    // Restaurer la variable d'environnement
    delete process.env.EMAIL_FROM;
  });

  it('devrait envoyer un email avec succès', async () => {
    mockSend.mockResolvedValue({
      data: { id: 'test-email-id' },
      error: null
    });

    const result = await sendEmail(
      'test@univ-thies.sn',
      'Test Subject',
      '<p>Test HTML content</p>',
      'Test text content'
    );

    // Vérifier que send a été appelé avec les bonnes options
    expect(mockSend).toHaveBeenCalledWith({
      from: 'test@univ-thies.sn',
      to: 'test@univ-thies.sn',
      subject: 'Test Subject',
      html: '<p>Test HTML content</p>',
      text: 'Test text content'
    });

    // Vérifier le résultat
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.id).toBe('test-email-id');
  });

  it('devrait envoyer un email sans texte alternatif', async () => {
    mockSend.mockResolvedValue({
      data: { id: 'test-email-id-2' },
      error: null
    });

    const result = await sendEmail(
      'test@univ-thies.sn',
      'Test Subject',
      '<p>Test HTML content</p>'
    );

    // Vérifier que send a été appelé sans le champ text
    expect(mockSend).toHaveBeenCalledWith({
      from: 'test@univ-thies.sn',
      to: 'test@univ-thies.sn',
      subject: 'Test Subject',
      html: '<p>Test HTML content</p>'
    });

    // Vérifier le résultat
    expect(result.success).toBe(true);
  });

  it('devrait gérer les erreurs de Resend', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: 'Resend API error' }
    });

    const result = await sendEmail(
      'test@univ-thies.sn',
      'Test Subject',
      '<p>Test HTML content</p>'
    );

    // Vérifier le résultat d'erreur
    expect(result.success).toBe(false);
    expect(result.error).toBe('Resend API error');
  });

  it('devrait gérer les erreurs inattendues', async () => {
    mockSend.mockRejectedValue(new Error('Unexpected error'));

    const result = await sendEmail(
      'test@univ-thies.sn',
      'Test Subject',
      '<p>Test HTML content</p>'
    );

    // Vérifier le résultat d'erreur
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unexpected error');
  });
});
