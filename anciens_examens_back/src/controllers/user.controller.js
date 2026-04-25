const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
require('dotenv').config();



const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
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

        // Verifier si l'utilisateur existe deja
        const userExists = await User.findOne({ email });
        if (userExists) {
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
            res.status(201).json({
                message: "Incription reussie !",
                token: generateToken(user._id),
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

        // Verifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: 'Email incorrect'
            });
        }

        // Verifier le mot de passe
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'mot de passe incorrect'
            });
        }

        // Vérifier le statut de l'utilisateur
        if (user.status !== 'active') {
            if (user.status === 'banned') {
                return res.status(403).json({
                    message: 'Vous avez été banni'
                });
            } else if (user.status === 'inactive') {
                return res.status(403).json({
                    message: 'Votre compte a été désactivé par un admin'
                });
            }
        }

        // Generer le token
        const token = generateToken(user._id);

        res.json({
           message: "Utilisateur connectee avec succès !",
            token: token,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                ufr: user.ufr,
                filiere: user.filiere,
                role: user.role
            }
        });
    } catch (error) {
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

// @desc    Changer le mot de passe
// @route   POST /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(401).json({
                message: 'Utilisateur non trouvé'
            });
        }
        
        // Verifier le mot de passe actuel
        const isPasswordValid = await user.comparePassword(oldPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Mot de passe incorrect'
            });
        }
        
        // Mettre à jour le mot de passe
        user.password = newPassword;
        await user.save();
        
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
        
        // Envoyer l'email avec le token
        await sendEmail({
            email: user.email,
            subject: 'Réinitialisation de mot de passe',
            message: `Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien suivant pour réinitialiser votre mot de passe: ${process.env.FRONTEND_URL}/reset-password/${token}`
        });
        
        res.json({
            message: 'Un email avec un lien de réinitialisation de mot de passe a été envoyé à votre adresse email'
        });
    } catch (error) {
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
            return res.status(401).json({
                message: 'Token incorrect'
            });
        }
        
        user.password = password;
        await user.save();
        
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

// @desc    Soumettre une demande
// @route   POST /api/users/appeal
// @access  Private
const submitAppeal = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                message: 'Le message de la demande est requis'
            });
        }

        const user = await User.findById(req.user._id);
        
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
    getProfile, 
    changePassword,
    forgotPassword, 
    resetPassword,
    getAllUsers,
    updateUser,
    deleteUser,
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
