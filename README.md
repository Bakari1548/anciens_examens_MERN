# Anciens Examens MERN

Plateforme de partage d'anciens examens universitaires avec un dashboard administratif complet.

## 📋 Description

Cette application permet aux étudiants de partager et de consulter des anciens examens universitaires. Elle comprend une interface publique pour les utilisateurs et un dashboard administratif pour la gestion des examens, des utilisateurs et de la modération.

## ✨ Fonctionnalités

### Plateforme Publique
- **Partage d'examens** : Les étudiants peuvent uploader des examens (PDF, images)
- **Consultation d'examens** : Recherche et filtrage par UFR, filière, matière, année
- **Authentification** : Inscription, connexion, réinitialisation de mot de passe
- **Commentaires et likes** : Interaction avec les examens partagés

### Dashboard Admin
- **Gestion des utilisateurs** : Liste, modification, activation/désactivation, bannissement
- **Gestion des examens** : Approbation, rejet, suppression, ajout d'examens
- **Modération** : Gestion des signalements
- **Analytics** : Statistiques et export de données (CSV, PDF)
- **Notifications** : Système de notifications pour les administrateurs
- **Thème sombre/clair** : Personnalisation de l'interface admin
- **Logs** : Journal des activités administratives

## 🛠 Technologies

### Frontend
- **React 18** avec Vite
- **React Router** pour la navigation
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes
- **Sonner** pour les notifications toast
- **Axios** pour les requêtes API

### Backend
- **Node.js** avec Express
- **MongoDB** avec Mongoose
- **Cloudinary** pour le stockage des fichiers
- **JWT** pour l'authentification
- **Bcrypt** pour le hachage des mots de passe
- **Multer** pour l'upload de fichiers

## 📁 Structure du Projet

```
anciens_examens_MERN/
├── anciens_examens_back/          # Backend API
│   ├── config/                    # Configuration (Cloudinary, MongoDB)
│   ├── controllers/               # Logique métier
│   ├── middleware/                # Middleware (auth, upload)
│   ├── models/                    # Schémas Mongoose
│   ├── routes/                    # Routes Express
│   └── app.js                     # Point d'entrée serveur
│
├── anciens_examens_front/         # Frontend React
│   ├── src/
│   │   ├── api/                   # Configuration Axios
│   │   ├── app/
│   │   │   ├── admin/             # Dashboard Admin
│   │   │   │   ├── components/    # Composants admin
│   │   │   │   ├── context/       # Context (Admin, Theme)
│   │   │   │   ├── hooks/         # Hooks personnalisés
│   │   │   │   └── services/      # Services API admin
│   │   │   ├── exam/              # Pages examens
│   │   │   └── home/              # Page d'accueil
│   │   ├── components/            # Composants partagés
│   │   ├── pages/                 # Pages principales
│   │   └── utils/                 # Utilitaires
│   └── public/                    # Fichiers statiques
│
└── README.md
```

## 🚀 Installation

### Prérequis
- Node.js (v18 ou supérieur)
- MongoDB (local ou Atlas)
- Un compte Cloudinary

### Configuration Backend

1. Naviguer vers le dossier backend :
```bash
cd anciens_examens_back
```

2. Installer les dépendances :
```bash
npm install
```

3. Créer un fichier `.env` :
```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/anciens_examens_db
JWT_SECRET=votre_secret_jwt
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### Configuration Frontend

1. Naviguer vers le dossier frontend :
```bash
cd anciens_examens_front
```

2. Installer les dépendances :
```bash
npm install
```

3. Créer un fichier `.env` :
```env
VITE_API_URL=http://localhost:8000
```

## ▶️ Lancer le Projet

### Backend
```bash
cd anciens_examens_back
npm run dev
```
Le serveur démarre sur `http://localhost:8000`

### Frontend
```bash
cd anciens_examens_front
npm run dev
```
L'application démarre sur `http://localhost:5173`

## 📝 Scripts Disponibles

### Backend
- `npm start` : Lance le serveur en production
- `npm run dev` : Lance le serveur en développement avec nodemon

### Frontend
- `npm run dev` : Lance le serveur de développement
- `npm run build` : Crée le build de production
- `npm run preview` : Prévisualise le build de production

## 🔐 Variables d'environnement

### Backend (.env)
| Variable | Description |
|----------|-------------|
| PORT | Port du serveur (défaut: 8000) |
| MONGODB_URI | URI de connexion MongoDB |
| JWT_SECRET | Secret pour signer les tokens JWT |
| CLOUDINARY_CLOUD_NAME | Nom du cloud Cloudinary |
| CLOUDINARY_API_KEY | Clé API Cloudinary |
| CLOUDINARY_API_SECRET | Secret API Cloudinary |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| VITE_API_URL | URL de l'API backend |

## 👥 Rôles Utilisateurs

### Utilisateur Standard
- Consulter les examens
- Partager des examens
- Commenter et liker
- Gérer son profil

### Administrateur
- Accès au dashboard admin
- Gestion des utilisateurs
- Modération des examens
- Approbation/rejet d'examens
- Accès aux analytics et exports
- Gestion des notifications

## 📊 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/forgot-password` - Mot de passe oublié
- `POST /api/auth/reset-password` - Réinitialiser mot de passe

### Examens
- `GET /api/exams` - Liste des examens
- `GET /api/exams/:id` - Détails d'un examen
- `POST /api/exams` - Créer un examen
- `PATCH /api/admin/exams/:id/approve` - Approuver un examen
- `PATCH /api/admin/exams/:id/reject` - Rejeter un examen
- `DELETE /api/exams/:id` - Supprimer un examen

### Utilisateurs (Admin)
- `GET /api/admin/users` - Liste des utilisateurs
- `GET /api/admin/users/:id` - Détails utilisateur
- `PATCH /api/admin/users/:id` - Modifier utilisateur
- `DELETE /api/admin/users/:id` - Supprimer utilisateur
- `PATCH /api/admin/users/:id/activate` - Activer utilisateur
- `PATCH /api/admin/users/:id/deactivate` - Désactiver utilisateur
- `PATCH /api/admin/users/:id/ban` - Bannir utilisateur
- `PATCH /api/admin/users/:id/unban` - Débannir utilisateur

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou un pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 👤 Auteur

Bakari - Université de Thiès
