const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const adminMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    try {
        if (!token) {
            return res.status(401).json({ message: 'Token d\'accès requis' });
        }
        
        const decodedToken = jwt.verify(token, JWT_SECRET);
        
        const user = await User.find({_id: decodedToken.userId}).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Token invalide' });
        }
        
        if (user[0].role !== 'admin') {
            return res.status(403).json({ message: 'Accès refusé. Rôle admin requis.' });
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

module.exports = adminMiddleware;