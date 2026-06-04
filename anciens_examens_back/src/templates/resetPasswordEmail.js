const resetPasswordTemplate = (
  resetLink, 
  userName = '', 
  frontendUrl = 'https://anciensexamensuidt.app'
) => {
  const logoUrl = `${frontendUrl}/assets/logo_anciens_examens-DwXKLIhR.png`;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe - Anciens Examens</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea, #764ba2, #f093fb); min-height: 100vh; padding: 40px 20px; }
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
    .message { color: #4a4a68; margin-bottom: 20px; line-height: 1.8; font-size: 15px; }
    .icon-box { background: linear-gradient(135deg, #667eea15, #764ba215); border-radius: 16px; padding: 25px; margin: 30px 0; border-left: 4px solid #667eea; }
    .icon-box h3 { color: #667eea; margin-bottom: 15px; font-size: 16px; font-weight: 700; }
    .icon-box p { color: #4a4a68; font-size: 14px; margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px; }
    .icon-box p::before { content: '✓'; color: #667eea; font-weight: bold; flex-shrink: 0; }
    .button-container { text-align: center; margin: 35px 0; }
    .reset-button { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 18px 45px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 8px 25px rgba(102,126,234,0.4); transition: all 0.3s ease; border: none; }
    .reset-button:hover { transform: translateY(-3px); box-shadow: 0 12px 35px rgba(102,126,234,0.5); }
    .link-box { background: #f8f9fa; padding: 18px 20px; border-radius: 12px; word-break: break-all; font-family: monospace; font-size: 11px; color: #667eea; border: 1px dashed #ddd; margin: 20px 0; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, #e0e0e0, transparent); margin: 35px 0; }
    .footer { text-align: center; padding-top: 10px; color: #999; font-size: 13px; }
    .footer a { color: #667eea; text-decoration: none; font-weight: 500; }
    .footer a:hover { text-decoration: underline; }
    .warning-box { background: #fff3cd; border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #ffc107; }
    .warning-box p { color: #856404; font-size: 14px; margin: 0; display: flex; align-items: center; gap: 10px; }
    @media (max-width: 600px) { body { padding: 20px 15px; } .header { padding: 35px 25px; } .content { padding: 30px 25px; } .title { font-size: 26px; } .greeting { font-size: 18px; } .reset-button { display: block; width: 100%; text-align: center; padding: 16px 20px; } .icon-box { padding: 20px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo-container">
          <img src="${logoUrl}" class="logo" onerror="this.style.display='none';" />
        </div>
        <div class="title">Anciens Examens</div>
        <div class="subtitle">Université de Thiès - Plateforme de partage d'examens</div>
      </div>
      <div class="content">
        <div class="greeting">${userName ? `Bonjour ${userName}, 👋` : 'Bonjour, 👋'}</div>
        <div class="message">Vous avez demandé à réinitialiser votre mot de passe pour votre compte sur la plateforme <strong>Anciens Examens</strong> de l'Université de Thiès.</div>
        <div class="message">Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe sécurisé :</div>
        <div class="button-container">
          <a href="${resetLink}" style="color: white !important;" class="reset-button">🔑 Réinitialiser mon mot de passe</a>
        </div>
        <div class="warning-box"><p><span>⏱️</span> Ce lien expire dans <strong>1 heure</strong></p></div>
        <div class="icon-box">
          <h3>🔐 Informations de sécurité</h3>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</p>
          <p>Votre mot de passe actuel reste inchangé</p>
          <p>N'utilisez jamais ce lien si vous n'en êtes pas à l'origine</p>
        </div>
        <div class="message">Si le bouton ne fonctionne pas, copiez ce lien :</div>
        <div class="link-box">${resetLink}</div>
        <div class="divider"></div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement par la plateforme Anciens Examens</p>
          <p>Université de Thiès - UFR des Sciences et Technologies</p>
          <p>Questions ? <a href="mailto:onboarding@anciensexamensuidt.app">onboarding@anciensexamensuidt.app</a></p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

module.exports = resetPasswordTemplate;
