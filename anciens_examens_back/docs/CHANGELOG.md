# Changelog - Anciens Examens API

## Version 2.1.0 - Likes et Commentaires (Dernière mise à jour)

### 🆕 Nouvelles fonctionnalités

#### 👍❤️ Système de Likes
- **Routes API**: `GET/POST/DELETE /api/exams/:slug/like`
- **Statut du like**: `GET /api/exams/:slug/like/status`
- **Compteur automatique**: likesCount mis à jour automatiquement
- **Idempotent**: Un seul like par utilisateur par examen
- **Frontend**: Bouton Like avec animation et mise à jour temps réel

#### 💬 Système de Commentaires
- **Routes API**: `GET /api/exams/:slug/comments` (public)
- **Création**: `POST /api/exams/:slug/comments` (auth requis)
- **Suppression**: `DELETE /api/exams/:slug/comments/:commentId`
- **Permissions**: Auteur du commentaire OU auteur de l'examen peut supprimer
- **Validation**: 500 caractères maximum, contenu requis
- **Compteur automatique**: commentsCount mis à jour automatiquement
- **Frontend**: Section commentaires avec formulaire et liste

#### 🧪 Tests Unitaires
- **27 nouveaux tests** pour likes et commentaires
- **Couverture complète**: Cas positifs, erreurs, authentification, permissions
- **Tests passants**: 45 tests au total ✅

### 🔧 Implémentation Technique

#### Backend
- **Contrôleurs**: `likeExam`, `unlikeExam`, `getLikeStatus`, `addComment`, `deleteComment`, `getComments`
- **Modèle Exam**: Méthodes `addLike`, `removeLike`, `addComment`, `removeComment`, `isLikedBy`
- **Routes**: Intégration dans `/src/routes/exam.route.js`
- **Sécurité**: Auth middleware sur toutes les routes protégées

#### Frontend
- **Services API**: `exam.api.js` avec 6 nouvelles fonctions
- **Composant DetailExam**: Intégration complète des fonctionnalités
- **UX**: Messages de confirmation, validation, gestion des erreurs
- **Responsive**: Adapté mobile et desktop

---

## Version 2.0.0 - Optimisations et Multi-fichiers

### 🆕 Nouvelles fonctionnalités

#### 📱 Optimisations Mobiles
- **Timeouts augmentés**: 60 secondes pour les connexions mobiles lentes
- **Gestion erreurs réseau**: Support des erreurs ECONNRESET, ETIMEDOUT
- **Messages contextuels**: Erreurs spécifiques aux mobiles
- **Détection automatique**: Mode mobile détecté dans le frontend

#### 📁 Multi-fichiers
- **Support 5 fichiers**: Upload multiple jusqu'à 5 fichiers par examen
- **Taille augmentée**: 15MB par fichier (mobile-friendly)
- **Suppression Cloudinary**: Nettoyage automatique des fichiers multiples
- **Interface adaptée**: Sélecteur de fichiers dans l'examinateur

#### 👤 Gestion du profil utilisateur
- **Mise à jour profil**: PUT `/api/users/profile` avec validation
- **Champ modifiables**: firstName, lastName, ufr, filière
- **Sécurité**: Seul le propriétaire peut modifier son profil

#### 🚨 Système de modération
- **Demandes de réactivation**: POST `/api/users/appeal` pour comptes bannis
- **Gestion admin**: GET `/api/users/appeals`, PATCH approve/reject
- **Rôles hiérarchiques**: user < moderator < admin

#### 🎯 Améliorations UX
- **Confirmation déconnexion**: Modal en deux étapes sur toutes les pages
- **Notifications temps réel**: Événements personnalisés pour sync UI
- **Messages d'erreur**: Contextuels et informatifs

### 🔧 Corrections et améliorations

#### Backend
- **Validation renforcée**: Contrôles stricts des entrées utilisateur
- **Logs détaillés**: Meilleur débogage en production
- **Rate limiting**: Protection contre les abus
- **Sécurité**: Headers CORS et validation JWT

#### Frontend
- **Cascade académique**: UFR → filière → niveau → semestre
- **Formulaire responsive**: Adapté mobile/desktop
- **Gestion d'erreurs**: Messages clairs et actions suggérées

#### 📊 Statistiques
- **45 tests unitaires**: Tous passants ✅
- **Couverture complète**: Examens, utilisateurs, authentification, likes, commentaires
- **Performance**: Optimisations mobiles et timeout

### 🐛 Bugs corrigés
- **Upload mobile**: Timeout et erreurs réseau gérées
- **Multi-fichiers**: Gestion correcte des tableaux de fichiers
- **Déconnexion**: Synchronisation UI entre composants
- **Validation**: Messages d'erreur cohérents

### 🔒 Sécurité renforcée
- **Tokens JWT**: 24h avec rotation sécurisée
- **Permissions**: Rôles basés sur l'authentification
- **Rate limiting**: 100 requêtes/15min général
- **Input validation**: Nettoyage et validation stricte

### 📚 Documentation complète
- **README.md**: Vue d'ensemble avec toutes les fonctionnalités
- **endpoints.md**: Liste complète de toutes les routes API
- **models.md**: Structure des données et schémas
- **middlewares.md**: Authentification et validation

---

## Version 1.0.0 - Version initiale

### 🎯 Fonctionnalités de base
- Gestion des utilisateurs avec JWT
- Upload et consultation d'examens
- Système de commentaires et likes
- Interface responsive mobile/desktop

### 📝 Limitations connues
- Upload single-file uniquement
- Pas d'optimisations mobiles
- Messages d'erreur génériques

---

## Roadmap Future

### 🚀 Prochaines versions
- **Notifications push**: Email et mobile
- **Recherche avancée**: Filtres multiples et recherche pleine texte
- **Export PDF**: Génération de PDF depuis l'interface
- **API Analytics**: Statistiques détaillées d'utilisation
- **Mode offline**: PWA pour consultation hors ligne
