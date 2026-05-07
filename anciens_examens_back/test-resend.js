require('dotenv').config();
const { sendEmail } = require('./src/utils/sendEmail');

async function test() {
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '***défini***' : '***NON DÉFINI***');
    
    const result = await sendEmail(
        'bkrsagna03@gmail.com', // Mettez votre email ici
        'Test Resend - Anciens Examens',
        '<p>Ceci est un <strong>test</strong> depuis mon backend Node.js avec Resend.</p>',
        'Ceci est un test depuis mon backend Node.js avec Resend.'
    );
    
    console.log('Résultat:', result);
}

test();
