const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./src/config/db');
const userRoutes = require('./src/routes/user.route');
const examRoutes = require('./src/routes/exam.route');
const adminRoutes = require('./src/routes/admin.route');
const ufrRoutes = require('./src/routes/ufr.route');
const logRoutes = require('./src/routes/log.route');
const notificationRoutes = require('./src/routes/notification.route');

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
  app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
  });
}

module.exports = app;
