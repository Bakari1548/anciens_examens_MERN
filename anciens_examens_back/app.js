const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const cron = require('node-cron');
const connectDB = require('./src/config/db');
const userRoutes = require('./src/routes/user.route');
const examRoutes = require('./src/routes/exam.route');
const adminRoutes = require('./src/routes/admin.route');
const ufrRoutes = require('./src/routes/ufr.route');
const logRoutes = require('./src/routes/log.route');
const notificationRoutes = require('./src/routes/notification.route');
const aiRoutes = require('./src/routes/ai.route');
const Notification = require('./src/models/Notification');
const User = require('./src/models/User');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration pour permettre les cookies
const getAllowedOrigins = () => {
  const defaultOrigins = [
    'http://localhost:3000',
    'capacitor://localhost',
    'ionic://localhost'
  ];
  
  // Si FRONTEND_URL est défini, l'ajouter aux origines par défaut
  if (process.env.FRONTEND_URL) {
    return [process.env.FRONTEND_URL, ...defaultOrigins];
  }
  
  return defaultOrigins;
};

const corsOptions = {
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
  
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ufrs', ufrRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);


app.use((req, res, next) => {
  console.log('=== REQUÊTE ENTRANTE ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Body keys:', req.body ? Object.keys(req.body) : 'undefined');
  console.log('Files:', req.files ? req.files.length : 'undefined');
  console.log('File:', req.file ? 'présent' : 'undefined');
  console.log('========================');
  next();
});


// Ne démarrer le serveur que si ce fichier n'est pas importé par les tests
if (require.main === module) {
  connectDB();
  
  // Nettoyage automatique des notifications de plus de 2 semaines
  // S'exécute tous les jours à minuit (00:00)
  const cleanupNotifications = async () => {
    try {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      const result = await Notification.deleteMany({
        createdAt: { $lt: twoWeeksAgo }
      });
      
      console.log(`[Cleanup] ${result.deletedCount} notifications supprimées (plus de 2 semaines)`);

      // Notifier les administrateurs du nettoyage
      if (result.deletedCount > 0) {
        const admins = await User.find({ role: 'admin' });
        
        for (const admin of admins) {
          await Notification.create({
            recipient: admin._id,
            type: 'system',
            title: 'Nettoyage des notifications',
            message: `${result.deletedCount} notifications de plus de 2 semaines ont été supprimées automatiquement`,
            metadata: {
              deletedCount: result.deletedCount,
              cleanupDate: new Date(),
              type: 'notification_cleanup'
            },
            read: false
          });
        }
        
        console.log(`[Cleanup] Notification envoyée à ${admins.length} administrateur(s)`);
      }
    } catch (error) {
      console.error('[Cleanup] Erreur lors du nettoyage des notifications:', error);
    }
  };

  // Exécuter le nettoyage immédiatement au démarrage
  cleanupNotifications();
  
  // Planifier le nettoyage quotidien à minuit
  cron.schedule('0 0 * * *', () => {
    console.log('[Cron] Exécution du nettoyage des notifications');
    cleanupNotifications();
  });

  app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
    console.log(`[Cron] Nettoyage automatique des notifications planifié: tous les jours à minuit`);
  });
}

module.exports = app;
