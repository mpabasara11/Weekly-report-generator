// Load our .env file so we can use things like PORT and MONGODB_URI
require('dotenv').config();

// Express is what creates our web server
const express = require('express');

// CORS lets the React frontend talk to this backend without getting blocked
const cors = require('cors');

// Mongoose is how we talk to MongoDB
const mongoose = require('mongoose');

// This checks the JWT token on protected routes
const authenticateToken = require('./middleware/auth');

// Our route files — each one handles a different part of the app
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Create the Express app
const app = express();

// What port should we run on? Default to 5000 if not set in .env
const PORT = process.env.PORT || 5000;

// Where's the database? Default to localhost if not set in .env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weekly_reports';

// Allow the React dev server to talk to us
app.use(cors());

// Automatically parse incoming JSON request bodies
app.use(express.json());

// Also parse regular form submissions
app.use(express.urlencoded({ extended: true }));

// Try to connect to MongoDB — if it fails, we fall back to in-memory storage
console.log('Connecting to MongoDB database...');
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 3000 // give up after 3 seconds if it can't connect
  })
  .then(() => {
    console.log('Successfully connected to MongoDB database!');
  })
  .catch((err) => {
    console.warn('MongoDB connection notice:', err.message);
    console.warn('Backend server seamlessly operating in In-Memory Storage Mode for offline previewing!');
  });



// Quick health check — hit this to see if the server is alive and what database it's using
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'Online',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected (MongoDB)' : 'In-Memory Fallback Mode'
  });
});



// --- ROUTES ---

// Login and register — these are public, no token needed
app.use('/api/auth', authRoutes);

// Project routes — must be logged in
app.use('/api/projects', authenticateToken, projectRoutes);

// Report routes — must be logged in
app.use('/api/reports', authenticateToken, reportRoutes);

// Someone hit a URL that doesn't exist
app.use((req, res, next) => {
  return res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found on this server`
  });
});

// Something went wrong somewhere — catch it here so the server doesn't crash
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  return res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred',
    error: err.message
  });
});

// Start listening for requests!
app.listen(PORT, () => {
  console.log(`Weekly Report Generator backend server running on http://localhost:${PORT}`);
});

