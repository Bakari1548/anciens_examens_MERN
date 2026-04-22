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
        const { firstName, lastName, email, password } = req.body;

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
            password
        });

        if (user) {
            res.status(201).json({
                message: "Incription reussie !",
                token: generateToken(user._id),
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: user.password
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

        // Generer le token
        const token = generateToken(user._id);

        res.json({
           message: "Utilisateur connectee avec succès !",
            token: token,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
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

module.exports = { 
    register, 
    login, 
    getProfile, 
    changePassword,
    forgotPassword, 
    resetPassword 
};