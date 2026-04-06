const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465, // true pour le port 465, false pour les autres
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `Support <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      text: options.message
    };

    const info = await transporter.sendMail(mailOptions);
    return info; // Retourne les infos de succès
  } catch (error) {
    console.error("Erreur Nodemailer :", error.message);
    throw new Error("L'envoi de l'email a échoué."); 
  }
};

module.exports = sendEmail;
