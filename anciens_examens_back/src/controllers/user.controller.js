const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// const sendEmail = require('../utils/sendEmail');
const { sendEmail } = require('../utils/sendEmail');
const { createLog } = require('../utils/logger');
const Notification = require('../models/Notification');
require('dotenv').config();



const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

const generateResetToken = () => {
    return jwt.sign({ type: 'reset' }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};


// @desc    Inscription d'un nouveau utilisateur
// @route   POST /api/users/register
// @access  Public
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, ufr, filiere } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                message: 'Tous les champs sont requis'
            });
        }

        // Validation du mot de passe (minimum 8 caractères)
        if (password.length < 8) {
            return res.status(400).json({
                message: 'Le mot de passe doit contenir au moins 8 caractères'
            });
        }

        // Verifier si l'utilisateur existe deja
        const userExists = await User.findOne({ email });
        if (userExists) {
            await createLog({ level: 'warning', action: 'REGISTER_FAILED', message: `Tentative d'inscription avec un email déjà utilisé: ${email}`, req, userName: email, metadata: { email } });
            return res.status(400).json({
                message: 'Cet email est déjà utilisé'
            });
        }


        // Le mot de passe sera hashe dans models/User.js
        // Creation de l'utilisateur
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            ufr,
            filiere
        });

        if (user) {
            const token = generateToken(user._id);

            // Importer le template d'email de bienvenue
            const welcomeEmailTemplate = require('../templates/welcomeEmail');
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const userName = user.firstName;

            // Envoyer l'email de bienvenue (sans bloquer la réponse)
            sendEmail(
                user.email,
                '🎓 Bienvenue sur Anciens Examens — Tu fais partie des premiers !',
                welcomeEmailTemplate(userName, frontendUrl)
            ).catch(err => console.error('[Register] Erreur email bienvenue:', err));

            // Définir le cookie HTTP-only
            const isProduction = process.env.NODE_ENV === 'production';
            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'strict' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
                path: '/'
            });

            // Envoyer une notification de bienvenue
            await Notification.create({
                recipient: user._id,
                type: 'success',
                title: 'Bienvenue sur Anciens Examens !',
                message: `Bonjour ${user.firstName} ! Bienvenue sur notre plateforme. Vous pouvez maintenant partager et consulter des examens.`,
                metadata: {
                    userId: user._id
                },
                read: false
            });
            
            await createLog({ level: 'info', action: 'REGISTER', message: `Nouvel utilisateur inscrit: ${user.firstName} ${user.lastName} (${user.email})`, req, user });
            res.status(201).json({
                message: "Incription reussie !",
                token,
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    ufr: user.ufr,
                    filiere: user.filiere
                }
            });
        } else {
            res.status(400).json({
                message: 'Données utilisateur invalides'
            });
        }
    } catch (error) {
        await createLog({ level: 'error', action: 'SYSTEM_ERROR', message: `Erreur lors de l'inscription: ${error.message}`, req });
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/users/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                message: 'Tous les champs sont requis'
            });
        }

        // Verifier si l'utilisateur existe et si le mot de passe est correct
        const user = await User.findOne({ email });
        
        if (!user) {
            await createLog({ level: 'warning', action: 'FAILED_LOGIN', message: `Tentative de connexion échouée - email inconnu: ${email}`, req, userName: email });
            return res.status(401).json({
                message: 'Email incorrect'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            await createLog({ level: 'warning', action: 'FAILED_LOGIN', message: `Mot de passe incorrect pour ${email}`, req, user });
            return res.status(401).json({
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Vérifier le statut de l'utilisateur
        if (user.status !== 'active') {
            if (user.status === 'banned') {
                await createLog({ level: 'warning', action: 'LOGIN_BANNED', message: `Tentative de connexion d'un utilisateur banni: ${email}`, req, user });
                return res.status(403).json({
                    message: 'Vous avez été banni'
                });
            } else if (user.status === 'inactive') {
                await createLog({ level: 'warning', action: 'LOGIN_INACTIVE', message: `Tentative de connexion d'un compte désactivé: ${email}`, req, user });
                return res.status(403).json({
                    message: 'Votre compte a été désactivé par un admin'
                });
            }
        }

        // Generer le token
        const token = generateToken(user._id);
        
        // Définir le cookie HTTP-only
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
            path: '/'
        });

        await createLog({ level: 'info', action: 'LOGIN', message: `Connexion réussie: ${user.firstName} ${user.lastName}`, req, user });
        res.json({
           message: "Utilisateur connectee avec succès !",
            token,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                ufr: user.ufr,
                filiere: user.filiere,
                role: user.role,
            }
        });
    } catch (error) {
        await createLog({ level: 'error', action: 'SYSTEM_ERROR', message: `Erreur lors de la connexion: ${error.message}`, req });
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        // const user = await User.findById(req.user._id);
        res.json({
            message: 'Profil de l\'utilisateur',
            user: req.user
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Mettre à jour le profil de l'utilisateur connecté
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé'
            });
        }
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.ufr = req.body.ufr || user.ufr;
        user.filiere = req.body.filiere || user.filiere;
        await user.save();
        res.json({
            message: 'Profil mis à jour avec succès',
            user
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};


// @desc    Déconnexion
// @route   POST /api/users/logout
// @access  Private
const logout = async (req, res) => {
    try {
        // Effacer le cookie
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie('auth_token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            path: '/'
        });
        
        await createLog({ level: 'info', action: 'LOGOUT', message: `Déconnexion`, req, user: req.user });
        res.json({
            message: 'Déconnexion réussie'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Changer le mot de passe
// @route   POST /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { oldPassword, currentPassword, newPassword } = req.body;
        const previousPassword = oldPassword || currentPassword;

        if (!previousPassword || !newPassword) {
            return res.status(400).json({
                message: 'Mot de passe actuel et nouveau mot de passe requis'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(401).json({
                message: 'Utilisateur non trouvé'
            });
        }
        
        // Verifier le mot de passe actuel
        const isPasswordValid = await user.comparePassword(previousPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Mot de passe incorrect'
            });
        }
        
        // Mettre à jour le mot de passe
        user.password = newPassword;
        await user.save();
        
        // Envoyer une notification de changement de mot de passe
        await Notification.create({
            recipient: user._id,
            type: 'system',
            title: 'Mot de passe modifié',
            message: 'Votre mot de passe a été modifié avec succès. Si vous n\'êtes pas à l\'origine de cette modification, veuillez contacter le support.',
            metadata: {
                userId: user._id
            },
            read: false
        });
        
        await createLog({ level: 'info', action: 'PASSWORD_CHANGED', message: `Mot de passe modifié`, req, user });
        res.json({
            message: 'Mot de passe modifié avec succès'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Demander un mot de passe oublié
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: 'Email incorrect'
            });
        }
         
        // Generer un token de réinitialisation
        const token = generateToken(user._id);
        
        // Stocker le token dans la base de données
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 heure
        await user.save();
        
        // Importer le template d'email
        const resetPasswordTemplate = require('../templates/resetPasswordEmail');
        const resetLink = `${process.env.FRONTEND_URL}/mot-de-passe-modifie/${token}`;
        const userName = `${user.firstName} ${user.lastName}`;
        
        // Envoyer l'email avec le template HTML
        const emailResult = await sendEmail(
            user.email,
            'Réinitialisation de mot de passe - Anciens Examens',
            // `Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien suivant pour réinitialiser votre mot de passe: ${resetLink}`,
            // resetPasswordTemplate
            resetPasswordTemplate(resetLink, userName)
        );

        if (!emailResult.success) {
            console.error('Échec envoi email:', emailResult.error);
            await createLog({ level: 'error', action: 'EMAIL_FAILED', message: `Échec d'envoi de l'email de réinitialisation à ${user.email}`, req, user, metadata: { error: emailResult.error } });
            return res.status(500).json({ 
                success: false, 
                message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.' 
            });
        }
        
        await createLog({ level: 'info', action: 'PASSWORD_RESET_REQUEST', message: `Demande de réinitialisation de mot de passe pour ${user.email}`, req, user });
        res.json({
            message: 'Un email avec un lien de réinitialisation de mot de passe a été envoyé à votre adresse email'
        });
    } catch (error) {
        console.error('Erreur forgotPassword:', error);
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Réinitialiser le mot de passe
// @route   POST /api/users/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({ passwordResetToken: token });
        if (!user) {
            await createLog({ level: 'warning', action: 'PASSWORD_RESET_FAILED', message: `Tentative de réinitialisation avec token invalide`, req });
            return res.status(401).json({
                message: 'Token incorrect'
            });
        }
        
        user.password = password;
        await user.save();
        
        await createLog({ level: 'info', action: 'PASSWORD_RESET_SUCCESS', message: `Mot de passe réinitialisé pour ${user.email}`, req, user });
        res.json({
            message: 'Mot de passe réinitialisé'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Recuperer tous les utilisateurs par l'admin en serie de données
// @route   GET /api/users/all/:page/:limit
// @access  Private
const getAllUsers = async (req, res) => {
    try {
        const { page, limit } = req.params;
        const { search, role, status } = req.query;
        
        // Construire le filtre
        let filter = {};
        if (role) filter.role = role;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        const users = await User.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });
            
        const total = await User.countDocuments(filter);
        res.json({
            users,
            total: total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Mettre a jour un utilisateur
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, role, status } = req.body;
        const user = await User.findByIdAndUpdate(id, { firstName, lastName, email, role, status }, { new: true });
        await createLog({ level: 'info', action: 'USER_UPDATED', message: `Utilisateur ${user.firstName} ${user.lastName} mis à jour`, req, user: req.user, metadata: { targetUserId: id, changes: { firstName, lastName, email, role, status } } });
        res.status(200).json({
            message: 'Utilisateur mis à jour',
            user
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};


// @desc    Supprimer un utilisateur par l'admin
// @route   DELETE /api/users/delete/:id
// @access  Private
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        await createLog({ level: 'warning', action: 'USER_DELETED', message: `Utilisateur ${user?.firstName || ''} ${user?.lastName || ''} (${user?.email || id}) supprimé`, req, user: req.user, metadata: { targetUserId: id } });
        res.status(200).json({
            message: 'Utilisateur supprimé'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Récupérer un utilisateur par ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        res.status(200).json({
            message: 'Utilisateur recuperé',
            user
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Activer un utilisateur par l'admin
// @route   PUT /api/users/activate/:id
// @access  Private
const activateUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndUpdate(id, { status: 'active' });
        await createLog({ level: 'info', action: 'USER_ACTIVATED', message: `Utilisateur ${id} activé`, req, user: req.user, metadata: { targetUserId: id } });
        res.status(200).json({
            message: 'Utilisateur activé'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Désactiver un utilisateur par l'admin
// @route   PUT /api/users/desactivate/:id
// @access  Private
const desactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndUpdate(id, { status: 'inactive' });
        await createLog({ level: 'warning', action: 'USER_DESACTIVATED', message: `Utilisateur ${id} désactivé`, req, user: req.user, metadata: { targetUserId: id } });
        res.status(200).json({
            message: 'Utilisateur désactivé'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc Bannir un utilisateur pour une durée déterminée
// @route   PUT /api/users/ban/:id
// @access  Private
const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { duration, reason } = req.body;
        await User.findByIdAndUpdate(id, { status: 'banned', banUntil: new Date(Date.now() + duration * 24 * 60 * 60 * 1000), banReason: reason });
        await createLog({ level: 'warning', action: 'USER_BANNED', message: `Utilisateur ${id} banni pour ${duration} jour(s). Raison: ${reason}`, req, user: req.user, metadata: { targetUserId: id, duration, reason } });
        res.status(200).json({
            message: 'Utilisateur banni'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc Débannir un utilisateur
// @route   PUT /api/users/unban/:id
// @access  Private
const unbanUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndUpdate(id, { status: 'active', banUntil: null, banReason: null });
        await createLog({ level: 'info', action: 'USER_UNBANNED', message: `Utilisateur ${id} débanni`, req, user: req.user, metadata: { targetUserId: id } });
        res.status(200).json({
            message: 'Utilisateur débanni'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Supprimer le compte de l'utilisateur connecté
// @route   DELETE /api/users/me
// @access  Private
const deleteMyAccount = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);

        // Effacer le cookie d'authentification
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie('auth_token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            path: '/'
        });

        await createLog({ level: 'warning', action: 'ACCOUNT_DELETED', message: `Utilisateur ${user?.firstName || ''} ${user?.lastName || ''} (${user?.email || req.user._id}) a supprimé son compte`, req, user: req.user, metadata: { targetUserId: req.user._id } });

        res.json({
            message: 'Compte supprimé avec succès'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Soumettre une demande
// @route   POST /api/users/appeal
// @access  Public
const submitAppeal = async (req, res) => {
    try {
        const { message, email } = req.body;
        
        if (!message || !email) {
            return res.status(400).json({
                message: 'Le message et l\'email de la demande sont requis'
            });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé'
            });
        }

        if (user.status === 'active') {
            return res.status(400).json({
                message: 'Votre compte est actif, vous ne pouvez pas soumettre de demande'
            });
        }

        if (user.appeal && user.appeal.status === 'pending') {
            return res.status(400).json({
                message: 'Vous avez déjà une demande en cours de traitement'
            });
        }

        user.appeal = {
            message,
            status: 'pending',
            submittedAt: new Date()
        };

        await user.save();

        await createLog({ level: 'info', action: 'APPEAL_SUBMITTED', message: `Demande d'appel soumise par ${user.email}`, req, user });
        res.status(200).json({
            message: 'Demande soumise avec succès',
            appeal: user.appeal
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Récupérer toutes les demandes (admin)
// @route   GET /api/users/appeals
// @access  Private (Admin)
const getAllAppeals = async (req, res) => {
    try {
        const appeals = await User.find({
            'appeal.status': { $exists: true, $ne: null }
        }).select('firstName lastName email status appeal createdAt');

        res.status(200).json({
            message: 'Demandes récupérées avec succès',
            appeals
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Approuver une demande
// @route   PUT /api/users/appeals/:id/approve
// @access  Private (Admin)
const approveAppeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { reviewMessage } = req.body;

        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé'
            });
        }

        if (!user.appeal || user.appeal.status !== 'pending') {
            return res.status(400).json({
                message: 'Aucune demande en attente pour cet utilisateur'
            });
        }

        user.appeal.status = 'approved';
        user.appeal.reviewedAt = new Date();
        user.appeal.reviewedBy = req.user?._id || null;
        user.appeal.reviewMessage = reviewMessage || '';
        user.status = 'active';

        await user.save();

        await createLog({ level: 'info', action: 'APPEAL_APPROVED', message: `Appel approuvé pour ${user.email}`, req, user: req.user, metadata: { targetUserId: id, reviewMessage } });
        res.status(200).json({
            message: 'Demande approuvée et compte réactivé'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Rejeter une demande
// @route   PUT /api/users/appeals/:id/reject
// @access  Private (Admin)
const rejectAppeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { reviewMessage } = req.body;

        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé'
            });
        }

        if (!user.appeal || user.appeal.status !== 'pending') {
            return res.status(400).json({
                message: 'Aucune demande en attente pour cet utilisateur'
            });
        }

        user.appeal.status = 'rejected';
        user.appeal.reviewedAt = new Date();
        user.appeal.reviewedBy = req.user?._id || null;
        user.appeal.reviewMessage = reviewMessage || '';

        await user.save();

        await createLog({ level: 'info', action: 'APPEAL_REJECTED', message: `Appel rejeté pour ${user.email}`, req, user: req.user, metadata: { targetUserId: id, reviewMessage } });
        res.status(200).json({
            message: 'Demande rejetée'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};


module.exports = { 
    register, 
    login, 
    logout,
    getProfile, 
    updateProfile,
    changePassword,
    forgotPassword, 
    resetPassword,
    getAllUsers,
    updateUser,
    deleteUser,
    deleteMyAccount,
    getUserById,
    activateUser,
    desactivateUser,
    banUser,
    unbanUser,
    submitAppeal,
    getAllAppeals,
    approveAppeal,
    rejectAppeal
};
