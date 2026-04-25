export const ENDPOINTS = {
    // Routes Utilisateurs
    USERS: {
        // Routes publiques
        REGISTER: '/users/register',
        LOGIN: '/users/login',
        FORGOT_PASSWORD: '/users/forgot-password',
        RESET_PASSWORD: '/users/reset-password/:token',
        
        // Routes protégées
        PROFILE: '/users/profile',
        CHANGE_PASSWORD: '/users/change-password',
        
        // Routes administratives
        GET_ALL: '/users/all',
        GET_BY_ID: '/users/get/:id',
        DELETE: '/users/delete/:id'
    },
    
    // Routes Examens
    EXAMS: {
        // Routes publiques
        LIST: '/exams',
        GET_BY_SLUG: '/exams/:slug',
        
        // Routes protégées
        CREATE: '/exams',
        UPDATE: '/exams/:slug',
        DELETE: '/exams/:slug',
        
        // Routes de commentaires
        ADD_COMMENT: '/exams/:id/comment',
        DELETE_COMMENT: '/exams/:id/comment/:commentId',
        
        // Routes de likes
        LIKE: '/exams/:id/like',
        UNLIKE: '/exams/:id/like'
    },
    
    // Routes Admin (si séparées)
    ADMIN: {
        CHECK_STATUS: '/admin/check-status',
        STATS: '/admin/stats',
        ANALYTICS: '/admin/analytics',
        USERS: '/admin/users',
        USER_DETAIL: '/admin/users/:id',
        EXAMS: '/admin/exams',
        EXAM_DETAIL: '/admin/exams/:id',
        REPORTS: '/admin/reports',
        REPORT_DETAIL: '/admin/reports/:id',
        NOTIFICATIONS: '/admin/notifications',
        SETTINGS: '/admin/settings'
    },
    
    // Paramètres de requête pour pagination et filtres
    QUERY_PARAMS: {
        // Pagination
        PAGE: 'page',
        LIMIT: 'limit',
        SORT_BY: 'sortBy',
        SORT_ORDER: 'sortOrder',
        
        // Filtres pour examens
        SEARCH: 'search',
        FILIERE: 'filiere',
        UFR: 'ufr',
        MATIERE: 'matiere',
        YEAR: 'year'
    }
};