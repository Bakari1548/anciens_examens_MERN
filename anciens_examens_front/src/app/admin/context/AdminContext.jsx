import { createContext, useContext, useReducer, useEffect } from 'react';
import { dashboardApi } from '../services/dashboard.api';
import { usersApi } from '../services/users.api';
import { examsApi } from '../services/exams.api';
import { reportsApi } from '../services/reports.api';
import { settingsApi } from '../services/settings.api';
import { authApi } from '../services/auth.api';

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
      return {
        ...state,
        exams: state.exams.map(exam =>
          exam._id === action.payload ? { ...exam, status: 'approved' } : exam
        )
      };
    
    case ADMIN_ACTIONS.REJECT_EXAM:
      return {
        ...state,
        exams: state.exams.map(exam =>
          exam._id === action.payload ? { ...exam, status: 'rejected' } : exam
        )
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
        console.log(response);
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
        dispatch({ type: ADMIN_ACTIONS.UPDATE_USER, payload: { id: userId, data: userData } });
        actions.addNotification({
          type: 'success',
          message: 'Utilisateur mis à jour avec succès'
        });
      } catch (error) {
        actions.setError(error.message);
      }
    },
    
    deleteUser: async (userId) => {
      try {
        await usersApi.deleteUser(userId);
        dispatch({ type: ADMIN_ACTIONS.DELETE_USER, payload: userId });
        actions.addNotification({
          type: 'success',
          message: 'Utilisateur supprimé avec succès'
        });
      } catch (error) {
        actions.setError(error.message);
      }
    },

    activateUser: async (userId) => {
      try {
        await usersApi.activateUser(userId);
        dispatch({ type: ADMIN_ACTIONS.ACTIVATE_USER, payload: userId });
        actions.addNotification({
          type: 'success',
          message: 'Utilisateur activé avec succès'
        });
      } catch (error) {
        actions.setError(error.message);
      }
    },
    
    desactivateUser: async (userId) => {
      try {
        await usersApi.desactivateUser(userId);
        dispatch({ type: ADMIN_ACTIONS.DESACTIVATE_USER, payload: userId });
        actions.addNotification({
          type: 'success',
          message: 'Utilisateur désactivé avec succès'
        });
      } catch (error) {
        actions.setError(error.message);
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
      } catch (error) {
        actions.setError(error.message);
      }
    },
    
    unbanUser: async (userId) => {
      try {
        await usersApi.unbanUser(userId);
        dispatch({ type: ADMIN_ACTIONS.UNBAN_USER, payload: userId });
        actions.addNotification({
          type: 'success',
          message: 'Utilisateur débanni avec succès'
        });
      } catch (error) {
        actions.setError(error.message);
      }
    },
    
    approveExam: async (examId) => {
      try {
        await examsApi.approveExam(examId);
        dispatch({ type: ADMIN_ACTIONS.APPROVE_EXAM, payload: examId });
        actions.addNotification({
          type: 'success',
          message: 'Examen approuvé avec succès'
        });
      } catch (error) {
        actions.setError(error.message);
      }
    },
    
    rejectExam: async (examId) => {
      try {
        await examsApi.rejectExam(examId);
        dispatch({ type: ADMIN_ACTIONS.REJECT_EXAM, payload: examId });
        actions.addNotification({
          type: 'success',
          message: 'Examen rejeté avec succès'
        });
      } catch (error) {
        actions.setError(error.message);
      }
    },
    
    deleteExam: async (examId) => {
      try {
        await examsApi.deleteExam(examId);
        dispatch({ type: ADMIN_ACTIONS.DELETE_EXAM, payload: examId });
        actions.addNotification({
          type: 'success',
          message: 'Examen supprimé avec succès'
        });
      } catch (error) {
        actions.setError(error.message);
      }
    },

    addExam: async (formData) => {
      try {
        actions.setLoading(true);
        const response = await examsApi.createExam(formData);
        dispatch({ type: ADMIN_ACTIONS.ADD_EXAM, payload: response.exam });
        actions.addNotification({
          type: 'success',
          message: 'Examen créé avec succès'
        });
        return response.exam;
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
      } catch (error) {
        actions.setError(error.message);
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
