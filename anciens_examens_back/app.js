const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./src/config/db');
const userRoutes = require('./src/routes/user.route');
const examRoutes = require('./src/routes/exam.route');
const adminRoutes = require('./src/routes/admin.route');
const ufrRoutes = require('./src/routes/ufr.route');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// CORS configuration pour permettre les cookies
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ufrs', ufrRoutes);

// Ne démarrer le serveur que si ce fichier n'est pas importé par les tests
if (require.main === module) {
  connectDB();
  app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
  });
}

module.exports = app;
