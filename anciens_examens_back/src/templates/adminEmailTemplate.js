/**
 * Template d'email administratif réutilisable
 * @param {Object} params - Paramètres du template
 * @param {string} params.subject - Sujet de l'email
 * @param {string} params.message - Message principal
 * @param {string} params.userName - Nom de l'utilisateur (optionnel)
 * @param {string} params.userEmail - Email de l'utilisateur (optionnel)
 * @param {string} params.buttonText - Texte du bouton (optionnel)
 * @param {string} params.buttonLink - Lien du bouton (optionnel)
 * @param {string} params.footerText - Texte personnalisé du footer (optionnel)
 * @param {string} params.frontendUrl - URL du frontend (optionnel)
 * @returns {string} HTML de l'email
 */
const adminEmailTemplate = ({
  subject,
  message,
  userName = '',
  userEmail = '',
  buttonText = null,
  buttonLink = null,
  footerText = null,
  frontendUrl = 'https://anciensexamensuidt.app'
}) => {
  const logoUrl = `${frontendUrl}/assets/logo_anciens_examens-DwXKLIhR.png`;
  const greeting = userName ? `Bonjour ${userName},` : 'Bonjour,';
  
  const buttonSection = buttonText && buttonLink ? `
    <div class="button-container">
      <a href="${buttonLink}" class="action-button">${buttonText}</a>
    </div>
  ` : '';

  const footerContent = footerText || `
    <p>Cet email a été envoyé automatiquement par la plateforme Anciens Examens</p>
    <p>Université de Thiès - UFR des Sciences et Technologies</p>
    <p>Questions ? <a href="mailto:onboarding@anciensexamensuidt.app">onboarding@anciensexamensuidt.app</a></p>
  `;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea, #764ba2); min-height: 100vh; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .card { background: white; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea, #764ba2); padding: 50px 40px; text-align: center; position: relative; overflow: hidden; }
    .header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 30px 30px; animation: float 20s linear infinite; }
    @keyframes float { 0% { transform: translate(0, 0) rotate(0deg); } 100% { transform: translate(-30px, -30px) rotate(360deg); } }
    .logo-container { position: relative; z-index: 1; width: 90px; height: 90px; margin: 0 auto 25px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .logo { width: 70px; height: 70px; border-radius: 50%; object-fit: contain; display: flex; align-items: center; justify-content: center;  margin: auto; }
    .title { color: white; font-size: 32px; font-weight: 700; margin-bottom: 8px; position: relative; z-index: 1; letter-spacing: -0.5px; }
    .subtitle { color: rgba(255,255,255,0.95); font-size: 15px; position: relative; z-index: 1; }
    .content { padding: 45px 40px; }
    .greeting { font-size: 22px; color: #1a1a2e; margin-bottom: 25px; font-weight: 600; }
    .message { color: #4a4a68; margin-bottom: 20px; line-height: 1.8; font-size: 15px; white-space: pre-wrap; }
    .info-box { background: linear-gradient(135deg, #667eea15, #764ba215); border-radius: 16px; padding: 25px; margin: 30px 0; border-left: 4px solid #667eea; }
    .info-box h3 { color: #667eea; margin-bottom: 15px; font-size: 16px; font-weight: 700; }
    .info-box p { color: #4a4a68; font-size: 14px; margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px; }
    .info-box p::before { content: '✓'; color: #667eea; font-weight: bold; flex-shrink: 0; }
    .button-container { text-align: center; margin: 35px 0; }
    .action-button { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 18px 45px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 8px 25px rgba(102,126,234,0.4); transition: all 0.3s ease; border: none; }
    .action-button:hover { transform: translateY(-3px); box-shadow: 0 12px 35px rgba(102,126,234,0.5); }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, #e0e0e0, transparent); margin: 35px 0; }
    .footer { text-align: center; padding-top: 10px; color: #999; font-size: 13px; }
    .footer a { color: #667eea; text-decoration: none; font-weight: 500; }
    .footer a:hover { text-decoration: underline; }
    .user-info { background: #f8f9fa; padding: 15px 20px; border-radius: 12px; margin: 20px 0; font-size: 14px; color: #666; }
    .user-info strong { color: #333; }
    @media (max-width: 600px) { body { padding: 20px 15px; } .header { padding: 35px 25px; } .content { padding: 30px 25px; } .title { font-size: 26px; } .greeting { font-size: 18px; } .action-button { display: block; width: 100%; text-align: center; padding: 16px 20px; } .info-box { padding: 20px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo-container">
          <img src="${logoUrl}" alt="Anciens Examens" class="logo" onerror="this.style.display='none';" />
        </div>
        <div class="title">Anciens Examens</div>
        <div class="subtitle">Université de Thiès - Panneau d'administration</div>
      </div>
      <div class="content">
        <div class="greeting">${greeting} 👋</div>
        <div class="message">${message}</div>
        ${buttonSection}
        ${userEmail ? `
        <div class="user-info">
          <strong>Email associé :</strong> ${userEmail}
        </div>
        ` : ''}
        <div class="info-box">
          <h3>📧 Informations importantes</h3>
          <p>Cet email provient de l'administration de la plateforme</p>
          <p>Ne répondez pas directement à cet email</p>
          <p>Pour toute question, contactez l'administration via les canaux officiels</p>
        </div>
        <div class="divider"></div>
        <div class="footer">
          ${footerContent}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

module.exports = adminEmailTemplate;
