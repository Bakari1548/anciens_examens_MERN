const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Configuration de la base de données en mémoire pour les tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Déconnecter si déjà connecté
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
});

// Déconnexion de la base de données après tous les tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Nettoyage des données après chaque test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
