const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Routes protégées par le middleware auth
router.get('/profile', authMiddleware, getProfile);
router.put('/change-password', authMiddleware, changePassword);
router.post('/appeal', authMiddleware, submitAppeal);

// Routes protégées par le middleware admin
router.get('/all/:page/:limit', adminMiddleware, getAllUsers);
router.put('/update/:id', adminMiddleware, updateUser);
router.delete('/delete/:id', adminMiddleware, deleteUser);
router.get('/get/:id', adminMiddleware, getUserById);
router.put('/activate/:id', adminMiddleware, activateUser);
router.put('/desactivate/:id', adminMiddleware, desactivateUser);
router.put('/ban/:id', adminMiddleware, banUser);
router.put('/unban/:id', adminMiddleware, unbanUser);
router.get('/appeals', adminMiddleware, getAllAppeals);
router.put('/appeals/:id/approve', adminMiddleware, approveAppeal);
router.put('/appeals/:id/reject', adminMiddleware, rejectAppeal);

module.exports = router;