// For hashing passwords before saving, and comparing them on login
const bcrypt = require('bcryptjs');

// For creating and signing JWT tokens
const jwt = require('jsonwebtoken');

// The User database model
const User = require('../models/User');

// The JWT secret — comes from .env
const JWT_SECRET = process.env.JWT_SECRET || 'weekly_report_secret_key_2026';

// If MongoDB isn't connected, we store users here in memory instead
let memoryUsers = [];

// Are we connected to MongoDB right now?
const isMongoConnected = () => {
  return User.db && User.db.readyState === 1;
};

// Creates a signed JWT token for a given user (valid for 7 days)
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// --- POST /api/auth/register ---
// Creates a new user account (team member or manager)
const register = async (req, res) => {
  try {
    // Pull out the registration fields from the request body
    const { name, email, password, role } = req.body;

    // Make sure they sent us the required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Lowercase the email so "Alex@example.com" and "alex@example.com" are the same
    const normalizedEmail = email.trim().toLowerCase();

    // Hash the password before saving — never store raw passwords!
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Only allow MANAGER or default to TEAM_MEMBER
    const assignedRole = role === 'MANAGER' ? 'MANAGER' : 'TEAM_MEMBER';

    if (isMongoConnected()) {
      // Make sure this email isn't already taken
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Save the new user to MongoDB
      const newUser = new User({
        name,
        email: normalizedEmail,
        passwordHash,
        role: assignedRole
      });

      const savedUser = await newUser.save();

      // Create a token so they're logged in right away
      const token = generateToken(savedUser);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role
        }
      });
    } else {
      // No MongoDB — use in-memory fallback
      const existingUser = memoryUsers.find((u) => u.email === normalizedEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create the user object in memory
      const memoryUser = {
        _id: 'user-' + Date.now(),
        name,
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
        createdAt: new Date().toISOString()
      };

      memoryUsers.push(memoryUser);

      const token = generateToken(memoryUser);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully (In-Memory Fallback)',
        token,
        user: {
          id: memoryUser._id,
          name: memoryUser.name,
          email: memoryUser.email,
          role: memoryUser.role
        }
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
};

// --- POST /api/auth/login ---
// Checks credentials and hands back a token if they're correct
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Both fields are required
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = null;

    // Look up the user — either from MongoDB or in-memory
    if (isMongoConnected()) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = memoryUsers.find((u) => u.email === normalizedEmail);
    }

    // No user found with that email
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials'
      });
    }

    // Check if the password they typed matches what we stored
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    // Wrong password
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials'
      });
    }

    // Credentials are good — give them a token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate login',
      error: error.message
    });
  }
};

// --- GET /api/auth/me ---
// Returns the currently logged-in user's info (read from the JWT by the auth middleware)
const getMe = async (req, res) => {
  try {
    // req.user is already set by the auth middleware — just return it
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  memoryUsers
};

