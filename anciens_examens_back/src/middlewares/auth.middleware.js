const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();


const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    try {
        if (!token) {
            // console.log("Token requis : ", req.user);
            return res.status(401).json({ message: 'Token d\'accès requis' });
        }
        
        const decodedToken = jwt.verify(token, JWT_SECRET);
        
        // console.log( "token : ", token, "decode token : ", decodedToken);
        const user = await User.find({_id: decodedToken.userId}).select('-password');
        // console.log("User : ", user);
        if (!user) {
            return res.status(401).json({ message: 'Token invalide' });
        }
        // console.log("Users : ", user[0]);
        
        // Vérifier le statut de l'utilisateur
        if (user[0].status !== 'active') {
            if (user[0].status === 'banned') {
                return res.status(403).json({ message: 'Votre compte a été banni' });
            } else if (user[0].status === 'inactive') {
                return res.status(403).json({ message: 'Votre compte a été désactivé' });
            }
        }
        
        req.user = user[0];
        next();
    } catch (err) {
        res.status(401).json({ 
            message: 'Erreur lors de la verification de l\'utilisateur',
            error: err
         });
    }
};

module.exports = authMiddleware;