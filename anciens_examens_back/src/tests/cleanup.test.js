const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Fonction de nettoyage à tester
const cleanupNotifications = async () => {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const result = await Notification.deleteMany({
      createdAt: { $lt: twoWeeksAgo }
    });
    
    console.log(`[Cleanup] ${result.deletedCount} notifications supprimées (plus de 2 semaines)`);
    return result;
  } catch (error) {
    console.error('[Cleanup] Erreur lors du nettoyage des notifications:', error);
    throw error;
  }
};

describe('Notification Cleanup Tests', () => {
  let testUser, testAdmin;

  beforeAll(async () => {
    testAdmin = await User.create({
      firstName: 'Admin',
      lastName: 'Test',
      email: 'admin@univ-thies.sn',
      password: 'password123',
      role: 'admin',
      status: 'active'
    });
    
    testUser = await User.create({
      firstName: 'User',
      lastName: 'Test',
      email: 'user@univ-thies.sn',
      password: 'password123',
      role: 'user',
      status: 'active',
      ufr: 'UFR Test',
      filiere: 'Informatique'
    });
  });

  test('Devrait supprimer les notifications de plus de 2 semaines', async () => {
    // Créer une notification de 3 semaines
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    
    const oldNotification = await Notification.create({
      recipient: testUser._id,
      type: 'system',
      title: 'Ancienne notification',
      message: 'Cette notification a plus de 2 semaines',
      read: false,
      createdAt: threeWeeksAgo
    });

    // Créer une notification récente (1 semaine)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentNotification = await Notification.create({
      recipient: testUser._id,
      type: 'success',
      title: 'Notification récente',
      message: 'Cette notification a moins de 2 semaines',
      read: false,
      createdAt: oneWeekAgo
    });

    // Exécuter le nettoyage
    const result = await cleanupNotifications();

    // Vérifier que seule l'ancienne notification a été supprimée
    expect(result.deletedCount).toBe(1);
    
    const oldNotificationExists = await Notification.findById(oldNotification._id);
    const recentNotificationExists = await Notification.findById(recentNotification._id);
    
    expect(oldNotificationExists).toBeNull();
    expect(recentNotificationExists).not.toBeNull();
  });

  test('Ne devrait rien supprimer si aucune notification n\'a plus de 2 semaines', async () => {
    // Créer des notifications récentes
    await Notification.create({
      recipient: testUser._id,
      type: 'system',
      title: 'Notification 1',
      message: 'Message 1',
      read: false
    });

    await Notification.create({
      recipient: testAdmin._id,
      type: 'success',
      title: 'Notification 2',
      message: 'Message 2',
      read: false
    });

    // Exécuter le nettoyage
    const result = await cleanupNotifications();

    // Vérifier qu'aucune notification n'a été supprimée
    expect(result.deletedCount).toBe(0);
  });

  test('Devrait supprimer uniquement les notifications exactement à la limite de 2 semaines', async () => {
    // Créer une notification exactement à 2 semaines
    const exactlyTwoWeeksAgo = new Date();
    exactlyTwoWeeksAgo.setDate(exactlyTwoWeeksAgo.getDate() - 14);
    exactlyTwoWeeksAgo.setHours(0, 0, 0, 0);
    
    const boundaryNotification = await Notification.create({
      recipient: testUser._id,
      type: 'system',
      title: 'Notification limite',
      message: 'Cette notification a exactement 2 semaines',
      read: false,
      createdAt: exactlyTwoWeeksAgo
    });

    // Créer une notification légèrement plus récente (13 jours)
    const thirteenDaysAgo = new Date();
    thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13);
    
    const recentNotification = await Notification.create({
      recipient: testUser._id,
      type: 'success',
      title: 'Notification récente',
      message: 'Cette notification a 13 jours',
      read: false,
      createdAt: thirteenDaysAgo
    });

    // Exécuter le nettoyage
    const result = await cleanupNotifications();

    // Vérifier que seule la notification à la limite a été supprimée
    expect(result.deletedCount).toBe(1);
    
    const boundaryNotificationExists = await Notification.findById(boundaryNotification._id);
    const recentNotificationExists = await Notification.findById(recentNotification._id);
    
    expect(boundaryNotificationExists).toBeNull();
    expect(recentNotificationExists).not.toBeNull();
  });

  test('Devrait gérer le cas où il n\'y a aucune notification', async () => {
    // S'assurer qu'il n'y a aucune notification
    await Notification.deleteMany({});

    // Exécuter le nettoyage
    const result = await cleanupNotifications();

    // Vérifier qu'aucune erreur n'est levée et que le résultat est correct
    expect(result.deletedCount).toBe(0);
  });

  test('Devrait supprimer les notifications de tous les utilisateurs', async () => {
    // Créer des notifications anciennes pour plusieurs utilisateurs
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    
    await Notification.create({
      recipient: testUser._id,
      type: 'system',
      title: 'Ancienne notification user',
      message: 'Message',
      read: false,
      createdAt: threeWeeksAgo
    });

    await Notification.create({
      recipient: testAdmin._id,
      type: 'success',
      title: 'Ancienne notification admin',
      message: 'Message',
      read: false,
      createdAt: threeWeeksAgo
    });

    // Exécuter le nettoyage
    const result = await cleanupNotifications();

    // Vérifier que les deux notifications ont été supprimées
    expect(result.deletedCount).toBe(2);
  });
});
