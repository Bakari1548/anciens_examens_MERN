const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const {
  createExamRequest,
  getMyExamRequests,
  getAllExamRequests,
  getExamRequestById,
  updateExamRequestStatus,
  addExamRequestMessage,
  watchExamRequest
} = require('../controllers/examRequest.controller');

const router = express.Router();

router.post('/', authMiddleware, createExamRequest);
router.get('/my', authMiddleware, getMyExamRequests);
// Fil public accessible à tout utilisateur (façon forum)
router.get('/', getAllExamRequests);
router.get('/:id', getExamRequestById);
router.post('/:id/messages', authMiddleware, addExamRequestMessage);
router.post('/:id/watch', authMiddleware, watchExamRequest);
router.patch('/:id', adminMiddleware, updateExamRequestStatus);

module.exports = router;
