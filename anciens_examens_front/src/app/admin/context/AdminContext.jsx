import { createContext, useContext, useReducer, useEffect } from 'react';
import { dashboardApi } from '../services/dashboard.api';
import { usersApi } from '../services/users.api';
import { examsApi } from '../services/exams.api';
import { reportsApi } from '../services/reports.api';
import { settingsApi } from '../services/settings.api';
import { authApi } from '../services/auth.api';
import { notificationsApi } from '../services/notifications.api';

// État initial
const initialState = {
  user: null,
  loading: false,
  error: null,
  stats: {
    totalUsers: 0,
    totalExams: 0,
    totalDownloads: 0,
    activeUsers: 0,
    pendingExams: 0,
    reports: 0
  },
  users: [],
  exams: [],
  reports: [],
  notifications: []
};

// Actions
const ADMIN_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USER: 'SET_USER',
  SET_STATS: 'SET_STATS',
  SET_USERS: 'SET_USERS',
  SET_EXAMS: 'SET_EXAMS',
  SET_REPORTS: 'SET_REPORTS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  ACTIVATE_USER: 'ACTIVATE_USER',
  DESACTIVATE_USER: 'DESACTIVATE_USER',
  BAN_USER: 'BAN_USER',
  UNBAN_USER: 'UNBAN_USER',
  APPROVE_EXAM: 'APPROVE_EXAM',
  REJECT_EXAM: 'REJECT_EXAM',
  DELETE_EXAM: 'DELETE_EXAM',
  ADD_EXAM: 'ADD_EXAM',
  UPDATE_EXAM: 'UPDATE_EXAM',
  RESOLVE_REPORT: 'RESOLVE_REPORT'
};

// Reducer
const adminReducer = (state, action) => {
  switch (action.type) {
    case ADMIN_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ADMIN_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ADMIN_ACTIONS.SET_USER:
      return { ...state, user: action.payload };
    
    case ADMIN_ACTIONS.SET_STATS:
      return { ...state, stats: action.payload };
    
    case ADMIN_ACTIONS.SET_USERS:
      return { ...state, users: action.payload };
    
    case ADMIN_ACTIONS.SET_EXAMS:
      return { ...state, exams: action.payload };
    
    case ADMIN_ACTIONS.SET_REPORTS:
      return { ...state, reports: action.payload };
    
    case ADMIN_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50)
      };
    
    case ADMIN_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case ADMIN_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload
      };
    
    case ADMIN_ACTIONS.UPDATE_USER:
      return {
        ...state,
        users: state.users.map(user =>
          user._id === action.payload.id ? { ...user, ...action.payload.data } : user
        )
      };
    
    case ADMIN_ACTIONS.DELETE_USER:
      return {
        ...state,
        users: state.users.filter(user => user._id !== action.payload)
      };
    
    case ADMIN_ACTIONS.ACTIVATE_USER:
      return {
        ...state,
        users: state.users.map(user =>
          user._id === action.payload ? { ...user, status: 'active' } : user
        )
      };
    
    case ADMIN_ACTIONS.DESACTIVATE_USER:
      return {
        ...state,
        users: state.users.map(user =>
          user._id === action.payload ? { ...user, status: 'inactive' } : user
        )
      };
    
    case ADMIN_ACTIONS.BAN_USER:
      return {
        ...state,
        users: state.users.map(user =>
          user._id === action.payload ? { ...user, status: 'banned' } : user
        )
      };
    
    case ADMIN_ACTIONS.UNBAN_USER:
      return {
        ...state,
        users: state.users.map(user =>
          user._id === action.payload ? { ...user, status: 'active' } : user
        )
      };
    
    case ADMIN_ACTIONS.APPROVE_EXAM:
      console.log('Reducer APPROVE_EXAM triggered for examId:', action.payload);
      const updatedExams = state.exams.map(exam =>
        exam._id === action.payload ? { ...exam, status: 'approved' } : exam
      );
      console.log('Updated exams:', updatedExams);
      return {
        ...state,
        exams: updatedExams
      };
    
    case ADMIN_ACTIONS.REJECT_EXAM:
      const rejectedExams = state.exams.map(exam =>
        exam._id === action.payload ? { ...exam, status: 'rejected' } : exam
      );
      return {
        ...state,
        exams: rejectedExams
      };
    
    case ADMIN_ACTIONS.DELETE_EXAM:
      return {
        ...state,
        exams: state.exams.filter(exam => exam._id !== action.payload)
      };

    case ADMIN_ACTIONS.ADD_EXAM:
      return {
        ...state,
        exams: [action.payload, ...state.exams]
      };

    case ADMIN_ACTIONS.UPDATE_EXAM:
      return {
        ...state,
        exams: action.payload ? state.exams.map(exam =>
          exam._id === action.payload._id ? action.payload : exam
        ) : state.exams
      };

    case ADMIN_ACTIONS.RESOLVE_REPORT:
      return {
        ...state,
        reports: state.reports.filter(report => report._id !== action.payload)
      };
    
    default:
      return state;
  }
};

