const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const userRoutes = require('./src/routes/user.route');
const examRoutes = require('./src/routes/exam.route');

require('dotenv').config();


connectDB();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});
