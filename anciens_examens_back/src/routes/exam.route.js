const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { 
    getAllExams, 
    getExamBySlug, 
    postExam, 
    updateExam, 
    deleteExam 
} = require('../controllers/exam.controller');


router.get('/', getAllExams);
router.get('/:slug', getExamBySlug);
router.post('/', authMiddleware, postExam);
router.put('/:id', authMiddleware, updateExam);
router.delete('/:id', authMiddleware, deleteExam);


module.exports = router;