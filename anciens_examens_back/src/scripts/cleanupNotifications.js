const mongoose = require('mongoose');
const Notification = require('../models/Notification');
require('dotenv').config();

const cleanupOldNotifications = async () => {
    try {
        // Connecter à MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connecté à MongoDB');

        // Calculer la date de 2 semaines avant maintenant
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        // Supprimer les notifications de plus de 2 semaines
        const result = await Notification.deleteMany({
            createdAt: { $lt: twoWeeksAgo }
        });

        console.log(`${result.deletedCount} notifications supprimées (plus de 2 semaines)`);
    } catch (error) {
        console.error('Erreur lors du nettoyage des notifications:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Déconnecté de MongoDB');
    }
};

// Exécuter le script
cleanupOldNotifications();
