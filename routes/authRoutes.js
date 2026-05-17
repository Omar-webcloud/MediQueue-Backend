const express = require('express');
const router = express.Router();
const { register, login, googleAuth, logout, getCurrentUser } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/google-auth', googleAuth);

// Protected Routes
router.post('/logout', verifyToken, logout);
router.get('/current-user', verifyToken, getCurrentUser);

module.exports = router;
