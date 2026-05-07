const { Resend } = require('resend');

// Configuration avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envoyer un email via Resend
 * @param {string} to - Email du destinataire
 * @param {string} subject - Sujet
 * @param {string} html - Contenu HTML
 * @param {string} text - Contenu texte (optionnel, pour les clients qui ne supportent pas HTML)
 */
async function sendEmail(to, subject, html, text = null) {
    try {
        const msg = {
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
        };

        // Ajouter texte si fourni
        if (text) {
            msg.text = text;
        }

        const { data, error } = await resend.emails.send(msg);

        if (error) {
            console.error('❌ Erreur Resend:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Email envoyé via Resend:', data.id);
        return { success: true, id: data.id };

    } catch (error) {
        console.error('❌ Erreur inattendue:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { sendEmail };