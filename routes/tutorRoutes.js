const express = require('express');
const router = express.Router();
const {
  createTutor,
  getAllTutors,
  getTutorById,
  updateTutor,
  deleteTutor,
  getMyTutors,
} = require('../controllers/tutorController');
const { verifyToken } = require('../middleware/auth');

// Public Routes
router.get('/', getAllTutors);
router.get('/:id', getTutorById);

// Protected Routes
router.post('/', verifyToken, createTutor);
router.put('/:id', verifyToken, updateTutor);
router.delete('/:id', verifyToken, deleteTutor);
router.get('/my-tutors/list', verifyToken, getMyTutors);

module.exports = router;
