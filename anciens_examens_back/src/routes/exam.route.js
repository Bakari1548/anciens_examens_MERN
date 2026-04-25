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


router.get('/', getAllExams);
router.get('/user', authMiddleware, getUserExams);
router.get('/:slug', getExamBySlug);
router.post('/', authMiddleware, upload.single('file'), postExam);
router.put('/:slug', authMiddleware, updateExam);
router.delete('/:slug', authMiddleware, deleteExam);


module.exports = router;