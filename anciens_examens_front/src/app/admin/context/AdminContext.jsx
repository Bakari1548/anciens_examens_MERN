import { createContext, useContext, useReducer, useEffect } from 'react';
import { adminApi } from '../services/admin.api';

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
  APPROVE_EXAM: 'APPROVE_EXAM',
  REJECT_EXAM: 'REJECT_EXAM',
  DELETE_EXAM: 'DELETE_EXAM',
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
        const response = await adminApi.getStats();
        actions.setStats(response.data);
      } catch (error) {
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    },
    
    fetchUsers: async (params = {}) => {
      try {
        actions.setLoading(true);
        const response = await adminApi.getUsers(params);
        actions.setUsers(response.data.users);
      } catch (error) {
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    },
    
    fetchExams: async (params = {}) => {
      try {
        actions.setLoading(true);
        const response = await adminApi.getExams(params);
        actions.setExams(response.data.exams);
      } catch (error) {
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    },
    
    fetchReports: async () => {
      try {
        actions.setLoading(true);
        const response = await adminApi.getReports();
        actions.setReports(response.data.reports);
      } catch (error) {
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    },
    
    updateUser: async (userId, userData) => {
      try {
        await adminApi.updateUser(userId, userData);
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
        await adminApi.deleteUser(userId);
        dispatch({ type: ADMIN_ACTIONS.DELETE_USER, payload: userId });
        actions.addNotification({
          type: 'success',
          message: 'Utilisateur supprimé avec succès'
        });
      } catch (error) {
        actions.setError(error.message);
      }
    },
    
    approveExam: async (examId) => {
      try {
        await adminApi.approveExam(examId);
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
        await adminApi.rejectExam(examId);
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
        await adminApi.deleteExam(examId);
        dispatch({ type: ADMIN_ACTIONS.DELETE_EXAM, payload: examId });
        actions.addNotification({
          type: 'success',
          message: 'Examen supprimé avec succès'
        });
      } catch (error) {
        actions.setError(error.message);
      }
    },
    
    resolveReport: async (reportId) => {
      try {
        await adminApi.resolveReport(reportId);
        dispatch({ type: ADMIN_ACTIONS.RESOLVE_REPORT, payload: reportId });
        actions.addNotification({
          type: 'success',
          message: 'Signalement résolu avec succès'
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
        const response = await adminApi.checkAdminStatus();
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
