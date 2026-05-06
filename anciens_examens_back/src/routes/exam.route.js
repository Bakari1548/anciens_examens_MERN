const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { upload } = require('../config/cloudinary');
const { 
    getAllExams, 
    getExamBySlug, 
    getUserExams,
    postExam, 
    updateExam, 
    deleteExam
} = require('../controllers/exam.controller');
const {
    likeExam,
    unlikeExam,
    addComment,
    deleteComment,
    getComments,
    getLikeStatus
} = require('../controllers/social.controller');


router.get('/', getAllExams);
router.get('/user', authMiddleware, getUserExams);
router.get('/:slug', getExamBySlug);
router.post('/', authMiddleware, upload.array('files', 5), postExam);
router.put('/:slug', authMiddleware, updateExam);
router.delete('/:slug', authMiddleware, deleteExam);

// Routes pour les likes
router.get('/:slug/like/status', authMiddleware, getLikeStatus);
router.post('/:slug/like', authMiddleware, likeExam);
router.delete('/:slug/like', authMiddleware, unlikeExam);

// Routes pour les commentaires
router.get('/:slug/comments', getComments);
router.post('/:slug/comments', authMiddleware, addComment);
router.delete('/:slug/comments/:commentId', authMiddleware, deleteComment);


module.exports = router;