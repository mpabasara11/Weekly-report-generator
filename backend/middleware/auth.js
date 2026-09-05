// We need this to check if the JWT token is valid
const jwt = require('jsonwebtoken');

// The secret key used to sign tokens — comes from .env or falls back to a default
const JWT_SECRET = process.env.JWT_SECRET || 'weekly_report_secret_key_2026';

/**
 * This runs before any protected route.
 * It checks the Authorization header for a valid JWT token.
 * If the token is good, the user's info gets attached to req.user and the request continues.
 * If not, we block the request right here.
 */
const authenticateToken = (req, res, next) => {
  // Grab the Authorization header (works with both lowercase and uppercase)
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  // Pull out just the token part from "Bearer <token>"
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  // No token? Access denied
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    // Try to verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Stick the user info (id, email, name, role) onto the request so other handlers can use it
    req.user = decoded;

    // All good — move on to the next handler
    next();
  } catch (error) {
    // Token was invalid or expired
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token',
      error: error.message
    });
  }
};

// Export so we can plug this into any route that needs protection
module.exports = authenticateToken;

