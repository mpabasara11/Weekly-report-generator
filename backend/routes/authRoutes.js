// Import Express framework and instantiate router handle
const express = require('express');
const router = express.Router();

// Import auth controller handlers
const { register, login, getMe } = require('../controllers/authController');

// Import authentication middleware
const authenticateToken = require('../middleware/auth');

// POST /api/auth/register - Register a new user account
router.post('/register', register);

// POST /api/auth/login - Authenticate user login credentials
router.post('/login', login);

// GET /api/auth/me - Retrieve current authenticated user session details
router.get('/me', authenticateToken, getMe);

// Export router configuration module
module.exports = router;
