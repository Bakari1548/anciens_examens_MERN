// Script d'initialisation MongoDB
// Ce script est exécuté lors du premier démarrage du conteneur MongoDB

// Créer la base de données
db = db.getSiblingDB('anciens_examens');

// Créer un utilisateur pour l'application
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'anciens_examens'
    }
  ]
});

// Créer des collections de base
db.createCollection('users');
db.createCollection('exams');
db.createCollection('reports');

// Créer des index pour optimiser les performances
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "status": 1 });
db.exams.createIndex({ "author._id": 1 });
db.exams.createIndex({ "createdAt": -1 });
db.exams.createIndex({ "title": "text", "description": "text", "content": "text" });

// Insérer un administrateur par défaut
db.users.insertOne({
  firstName: 'Admin',
  lastName: 'System',
  email: 'admin@univ-thies.sn',
  password: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', // password: admin123
  role: 'admin',
  status: 'active',
  ufr: 'UFR Administration',
  filiere: 'System',
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Base de données anciens_examens initialisée avec succès');
