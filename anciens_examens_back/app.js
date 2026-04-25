const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const userRoutes = require('./src/routes/user.route');
const examRoutes = require('./src/routes/exam.route');
const adminRoutes = require('./src/routes/admin.route');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/admin', adminRoutes);

// Ne démarrer le serveur que si ce fichier n'est pas importé par les tests
if (require.main === module) {
  connectDB();
  app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
  });
}

module.exports = app;
