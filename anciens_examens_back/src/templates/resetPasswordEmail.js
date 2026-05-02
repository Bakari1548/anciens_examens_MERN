const resetPasswordTemplate = (resetLink, userName = '') => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation de mot de passe - Anciens Examens</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f9fa;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 30px;
          text-align: center;
          border-radius: 12px 12px 0 0;
        }
        
        .logo {
          width: 80px;
          height: 80px;
          margin-bottom: 20px;
          border-radius: 50%;
          background: white;
          padding: 10px;
        }
        
        .title {
          color: white;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
        }
        
        .content {
          background: white;
          padding: 40px;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .greeting {
          font-size: 20px;
          color: #333;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        .message {
          color: #666;
          margin-bottom: 30px;
          line-height: 1.8;
        }
        
        .reset-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 30px 0;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .security-info {
          background: #f8f9fa;
          padding: 20px;
          margin: 30px 0;
          border-radius: 0 8px 8px 0;
        }
        
        .security-info h3 {
          color: #667eea;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .security-info p {
          color: #666;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #999;
          font-size: 14px;
        }
        
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
        
        .footer a:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 600px) {
          .container {
            padding: 10px;
          }
          
          .header {
            padding: 20px;
          }
          
          .content {
            padding: 25px;
          }
          
          .title {
            font-size: 24px;
          }
          
          .reset-button {
            display: block;
            color: white;
            text-align: center;
            padding: 18px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img 
            src="public/logo.png" 
            alt="Anciens Examens" 
            class="logo"
            onerror="this.style.display='none';"
          />
          <div class="title">Anciens Examens</div>
          <div class="subtitle">Université de Thiès - Plateforme de partage d'examens</div>
        </div>
        
        <div class="content">
          <div class="greeting">
            ${userName ? `Bonjour ${userName},` : 'Bonjour,'}
          </div>
          
          <div class="message">
            Vous avez demandé à réinitialiser votre mot de passe pour votre compte sur la plateforme Anciens Examens de l'Université de Thiès.
          </div>
          
          <div class="message">
            Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :
          </div>
          
          <div style="text-align: center;">
            <a href="${resetLink}"  style="color: white !important;" class="reset-button">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <div class="security-info">
            <h3>🔐 Informations de sécurité</h3>
            <p>• Ce lien est valable pendant 1 heure uniquement</p>
            <p>• Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</p>
            <p>• Votre mot de passe actuel reste inchangé</p>
            <p>• N'utilisez jamais ce lien si vous n'en êtes pas à l'origine</p>
          </div>
          
          <div class="message">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 12px; color: #666;">
            ${resetLink}
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par la plateforme Anciens Examens</p>
            <p>Université de Thiès - UFR des Sciences et Technologies</p>
            <p>Si vous avez des questions, contactez-nous à <a href="mailto:senservice.client@gmail.com">senservice.client@gmail.com</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = resetPasswordTemplate;
