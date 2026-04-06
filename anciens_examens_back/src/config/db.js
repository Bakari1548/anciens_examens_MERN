const mongoose = require('mongoose');
require('dotenv').config();


const connectDB = async () => {
  console.log("Variable env : ", process.env.MONGODB_URI);
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connectée: ${conn.connection.host}`);
  } catch (error) {
    console.error('Erreur de connexion de la base de donnees:', error);
  }
};

module.exports = connectDB;