// Context
const AdminContext = createContext();

// Provider
export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Actions
  const actions = {
    setLoading: (loading) => dispatch({ type: ADMIN_ACTIONS.SET_LOADING, payload: loading }),
    
    setError: (error) => dispatch({ type: ADMIN_ACTIONS.SET_ERROR, payload: error }),
    
    setUser: (user) => dispatch({ type: ADMIN_ACTIONS.SET_USER, payload: user }),
    
    setStats: (stats) => dispatch({ type: ADMIN_ACTIONS.SET_STATS, payload: stats }),
    
    setUsers: (users) => dispatch({ type: ADMIN_ACTIONS.SET_USERS, payload: users }),
    
    setExams: (exams) => dispatch({ type: ADMIN_ACTIONS.SET_EXAMS, payload: exams }),
    
    setReports: (reports) => dispatch({ type: ADMIN_ACTIONS.SET_REPORTS, payload: reports }),
    
    addNotification: (notification) => {
      const id = Date.now().toString();
      dispatch({
        type: ADMIN_ACTIONS.ADD_NOTIFICATION,
        payload: { ...notification, id, timestamp: new Date() }
      });
    },
    
    removeNotification: (id) => dispatch({ type: ADMIN_ACTIONS.REMOVE_NOTIFICATION, payload: id }),
    
    fetchNotifications: async (params = {}) => {
      try {
        const response = await notificationsApi.getNotifications(params);
        dispatch({ type: ADMIN_ACTIONS.SET_NOTIFICATIONS, payload: response.notifications });
        return response;
      } catch (error) {
        actions.setError(error.message);
        throw error;
      }
    },
    
    // API Calls
    fetchStats: async () => {
      try {
        actions.setLoading(true);
        const response = await dashboardApi.getStats();
        actions.setStats(response);
      } catch (error) {
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    },
    
    fetchUsers: async (params = {}) => {
      try {
        actions.setLoading(true);
        const response = await usersApi.getUsers(params);
        actions.setUsers(response.users);
      } catch (error) {
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    },
    
    fetchExams: async (params = {}) => {
      try {
        actions.setLoading(true);
        const response = await examsApi.getExams(params);
        // console.log(response);
        actions.setExams(response.exams);
      } catch (error) {
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    },
    
    fetchReports: async () => {
      try {
        actions.setLoading(true);
        const response = await reportsApi.getReports();
        actions.setReports(response.data.reports);
      } catch (error) {
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    },
    
    updateUser: async (userId, userData) => {
      try {
        await usersApi.updateUser(userId, userData);
        dispatch({ type: ADMIN_ACTIONS.UPDATE_USER, payload: { id: userId, ...userData } });
        // Envoyer notification à l'utilisateur
        await notificationsApi.sendNotification({
          recipient: userId,
          type: 'success',
          title: 'Profil mis à jour',
          message: 'Votre profil a été mis à jour par l\'administration'
        });
        // Envoyer notification à l'admin
        await notificationsApi.sendNotification({
          recipient: state.user._id,
          type: 'success',
          title: 'Utilisateur mis à jour',
          message: 'Vous avez mis à jour un utilisateur'
        });
        actions.addNotification({
          type: 'success',
          message: 'Utilisateur mis à jour avec succès'
        });
      } catch (error) {
        actions.addNotification({
          type: 'error',
          message: 'Erreur lors de la mise à jour'
        });
      }
    },
    
    deleteUser: async (userId) => {
      try {
        await usersApi.deleteUser(userId);
        dispatch({ type: ADMIN_ACTIONS.DELETE_USER, payload: userId });
        // Envoyer notification à l'admin
        await notificationsApi.sendNotification({
          recipient: state.user._id,
          type: 'warning',
          title: 'Utilisateur supprimé',
          message: 'Vous avez supprimé un utilisateur'
        });
        actions.addNotification({
          type: 'success',
          message: 'Utilisateur supprimé avec succès'
        });
      } catch (error) {
        actions.addNotification({
          type: 'error',
          message: 'Erreur lors de la suppression'
        });
      }
    },

    activateUser: async (userId) => {
      try {
        await usersApi.activateUser(userId);
        dispatch({ type: ADMIN_ACTIONS.ACTIVATE_USER, payload: userId });
        // Envoyer notification à l'utilisateur
        await notificationsApi.sendNotification({
          recipient: userId,
          type: 'success',
          title: 'Compte activé',
          message: 'Votre compte a été activé par l\'administration'
        });
        // Envoyer notification à l'admin
        await notificationsApi.sendNotification({
          recipient: state.user._id,
          type: 'success',
          title: 'Utilisateur activé',
          message: 'Vous avez activé un utilisateur'
        });
        actions.addNotification({
          type: 'success',
          message: 'Utilisateur activé avec succès'
        });
      } catch (error) {
        actions.addNotification({
          type: 'error',
          message: 'Erreur lors de l\'activation'
        });
      }
    },
    
    desactivateUser: async (userId) => {
      try {
        await usersApi.desactivateUser(userId);
        dispatch({ type: ADMIN_ACTIONS.DESACTIVATE_USER, payload: userId });
        // Envoyer notification à l'utilisateur
        await notificationsApi.sendNotification({
          recipient: userId,
          type: 'warning',
          title: 'Compte désactivé',
          message: 'Votre compte a été désactivé par l\'administration'
        });
        // Envoyer notification à l'admin
        await notificationsApi.sendNotification({
          recipient: state.user._id,
          type: 'success',
          title: 'Utilisateur désactivé',
          message: 'Vous avez désactivé un utilisateur'
        });
        actions.addNotification({
          type: 'success',
          message: 'Utilisateur désactivé avec succès'
        });
      } catch (error) {
        actions.addNotification({
          type: 'error',
          message: 'Erreur lors de la désactivation'
        });
      }
    },
    
    banUser: async (userId, duration, reason) => {
      try {
        await usersApi.banUser(userId, duration, reason);
        dispatch({ type: ADMIN_ACTIONS.BAN_USER, payload: { id: userId, duration, reason } });
        actions.addNotification({
          type: 'success',
          message: 'Utilisateur banni avec succès'
        });
        // Envoyer notification à l'utilisateur banni
        await notificationsApi.sendNotification({
          recipient: userId,
          type: 'warning',
          title: 'Comte banni',
          message: `Votre compte a été banni pour ${duration} jours. Raison: ${reason}`
        });
        // Envoyer notification à l'admin
        await notificationsApi.sendNotification({
          recipient: state.user._id,
          type: 'success',
          title: 'Utilisateur banni',
          message: `Vous avez banni l'utilisateur pour ${duration} jours`
        });
      } catch (error) {
        actions.addNotification({
          type: 'error',
          message: 'Erreur lors du bannissement'
        });
      }
    },
    
    unbanUser: async (userId) => {
      try {
        await usersApi.unbanUser(userId);
        dispatch({ type: ADMIN_ACTIONS.UNBAN_USER, payload: userId });
        // Envoyer notification à l'utilisateur débanni
        await notificationsApi.sendNotification({
          recipient: userId,
          type: 'success',
          title: 'Comte réactivé',
          message: 'Votre compte a été réactivé avec succès'
        });
        // Envoyer notification à l'admin
        await notificationsApi.sendNotification({
          recipient: state.user._id,
          type: 'success',
          title: 'Utilisateur réactivé',
          message: 'Vous avez réactivé le compte de l\'utilisateur'
        });
      } catch (error) {
        actions.addNotification({
          type: 'error',
          message: 'Erreur lors du débannissement'
        });
      }
    },
    
    approveExam: async (examId) => {
      try {
        await examsApi.approveExam(examId);
        dispatch({ type: ADMIN_ACTIONS.APPROVE_EXAM, payload: examId });
        await actions.fetchExams();
        // Envoyer notification globale pour l'examen approuvé
        await notificationsApi.sendGlobalNotification({
          type: 'success',
          title: 'Nouvel examen disponible',
          message: 'Un nouvel examen a été approuvé et est maintenant disponible'
        });
        // Envoyer notification à l'admin
        await notificationsApi.sendNotification({
          recipient: state.user._id,
          type: 'success',
          title: 'Examen approuvé',
          message: 'Vous avez approuvé un examen'
        });
      } catch (error) {
        actions.addNotification({
          type: 'error',
          message: 'Erreur lors de l\'approbation'
        });
      }
    },
    
    rejectExam: async (examId, reason) => {
      try {
        console.log('Tentative de rejet examId:', examId, 'reason:', reason);
        await examsApi.rejectExam(examId, reason);
        await actions.fetchExams();
        dispatch({ type: ADMIN_ACTIONS.REJECT_EXAM, payload: examId });
        // Envoyer notification pour l'examen rejeté
        await notificationsApi.sendGlobalNotification({
          type: 'error',
          title: 'Examen rejeté',
          message: 'Un examen a été rejeté par l\'administration'
        });
        // Envoyer notification à l'admin
        await notificationsApi.sendNotification({
          recipient: state.user._id,
          type: 'success',
          title: 'Examen rejeté',
          message: 'Vous avez rejeté un examen'
        });
      } catch (error) {
        console.error('Erreur lors du rejet:', error);
       await notificationsApi.sendNotification({
          recipient: state.user._id,
          type: 'error',
          message: `Erreur lors du rejet: ${error.response?.data?.message || error.message}`
        });
      }
    },

    addExam: async (formData) => {
      try {
        actions.setLoading(true);
        const response = await examsApi.createExam(formData);
        dispatch({ type: ADMIN_ACTIONS.ADD_EXAM, payload: response.exam });
        // Envoyer notification globale pour le nouvel examen
        await notificationsApi.sendGlobalNotification({
          type: 'success',
          title: 'Nouvel examen ajouté',
          message: 'Un nouvel examen a été ajouté par l\'administration'
        });
        // Envoyer notification à l'admin
        await notificationsApi.sendNotification({
          recipient: state.user._id,
          type: 'success',
          title: 'Examen créé',
          message: 'Vous avez créé un nouvel examen'
        });
        return response.exam;
      } catch (error) {
        actions.setError(error.message);
        throw error;
      } finally {
        actions.setLoading(false);
      }
    },

    updateExam: async (examSlug, formData) => {
      try {
        actions.setLoading(true);
        const response = await examsApi.updateExam(examSlug, formData);
        dispatch({ type: ADMIN_ACTIONS.UPDATE_EXAM, payload: response.data || response });
        // Envoyer notification globale pour l'examen mis à jour
        await notificationsApi.sendGlobalNotification({
          type: 'success',
          title: 'Examen mis à jour',
          message: 'Un examen a été mis à jour par l\'administration'
        });
        // Envoyer notification à l'admin
        await notificationsApi.sendNotification({
          recipient: state.user._id,
          type: 'success',
          title: 'Examen mis à jour',
          message: 'Vous avez mis à jour un examen'
        });
        // Rafraîchir la liste des examens pour s'assurer que les données sont à jour
        await actions.fetchExams();
        return response.data || response;
      } catch (error) {
        actions.setError(error.message);
        throw error;
      } finally {
        actions.setLoading(false);
      }
    },

    resolveReport: async (reportId) => {
      try {
        await reportsApi.resolveReport(reportId);
        dispatch({ type: ADMIN_ACTIONS.RESOLVE_REPORT, payload: reportId });
        actions.addNotification({
          type: 'success',
          message: 'Signalement résolu avec succès'
        });
        // Envoyer notification à l'admin
        await notificationsApi.sendNotification({
          recipient: state.user._id,
          type: 'success',
          title: 'Signalement résolu',
          message: 'Vous avez résolu un signalement'
        });
      } catch (error) {
        actions.addNotification({
          type: 'error',
          message: 'Erreur lors de la résolution du signalement'
        });
      }
    },

    sendGlobalNotification: async (notification) => {
      try {
        await settingsApi.sendGlobalNotification(notification);
        actions.addNotification({
          type: 'success',
          message: 'Notification globale envoyée avec succès'
        });
      } catch (error) {
        actions.setError(error.message);
      }
    },

    sendNotificationToUsers: async (userIds, notification) => {
      try {
        await settingsApi.sendNotificationToUsers(userIds, notification);
        actions.addNotification({
          type: 'success',
          message: `Notification envoyée à ${userIds.length} utilisateurs`
        });
      } catch (error) {
        actions.setError(error.message);
      }
    }
  };

  // Vérifier si l'utilisateur est admin au chargement
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await authApi.checkAdminStatus();
        actions.setUser(response.data.user);
      } catch (error) {
        console.error('Non autorisé ou erreur admin:', error);
      }
    };
    
    checkAdminStatus();
  }, []);

  return (
    <AdminContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AdminContext.Provider>
  );
}

// Hook
export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

export { ADMIN_ACTIONS };
